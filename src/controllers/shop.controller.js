import { Article } from "../models/association.js";

const mainRoute = {
    getNewArticles: async (req, res, next) => {
        try {
            const result = await Article.findAll({
                order: [["created_at", "DESC"]]
            });

            if (!result) {
                return next();
            };

            res.status(200).json(result);

        } catch (error) {
            return next();
        }
    },
    getAllArticles: async (req, res, next) => {
        try {
            const result = await Article.findAll();

            if (!result) {
                return next();
            };

            res.status(200).json(result);

        } catch (error) {
            return next();
        }
    },
};

export default mainRoute;