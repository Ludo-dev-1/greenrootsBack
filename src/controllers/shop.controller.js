import { Article } from "../models/association.js";

const mainRoute = {
    getNewArticles: async (req, res, next) => {
        try {
            const result = await Article.findAll({
                order: [["created_at", "DESC"]]
            });

            if (!result) {
                error.statusCode = 404;
                return next(error);
            };

            res.status(200).json(result);

        } catch (error) {
            const newError = new Error("Erreur serveur");
            newError.statusCode = 500;
            return next(newError);
        }
    },
    getAllArticles: async (req, res, next) => {
        try {
            const result = await Article.findAll();

            if (!result) {
                error.statusCode = 404;
                return next(error);
            };

            res.status(200).json(result);

        } catch (error) {
            const newError = new Error("Erreur serveur");
            newError.statusCode = 500;
            return next(newError);
        }
    },
};

export default mainRoute;