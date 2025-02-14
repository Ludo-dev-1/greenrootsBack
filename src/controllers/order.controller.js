import { Article, Order, ArticleHasOrder, Tracking, ArticleTracking, Picture, sequelize } from "../models/association.js";

const orderController = {
    createOrder: async (req, res, next) => {
        /*
            - Valide et calcule le prix total des articles commandés
            - Crée une nouvelle entrée dans la table Order
            - Crée des entrées dans ArticleHasOrder pour chaque article de la commande
            - Crée un suivi global de la commande dans Tracking
            - Crée des suivis individuels pour chaque article dans ArticleTracking
        */
            const transaction = await sequelize.transaction();
            try {
                // Extraction des données de la requête
                const userId = req.user.id;
                const { articles } = req.body;
    
                // Vérification de la validité des données
                if (!articles || !Array.isArray(articles) || articles.length === 0) {
                    return res.status(400).json({ error: "Les articles sont obligatoires pour passer une commande." });
                }
    
                // Calcul du prix total et préparation des détails des articles
                let total_price = 0;
                const articleDetails = [];
    
                for (const articleInfo of articles) {
                    // Récupération des informations de l'article
                    const article = await Article.findByPk(articleInfo.id, { transaction });
                    if (!article) {
                        throw new Error(`Article avec l'ID ${articleInfo.id} non trouvé`);
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
                const article_summary = articleDetails.map(ad => `${ad.quantity}x ${ad.name}`).join(', ');
    
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
    
                // Validation de la transaction
                await transaction.commit();
    
                // Réponse avec les détails de la commande créée
                res.status(201).json({
                    message: "Commande créée avec succès",
                    order: {
                        id: newOrder.id,
                        article_summary: newOrder.article_summary,
                        total_price: newOrder.total_price,
                        date: newOrder.date
                    },
                    articleDetails: articleDetails
                });
            } catch (error) {
                await transaction.rollback();
                error.statusCode = 500;
                return next(error);
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
                // Filtre pour trouver la commande spécifique de l'utilisateur connecté
                where: { id: orderId, user_id: userId },
                include: [
                    {
                        model: Article,
                        as: "articles",
                        // Inclusion des informations de la table de jonction
                        through: { 
                            model: ArticleHasOrder,
                            attributes: ["quantity"] // On ne récupère que la quantité
                        },
                    }
                ]
            });

            // Vérification de l'existence de la commande
            if (!order) {
                error.statusCode = 404;
                return next(error);
            }

            // Réponse avec les détails de la commande
            res.status(200).json(order);
        } catch (error) {
            error.statusCode = 500;
            return next(error);
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
                where: { id: orderId, user_id: userId },
                // Inclusion des données associées (jointures)
                include: [
                    {
                        model: Article,
                        as: "articles",
                        // Inclusion des informations de la table de jonction ArticleHasOrder
                        through: { 
                            model: ArticleHasOrder,
                            attributes: ["quantity"] // On ne récupère que la quantité
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

            // Si aucune commande n'est trouvée, renvoie une erreur 404
            if (!order) {
                return res.status(404).json({ error: "Commande non trouvée" });
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
            res.status(200).json(order);
        } catch (error) {
            error.statusCode = 500;
            return next(error);
        }
    },

    // Récupération du suivi d'un article spécifique d'une commande spécifique
    getArticleTracking: async (req, res, next) => {
        try {
            // Extraction des données de la requête
            const orderId = req.params.orderId;
            const trackingId = req.params.trackingId;
            const userId = req.user.id;

            // Recherche du suivi d'article spécifique dans la base de données
            const articleTracking = await ArticleTracking.findOne({
                where: { id: trackingId }, // Recherche le suivi par son ID
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
                return res.status(404).json({ error: "Suivi d'article non trouvé ou non autorisé" });
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
            res.status(200).json(articleTracking);
        } catch (error) {
            error.statusCode = 500;
            return next(error);
        }
    }
}

export default orderController;