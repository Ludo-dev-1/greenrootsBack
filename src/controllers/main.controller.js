import { Article, Order, ArticleHasOrder, Tracking, ArticleTracking, Picture, Category, sequelize } from "../models/association.js";

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
};

export default mainController;