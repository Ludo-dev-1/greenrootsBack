import { Article, Order, ArticleHasOrder, Tracking, Picture, sequelize, Category } from "../models/association.js";

const mainController = {
    // Récupération de tous les articles nouvellement créés
    getNewArticles: async (req, res, next) => {
        try {
            const articles = await Article.findAll({
                order: [["created_at", "DESC"]],
                include: [{ model: Picture }]
            });

            if (!articles) {
                error.statusCode = 404;
                return next(error);
            };

            res.status(200).json({ articles });

        } catch (error) {
            error.statusCode = 500;
            return next(error);
        }
    },

    // Récupération de tous les articles
    getAllArticles: async (req, res, next) => {
        try {
            const articles = await Article.findAll({
                include: [
                    { model: Picture },
                    { model: Category, as: "categories" }
                ]
            });

            if (!articles) {
                error.statusCode = 404;
                return next(error);
            };

            res.status(200).json({ articles });

        } catch (error) {
            error.statusCode = 500;
            return next(error);
        }
    },

    // Récupération d'un seul article
    getOneArticle: async (req, res, next) => {
        try {
            const articleId = req.params.id;

            const oneArticle = await Article.findByPk(articleId, {
                include: [{ model: Picture }]
            });

            if (!oneArticle) {
                const newError = new Error("Cet arbre n'existe pas ou a été retiré !");
                newError.statusCode = 404;
                return next(newError);
            };

            res.status(200).json(oneArticle);
        } catch (error) {
            error.statusCode = 500;
            return next(error);
        }
    },

    getCGU: async (req, res, next) => {
        try {
            res.status(200).json({ message: "Conditions Générales d'Utilisation" });

        } catch (error) {
            error.statusCode = 500;
            return next(error);
        }
    },

    getOrderPage: async (req, res, next) => {
        try {
            res.status(200).json({ message: "Pages de commandes" });

        } catch (error) {
            error.statusCode = 500;
            return next(error);
        }
    },

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
            const userId = req.user.id;
            const { articles } = req.body;

            // Vérification de la validité des données
            if (!articles || !Array.isArray(articles) || articles.length === 0) {
                return res.status(400).json({ error: "Les articles sont obligatoires pour passer une commande." });
            }

            let total_price = 0;
            const articleDetails = [];

            // Calcul du prix total et préparation des détails des articles
            for (const articleInfo of articles) {
                const article = await Article.findByPk(articleInfo.id, { transaction });
                if (!article) {
                    throw new Error(`Article avec l'ID ${articleInfo.id} non trouvé`);
                }
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
                // Création de l'entrée dans ArticleHasOrder
                const articleHasOrder = await ArticleHasOrder.create({
                    order_id: newOrder.id,
                    article_id: articleDetail.id,
                    quantity: articleDetail.quantity
                }, { transaction });

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
                        article_has_order_id: articleHasOrder.id,
                        picture_id: article.picture ? article.picture.id: null
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
};

export default mainController;