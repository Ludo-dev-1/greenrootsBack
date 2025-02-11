import { Article, Picture, sequelize } from "../models/association.js";

const shopController = {
    // Récupération de tout les articles
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

            res.status(201).json(oneArticle);
        } catch (error) {
            error.statusCode = 500;
            return next(error);
        }
    },
        
    createArticleWithPicture: async (req, res, next) => {
        const transaction = await sequelize.transaction();
        try {
            // Vérifier si l'utilisateur est un administrateur
            if (req.user.role_id !== 1) {
                return res.status(403).json({ error: "Accès non autorisé" });
            }

            const { name, description, price, available, pictureUrl, pictureDescription } = req.body;

            if (!name || !description || !price || available === undefined || !pictureUrl || !pictureDescription) {
                return res.status(400).json({ error: "Tous les champs sont obligatoires" });
            }

            const newPicture = await Picture.create({
                url: pictureUrl,
                description: pictureDescription
            }, { transaction });

            const newArticle = await Article.create({
                name,
                description,
                price,
                available,
                picture_id: newPicture.id
            }, { transaction });

            await transaction.commit();

            res.status(201).json({
                message: "Article créé avec succès",
                article: newArticle
            });
        } catch (error) {
            await transaction.rollback();
            console.error("Erreur lors de la création de l'article :", error);
            res.status(500).json({ error: "Erreur serveur lors de la création de l'article" });
        }
    },

    updateArticle: async (req, res, next) => {
        const transaction = await sequelize.transaction();
        try {
            // Vérifier si l'utilisateur est un administrateur
            if (req.user.role_id !== 1) {
                return res.status(403).json({ error: "Accès non autorisé" });
            }
            // Récupération de l'ID de l'article depuis les paramètres de la requête
            const articleId = req.params.id;
            
            const { name, description, price, available, pictureUrl, pictureDescription } = req.body;

            // Validation des données
            if (!name || !description || !price || available === undefined || !pictureUrl || !pictureDescription) {
                return res.status(400).json({ error: "Aucun champ à mettre à jour n'a été fourni." });
            }

            // Récupération de l'article existant
            const article = await Article.findByPk(articleId, {
                include: [{
                    model: Picture
                }]
            });
            if(!article) {
                return res.status(404).json({ error: "L'article spécifié n'existe pas." });
            }
            
            // Mise à jour des 
            // champs de l'article
    ame) {
            
               article.name = name;
            }        } catch (error) {
            
        }
    },

    deleteArticle: async (req, res, next) => {
        try {
            const articleId = req.params.id;

            const deleting = await Article.destroy({
                where: { id: articleId }
            });

            if (deleting === 0) {
                return res.status(404).json({ error: "Article non trouvé"})
            }
            
            await deleting;
        } catch (error) {
            error.statusCode = 500;
            return next(error);
        }
    }
};

export default shopController;