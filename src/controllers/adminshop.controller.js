import { Article, Picture, Category, sequelize } from "../models/association.js";
import { withTransaction } from "../utils/commonOperations.js";
import { STATUS_CODES, ERROR_MESSAGES } from "../utils/constants.js";

const adminShopController = {

    // Récupération de tout les articles
    getAllArticles: async (req, res, next) => {
        try {
            const articles = await Article.findAll({
                include: [
                    { model: Picture },
                    { model: Category, as: "categories" }
                ]
            });

            if (!articles || articles.length === 0) {
                const error = new Error(ERROR_MESSAGES.RESOURCE_NOT_FOUND + " (Article)");
                error.statusCode = NOT_FOUND;
                return next(error);
            };

            res.status(OK).json({ articles });

        } catch (error) {
            next(error);
        }
    },

    // Récupération d'un seul article
    getOneArticle: async (req, res, next) => {
        try {
            const articleId = req.params.id;

            const oneArticle = await Article.findByPk(articleId, {
                include: [
                    { model: Picture },
                    { model: Category, as: "categories" }
                ]
            });

            if (!oneArticle) {
                const error = new Error(ERROR_MESSAGES.RESOURCE_NOT_FOUND + (" Cet arbre n'existe pas ou a été retiré !)"));
                error.statusCode = NOT_FOUND;
                return next(error);
            };

            res.status(OK).json(oneArticle);
        } catch (error) {
            next(error);
        }
    },

    createArticleWithPicture: async (req, res, next) => {
        try {
            const { categoryName, name, description, price, available, pictureUrl } = req.body;

            if (!categoryName || !name || !description || !price || available === undefined || !pictureUrl) {
                const error = new Error(ERROR_MESSAGES.INVALID_INPUT + " (Tous les champs sont obligatoires)");
                error.statusCode = BAD_REQUEST;
                return next(error);
            };

            const result = await withTransaction(async (transaction) => {
                const categories = await Category.findAll({
                    where: { name: categoryName },
                    transaction
                });

                if (categories.length === 0) {
                    const error = new Error(ERROR_MESSAGES.RESOURCE_NOT_FOUND + " (Catégorie)");
                    error.statusCode = NOT_FOUND;
                    throw error;
                }
    
                const newPicture = await Picture.create({
                    url: req.base64Image
                }, { transaction });
    
                const newArticle = await Article.create({
                    name,
                    description,
                    price,
                    available,
                    picture_id: newPicture.id
                }, { transaction });
    
                for (const category of categories) {
                    await newArticle.addCategory(category, { transaction }); 
                }

                return newArticle;
            });

            res.status(CREATED).json({
                message: "Article créé avec succès",
                article: result
            });
        } catch (error) {
            next(error);
        }
    },

    updateArticle: async (req, res, next) => {
        try {
            // Récupération de l'ID de l'article depuis les paramètres de la requête
            const articleId = req.params.id;

            const { categoryName, name, description, price, available, pictureUrl } = req.body;

            // Validation des données
            if (!categoryName && !name && !description && !price && available === undefined && !pictureUrl) {
                const error = new Error(ERROR_MESSAGES.INVALID_INPUT + " (Aucun champ à mettre à jour n'a été fourni.)");
                error.statusCode = BAD_REQUEST;
                return next(error);
            }

            // Récupération de l'article existant
            await withTransaction(async (transaction) => {
                const article = await Article.findByPk(articleId, {
                    include: [{
                        model: Picture
                    },
                    {
                        model: Category,
                        as: "categories"
                    }],
                    transaction
                });

                if (!article) {
                    const error = new Error(ERROR_MESSAGES.RESOURCE_NOT_FOUND + " (Article)");
                    error.statusCode = NOT_FOUND;
                    throw error;
                }

                // Mise à jour des champs de l'article 

                if (name) article.name = name;
                if (description) article.description = description;
                if (price) article.price = price;
                if (available !== undefined) article.available = available;

                // Mise à jour de l'image associée
                if (pictureUrl) {
                    let picture = await Picture.findByPk(article.picture_id, { transaction });
                    picture.url = pictureUrl;
                    // Sauvegarde des modifications de la photo
                    await picture.save({ transaction });
                }

                // Mise à jour des catégories
                if (categoryName) {
                    let existingCategories = await article.getCategories({ transaction })
                    let newCategories = await Category.findAll({
                        where: { name: categoryName },
                        transaction
                    });

                    if (newCategories.length === 0) {
                        const error = new Error(ERROR_MESSAGES.RESOURCE_NOT_FOUND + " (Catégorie)");
                        error.statusCode = NOT_FOUND;
                        throw error;
                    }

                    // Ajoute les catégories qui ne sont pas encore associées à l'article
                    let categoriesToAdd = newCategories.filter(newCat => !existingCategories.some(exCat => exCat.id === newCat.id));
                    // Retire les catégories qui sont associés à l'article
                    let categoriesToRemove = existingCategories.filter(exCat => !newCategories.some(newCat => newCat.id === exCat.id));
        
                    // Met à jour l'article avec les catégories ajoutées et retirées
                    await article.addCategories(categoriesToAdd, { transaction });
                    await article.removeCategories(categoriesToRemove, { transaction });

                };
                // Sauvegarde des modifications de l'article
                await article.save({ transaction });
            });

            // Recharge l'article avec les relations mises à jour
            const updatedArticle = await Article.findByPk(articleId, {
                include: [
                    { model: Picture },
                    { model: Category, as: "categories" }
                ]
            });

            res.status(OK).json({
                message: "Article mis à jour avec succès",
                article: updatedArticle
            });
        }
        catch (error) {
            next(error);
        }
    },

    deleteArticle: async (req, res, next) => {
        try {
            const articleId = req.params.id;

            await withTransaction(async (transaction) => {
                const article = await Article.findByPk(articleId, {
                    include: [Picture],
                    transaction
                });

                if (!article) {
                    const error = new Error(ERROR_MESSAGES.RESOURCE_NOT_FOUND + " (Article)");
                    error.statusCode = NOT_FOUND;
                    throw error;
                };

                await article.destroy({ transaction });

                // Suppression des catégories associées
                await article.setCategories([], { transaction });

                if (article.picture_id) {
                    await Picture.destroy({
                        where: { id: article.picture_id },
                        transaction
                    });
                }
            });

            res.status(OK).json({ message: "Article supprimé avec succès" });
        } catch (error) {
            next(error);
        }
    }
};

export default adminShopController;