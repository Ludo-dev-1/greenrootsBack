import { Article, Order, ArticleHasOrder, Tracking, ArticleTracking, Picture, User, sequelize } from "../models/association.js";
import { sendEmail } from "../services/emailService.js";
import { withTransaction } from "../utils/commonOperations.js";
import { STATUS_CODES, ERROR_MESSAGES } from "../utils/constants.js";

const orderController = {
    createOrder: async (req, res, next) => {
        /*
            - Valide et calcule le prix total des articles commandés
            - Crée une nouvelle entrée dans la table Order
            - Crée des entrées dans ArticleHasOrder pour chaque article de la commande
            - Crée un suivi global de la commande dans Tracking
            - Crée des suivis individuels pour chaque article dans ArticleTracking
        */
        try {
            // Extraction des données de la requête
            const userId = req.user.id;
            const { articles } = req.body;

            // Vérification de la validité des données
            if (!articles || !Array.isArray(articles) || articles.length === 0) {
                const error = new Error(ERROR_MESSAGES.INVALID_INPUT + "(Les articles sont obligatoires pour passer une commande.)");
                error.statusCode = STATUS_CODES.BAD_REQUEST;
                return next(error);
            }

            const result = await withTransaction(async (transaction) => {

                // Calcul du prix total et préparation des détails des articles
                let total_price = 0;
                const articleDetails = [];

                for (const articleInfo of articles) {
                    // Récupération des informations de l'article
                    const article = await Article.findByPk(articleInfo.id, { transaction });
                    if (!article) {
                        const error = new Error(ERROR_MESSAGES.RESOURCE_NOT_FOUND + ` (Article avec l'ID ${articleInfo.id} non trouvé)`);
                        error.statusCode = STATUS_CODES.NOT_FOUND;
                        throw error;
                    }
                    // Calcul du prix pour cet article
                    const articlePrice = article.price * articleInfo.quantity;
                    total_price += articlePrice;
                    articleDetails.push({
                        name: article.name,
                        quantity: articleInfo.quantity,
                        price: articlePrice,
                        id: article.id
                    });
                }

                // Création du résumé des articles pour la commande
                const article_summary = articleDetails.map(ad => `${ad.quantity}x ${ad.name}`).join(", ");

                // Création de la commande (entrée dans la table Order)
                const newOrder = await Order.create({
                    article_summary,
                    total_price,
                    date: new Date(),
                    user_id: userId
                }, { transaction });

                // Création du suivi global de la commande dans la table Tracking
                await Tracking.create({
                    status: "Commande passée",
                    order_id: newOrder.id,
                }, { transaction });

                // Création des relations ArticleHasOrder et des suivis individuels
                for (const articleDetail of articleDetails) {
                    // Création de l'entrée dans ArticleHasOrder si elle n'existe pas déjà
                    const [articleHasOrder, created] = await ArticleHasOrder.findOrCreate({
                        where: {
                            order_id: newOrder.id,
                            article_id: articleDetail.id,
                            quantity: articleDetail.quantity
                        },
                        transaction
                    });

                    if (!created) {
                        // Si l'entrée existe déjà, mise à jour de la quantité
                        await articleHasOrder.update({
                            quantity: articleHasOrder.quantity + articleDetail.quantity
                        }, { transaction });
                    }

                    // Récupération des informations de l'article, y compris l'image
                    const article = await Article.findByPk(articleDetail.id, {
                        include:
                            [Picture],
                        transaction
                    });

                    // Création d'un suivi pour chaque exemplaire de l'article
                    for (let i = 0; i < articleDetail.quantity; i++) {
                        await ArticleTracking.create({
                            growth: "En attente de plantation",
                            status: "Commande passée",
                            plant_place: "À définir",
                            article_id: articleDetail.id,
                            article_has_order_id: articleHasOrder.id,
                            picture_id: article.picture_id
                        }, { transaction });
                    }
                }

                // Récupération des informations de l'utilisateur pour l'e-mail
                const user = await User.findByPk(userId, { transaction });
                const email = user.email;
                const firstname = user.firstname;
    
                // Envoi de l'e-mail de confirmation de commande
                await sendEmail(email, "Confirmation de commande", "newOrder", { 
                    firstname, 
                    createdAt: newOrder.date,
                    orderId: newOrder.id,
                    articleDetails,
                    totalPrice: newOrder.total_price
                });

                return { newOrder, articleDetails };
            });

            // Réponse avec les détails de la commande créée
            res.status(STATUS_CODES.CREATED).json({
                message: "Commande créée avec succès",
                order: {
                    id: result.newOrder.id,
                    article_summary: result.newOrder.article_summary,
                    total_price: result.newOrder.total_price,
                    date: result.newOrder.date
                },
                articleDetails: result.articleDetails
            });
        } catch (error) {
            next(error);
        }
    },

    // Récupération des détails d'une commande spécifique
    getOrderDetails: async (req, res, next) => {
        try {
            // Extraction des données de la requête
            const orderId = req.params.id;
            const userId = req.user.id;

            // Recherche de la commande dans la BDD
            const order = await Order.findOne({
                // Filtre pour trouver la commande spécifique
                where: { id: orderId },
                include: [
                    {
                        model: Article,
                        as: "articles",
                        // Inclusion des informations de la table de jonction
                        through: {
                            model: ArticleHasOrder,
                            attributes: ["quantity"]
                        },
                    }
                ]
            });

            // Vérification de l'existence de la commande
            if (!order) {
                const error = new Error(ERROR_MESSAGES.RESOURCE_NOT_FOUND + " (Commande)");
                error.statusCode = STATUS_CODES.NOT_FOUND;
                return next(error);
            }

            // Vérification que l'utilisateur est bien le propriétaire de la commande
            if (order.user_id !== userId) {
                const error = new Error(ERROR_MESSAGES.UNAUTHORIZED_ACCESS);
                error.statusCode = STATUS_CODES.FORBIDDEN;
                return next(error);
            }

            // Réponse avec les détails de la commande
            res.status(OK).json(order);
        } catch (error) {
            next(error);
        }
    },

    // Récupération du suivi de tous les articles d'une commande spécifique
    getOrderTracking: async (req, res, next) => {
        try {
            // Extraction des données de la requête
            const orderId = req.params.id;
            const userId = req.user.id;

            // Recherche de la commande dans la base de données
            const order = await Order.findOne({
                where: { id: orderId },
                // Inclusion des données associées (jointures)
                include: [
                    {
                        model: Article,
                        as: "articles",
                        // Inclusion des informations de la table de jonction ArticleHasOrder
                        through: {
                            model: ArticleHasOrder,
                            attributes: ["quantity"]
                        },
                        // Inclusion des suivis pour chaque article
                        include: [
                            {
                                model: ArticleTracking,
                                include: [Picture] // Inclusion des images pour chaque suivi
                            }
                        ]
                    }
                ]
            });

            // Si aucune commande n'est trouvée, renvoie une erreur STATUS_CODES.NOT_FOUND
            if (!order) {
                const error = new Error(ERROR_MESSAGES.RESOURCE_NOT_FOUND + " (Commande)");
                error.statusCode = STATUS_CODES.NOT_FOUND;
                return next(error);
            }

            // Vérification que l'utilisateur est bien le propriétaire de la commande
            if (order.user_id !== userId) {
                const error = new Error(ERROR_MESSAGES.UNAUTHORIZED_ACCESS);
                error.statusCode = STATUS_CODES.FORBIDDEN;
                return next(error);
            }

            /* // Formatage des données de la commande pour la réponse
            const formattedOrder = {
                id: order.id,
                article_summary: order.article_summary,
                date: order.date,
                total_price: order.total_price,
                // Transformation des données de chaque article
                articles: order.articles.map(article => ({
                    name: article.name,
                    quantity: article.ArticleHasOrder.quantity,
                    // Calcul du prix total pour cet article
                    price: parseFloat(article.price) * article.ArticleHasOrder.quantity,
                    // Transformation des données de suivi pour chaque exemplaire de l'article
                    trackings: article.ArticleTrackings.map(tracking => ({
                        id: tracking.id,
                        status: tracking.status,
                        growth: tracking.growth,
                        plant_place: tracking.plant_place,
                        picture_url: tracking.Picture.url
                    }))
                }))
            }; */

            // Réponse (pour la réponse formatée, modifier "order" en "formattedOrder")
            res.status(OK).json(order);
        } catch (error) {
            next(error);
        }
    },

    // Récupération du suivi d'un article spécifique d'une commande spécifique
    getArticleTracking: async (req, res, next) => {
        try {
            // Extraction des données de la requête
            const orderId = req.params.orderId;
            const articleTrackingId = req.params.articleTrackingId;
            const userId = req.user.id;

            // Recherche du suivi d'article spécifique dans la base de données
            const articleTracking = await ArticleTracking.findOne({
                where: { id: articleTrackingId }, // Recherche le suivi par son ID
                include: [
                    {
                        // Inclut les informations de la relation Article-Commande
                        model: ArticleHasOrder,
                        include: [
                            {
                                model: Order,
                                // Vérifie que la commande appartient à l'utilisateur
                                where: { id: orderId, user_id: userId }
                            },
                            {
                                // Inclut les informations de l'article
                                model: Article
                            }
                        ]
                    },
                    {
                        // Inclut l'image associée au suivi
                        model: Picture
                    }
                ]
            });

            // Si aucun suivi d'article (!articleTracking) n'est trouvé ou si l'utilisateur n'a pas accès à cette commande (!articleTracking.ArticleHasOrder.Order)
            if (!articleTracking || !articleTracking.ArticleHasOrder.Order) {
                const error = new Error(ERROR_MESSAGES.RESOURCE_NOT_FOUND + " (Suivi d'article non trouvé ou non autorisé)");
                error.statusCode = STATUS_CODES.NOT_FOUND;
                return next(error);
            }

            // Vérification que l'utilisateur est bien le propriétaire de la commande
            if (articleTracking.ArticleHasOrder.Order.user_id !== userId) {
                const error = new Error(ERROR_MESSAGES.UNAUTHORIZED_ACCESS);
                error.statusCode = STATUS_CODES.FORBIDDEN;
                return next(error);
            }

            // Formatage des données du suivi d'article pour la réponse
            /*             const formattedTracking = {
                            orderId: orderId,
                            // Extrait le nom de l'article associé au suivi
                            articleName: articleTracking.ArticleHasOrder.Article.name,
                            status: articleTracking.status,
                            growth: articleTracking.growth,
                            plant_place: articleTracking.plant_place,
                            picture_url: articleTracking.Picture
                        }; */

            // Réponse (pour la réponse formatée, modifier "articleTracking" en "formattedTracking")
            res.status(OK).json(articleTracking);
        } catch (error) {
            next(error);
        }
    },

    // Personnalisation du nom d'un article acheté
    updateArticleTrackingName: async (req, res, next) => {
        try {
            const { orderId, articleTrackingId } = req.params;
            const { nickname } = req.body;
            const userId = req.user.id;

            const result = await withTransaction(async (transaction) => {
                const articleTracking = await ArticleTracking.findOne({
                    where: { id: articleTrackingId },
                    include: [
                        {
                            model: ArticleHasOrder,
                            include: [
                                {
                                    model: Order,
                                    where: { id: orderId, user_id: userId }
                                }
                            ]
                        }
                    ],
                    transaction
                });

                if (!articleTracking) {
                    const error = new Error(ERROR_MESSAGES.RESOURCE_NOT_FOUND + " (Suivi d'article non trouvé");
                    error.statusCode = STATUS_CODES.NOT_FOUND;
                    throw error;
                }

                // Vérification que l'utilisateur est bien le propriétaire de la commande
                if (articleTracking.ArticleHasOrder.Order.user_id !== userId) {
                    const error = new Error(ERROR_MESSAGES.UNAUTHORIZED_ACCESS);
                    error.statusCode = STATUS_CODES.FORBIDDEN;
                    throw error;
                }

                articleTracking.nickname = nickname;

                await articleTracking.save({ transaction });

                // Récupération des informations de l'utilisateur pour l'e-mail
                const user = await User.findByPk(userId, { transaction });
                const email = user.email;
                const firstname = user.firstname;
    
                // Envoi de l'e-mail de confirmation de commande
                await sendEmail(email, "Nouvelles informations concernant le suivi de votre arbre", "newNicknameUpdate", { firstname, nickname: articleTracking.nickname });

                return articleTracking;
            });

            res.status(OK).json({
                message: "Nom personnalisé de l'article mis à jour avec succès",
                articleTracking: {
                    id: result.id,
                    nickname: result.nickname
                }
            });
        } catch (error) {
            next(error);
        }
    }
}

export default orderController;