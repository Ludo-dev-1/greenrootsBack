import { Article, Picture, Category, sequelize } from "../models/association.js";
import { withTransaction } from "../utils/commonOperations.js"; // Fonction utilitaire de gestion des transactions
import { STATUS_CODES, ERROR_MESSAGES } from "../utils/constants.js"; // Constantes pour les codes de statut HTTP et les messages d'erreur

const adminShopController = {

    // Récupération de tous les articles
    getAllArticles: async (req, res, next) => {
        try {
            // Récupère tous les articles avec leurs images et leurs catégories associées
            const articles = await Article.findAll({
                include: [
                    { model: Picture },
                    { model: Category, as: "categories" }
                ]
            });

            // Si aucun article n'est trouvé, renvoie une erreur
            if (!articles || articles.length === 0) {
                const error = new Error(ERROR_MESSAGES.RESOURCE_NOT_FOUND + " (Article)");
                error.statusCode = STATUS_CODES.NOT_FOUND;
                return next(error);
            };

            // Renvoie la liste des articles en réponse
            res.status(STATUS_CODES.OK).json({ articles });

        } catch (error) {
            // Passe l'erreur au middleware de gestion d'erreurs
            next(error);
        }
    },

    // Récupération d'un article spécifique par son ID
    getOneArticle: async (req, res, next) => {
        try {
            const articleId = req.params.id;

            // Recherche l'article par son ID et inclut ses images et catégories associées
            const oneArticle = await Article.findByPk(articleId, {
                include: [
                    { model: Picture },
                    { model: Category, as: "categories" }
                ]
            });

            // Si l'article n'est pas trouvé, renvoie une erreur
            if (!oneArticle) {
                const error = new Error(ERROR_MESSAGES.RESOURCE_NOT_FOUND + (" Cet arbre n'existe pas ou a été retiré !)"));
                error.statusCode = STATUS_CODES.NOT_FOUND;
                return next(error);
            };

            // Renvoie les détails de l'article en réponse
            res.status(STATUS_CODES.OK).json(oneArticle);
        } catch (error) {
            // Passe l'erreur au middleware de gestion d'erreurs
            next(error);
        }
    },

    // Création d'un nouvel article avec une image associée
    createArticleWithPicture: async (req, res, next) => {
        try {
            const { categoryName, name, description, price, available, pictureUrl } = req.body;

            // Vérifie que tous les champs requis sont fournis
            if (!categoryName || !name || !description || !price || available === undefined || !pictureUrl) {
                const error = new Error(ERROR_MESSAGES.INVALID_INPUT + " (Tous les champs sont obligatoires)");
                error.statusCode = STATUS_CODES.BAD_REQUEST;
                return next(error);
            };

            const result = await withTransaction(async (transaction) => {
                // Recherche les catégories correspondantes dans la base de données
                const categories = await Category.findAll({
                    where: { name: categoryName },
                    transaction
                });

                // Si pas trouvé, renvoie une erreur
                if (categories.length === 0) {
                    const error = new Error(ERROR_MESSAGES.RESOURCE_NOT_FOUND + " (Catégorie)");
                    error.statusCode = STATUS_CODES.NOT_FOUND;
                    throw error;
                }
    
                // Crée une nouvelle image dans la base de données
                const newPicture = await Picture.create({
                    url: "req.base64Image1"
                }, { transaction });
    
                // Crée un nouvel article avec les informations fournies
                const newArticle = await Article.create({
                    name,
                    description,
                    price,
                    available,
                    picture_id: newPicture.id // Associe l'image à l'article
                }, { transaction });
    
                // Associe les catégories à l'article
                for (const category of categories) {
                    await newArticle.addCategory(category, { transaction }); 
                }

                return newArticle;
            });

            // Renvoie le nouvel article créé en réponse
            res.status(STATUS_CODES.CREATED).json({
                message: "Article créé avec succès",
                article: result
            });
        } catch (error) {
            // Passe l'erreur au middleware de gestion d'erreurs
            next(error);
        }
    },

    // Mise à jour d'un article existant
    updateArticle: async (req, res, next) => {
        try {
            // Récupération de l'ID de l'article depuis les paramètres de la requête
            const articleId = req.params.id;

            const { categoryName, name, description, price, available, pictureUrl } = req.body;

            // Validation des données : vérifie que des champs à mettre à jour ont bien été fournis
            if (!categoryName && !name && !description && !price && available === undefined && !pictureUrl) {
                const error = new Error(ERROR_MESSAGES.INVALID_INPUT + " (Aucun champ à mettre à jour n'a été fourni.)");
                error.statusCode = STATUS_CODES.BAD_REQUEST;
                return next(error);
            }

            // Récupération de l'article existant
            await withTransaction(async (transaction) => {
                // Recherche l'article existant par son ID
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

                // Si pas trouvé, renvoie une erreur
                if (!article) {
                    const error = new Error(ERROR_MESSAGES.RESOURCE_NOT_FOUND + " (Article)");
                    error.statusCode = STATUS_CODES.NOT_FOUND;
                    throw error;
                }

                // Mise à jour des champs de l'article si des valeurs sont fournies

                if (name) article.name = name;
                if (description) article.description = description;
                if (price) article.price = price;
                if (available !== undefined) article.available = available;

                // Mise à jour de l'image associée si une nouvelle URL est fournie
                if (pictureUrl) {
                    let picture = await Picture.findByPk(article.picture_id, { transaction });
                    picture.url = pictureUrl;
                    // Sauvegarde des modifications de la photo
                    await picture.save({ transaction });
                }

                // Mise à jour des catégories associées si nécessaire
                if (categoryName) {
                    let existingCategories = await article.getCategories({ transaction })
                    let newCategories = await Category.findAll({
                        where: { name: categoryName },
                        transaction
                    });

                    if (newCategories.length === 0) {
                        const error = new Error(ERROR_MESSAGES.RESOURCE_NOT_FOUND + " (Catégorie)");
                        error.statusCode = STATUS_CODES.NOT_FOUND;
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

            res.status(STATUS_CODES.OK).json({
                message: "Article mis à jour avec succès",
                article: updatedArticle
            });
        }
        catch (error) {
            // Passe l'erreur au middleware de gestion d'erreurs
            next(error);
        }
    },

    // Suppression d'un article existant
    deleteArticle: async (req, res, next) => {
        try {
            // Récupère l'ID de l'article depuis les paramètres
            const articleId = req.params.id;

            await withTransaction(async (transaction) => {
                const article = await Article.findByPk(articleId, {
                    include: [Picture],
                    transaction
                });

                if (!article) {
                    const error = new Error(ERROR_MESSAGES.RESOURCE_NOT_FOUND + " (Article)");
                    error.statusCode = STATUS_CODES.NOT_FOUND;
                    throw error;
                };

                // Supprime l'article
                await article.destroy({ transaction });

                // Supprime toutes les associations avec des catégories
                await article.setCategories([], { transaction });

                // Supprime l'image associée si elle existe
                if (article.picture_id) {
                    await Picture.destroy({
                        where: { id: article.picture_id },
                        transaction
                    });
                }
            });

            res.status(STATUS_CODES.OK).json({ message: "Article supprimé avec succès" });
        } catch (error) {
            // Passe l'erreur au middleware de gestion d'erreurs
            next(error);
        }
    }
};

export default adminShopController;