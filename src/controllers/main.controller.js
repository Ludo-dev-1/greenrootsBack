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
        const transaction = await sequelize.transaction();
        try {
            const userId = req.user.id;
            const { article_summary, price } = req.body;

            if (!article_summary || !price) {
                return res.status(400).json({ error: "Le résumé des articles et le prix sont obligatoires pour passer une commande." });
            }

            const articleNames = [];
            for (const article of article_summary) {
                const articleData = await Article.findByPk(article.id, {transaction});
                if (articleData) {
                    articleNames.push(articleData.name)
                } else {
                    throw new Error(`Article avec l'id ${article.id} non trouvé.`)
                }
            }

            // Création de la commande
            const newOrder = await Order.create({
                article_summary: article_summary.join(', '),
                price,
                date: new Date(),
                user_id: userId
            }, { transaction });

            for (const article of article_summary) {
                await ArticleHasOrder.create({
                    order_id: newOrder.id,
                    article_id: article.id,
                    quantity: article.quantity
                }, { transaction })
            };

            const pictures = await Picture.findAll({
                transaction
            });

            // Création d'un suivi pour la commande
            for (const article of article_summary) {
                await Tracking.create({
                    growth: "En attente de plantation",
                    status: "Commande passée",
                    plant_place: "A définir",
                    order_id: newOrder.id,
                    article_id: article.id,
                    picture_id: pictures[0].id
                }, { transaction });

            }


            // Validation de la transaction
            await transaction.commit();

            res.status(201).json({
                message: "Commande créée avec succès",
                order: newOrder,

            });
        } catch (error) {
            await transaction.rollback();
            error.statusCode = 500;
            return next(error);
        }
    },
};

export default mainController;