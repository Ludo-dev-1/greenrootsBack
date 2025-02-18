import { Article, Picture, Category } from "../models/association.js";
import { STATUS_CODES, ERROR_MESSAGES } from "../utils/constants.js";

const mainController = {
    // Récupération de tous les articles nouvellement créés
    getNewArticles: async (req, res, next) => {
        try {
            const articles = await Article.findAll({
                order: [["created_at", "DESC"]],
                include: [{ model: Picture }]
            });

            if (!articles || articles.length === 0) {
                const error = new Error(ERROR_MESSAGES.RESOURCE_NOT_FOUND);
                error.statusCode = STATUS_CODES.NOT_FOUND;
                return next(error);
            };

            res.status(STATUS_CODES.OK).json({ articles });

        } catch (error) {
            next(error);
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

            if (!articles || articles.length === 0) {
                const error = new Error(ERROR_MESSAGES.RESOURCE_NOT_FOUND);
                error.statusCode = STATUS_CODES.NOT_FOUND;
                return next(error);
            };

            res.status(STATUS_CODES.OK).json({ articles });

        } catch (error) {
            next(error);
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
                const error = new Error("Cet arbre n'existe pas ou a été retiré !");
                error.statusCode = STATUS_CODES.NOT_FOUND;
                return next(error);
            };

            res.status(STATUS_CODES.OK).json(oneArticle);
        } catch (error) {
            next(error);
        }
    },
    
    // Page de validation de commande
    getOrderPage: async (req, res, next) => {
        try {
            res.status(STATUS_CODES.OK).json({ message: "Pages de commandes" });
        } catch (error) {
            next(error);
        }
    },

    // Page des Conditions Générales d'Utilisation
    getCGU: async (req, res, next) => {
        try {
            res.status(STATUS_CODES.OK).json({ message: "Conditions Générales d'Utilisation" });
        } catch (error) {
            next(error);
        }
    },

    // Page des Conditions Générales de Vente
    getCGV: async (req, res, next) => {
        try {
            res.status(STATUS_CODES.OK).json({ message: "Conditions Générales de Vente" });
        } catch (error) {
            next(error);
        }
    },

    // Page des Mentions Légales
    getTermsAndConditions: async (req, res, next) => {
        try {
            res.status(STATUS_CODES.OK).json({ message: "Mentions légales" });
        } catch (error) {
            next(error);
        }
    },
};

export default mainController;