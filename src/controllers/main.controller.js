import { Article, Order, Picture } from "../models/association.js";

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
        try {
            const userId = req.user.id;
            const { article_summary, price } = req.body;

            if (!article_summary || !price) {
                error.statusCode = 404;
                return next(error);
            }

            const newOrder = await Order.create({
                article_summary,
                price,
                date: new Date(),
                user_id: userId
            });

            res.status(201).json({
                message: "Commande créée avec succès",
                order: newOrder
            });
        } catch (error) {
            error.statusCode = 500;
            return next(error);
        }
    },
};

export default mainController;