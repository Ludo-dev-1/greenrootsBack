import { Article, Picture, Category } from "../models/association.js";
import path from "node:path";
import { withTransaction } from "../utils/commonOperations.utils.js"; // Fonction utilitaire de gestion des transactions
import { STATUS_CODES, ERROR_MESSAGES } from "../utils/constants.utils.js"; // Constantes pour les codes de statut HTTP et les messages d'erreur
import { createProductAndPrice } from "../utils/stripe.utils.js";

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
                    url: req.base64Image
                }, { transaction });

                // Crée les produits et prix Stripe
                const { product_id, price_id } = await createProductAndPrice(name, description, price);

                // Crée un nouvel article avec les informations fournies
                const newArticle = await Article.create({
                    name,
                    description,
                    price,
                    available,
                    picture_id: newPicture.id, // Associe l'image à l'article
                    stripe_product_id: product_id,
                    stripe_price_id: price_id
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
            const articleId = req.params.id;
            const { categoryName, name, description, price, available, pictureUrl } = req.body;

            if (!categoryName && !name && !description && !price && available === undefined && !pictureUrl) {
                const error = new Error(ERROR_MESSAGES.INVALID_INPUT + " (Aucun champ à mettre à jour n'a été fourni.)");
                error.statusCode = STATUS_CODES.BAD_REQUEST;
                return next(error);
            }

            await withTransaction(async (transaction) => {
                const article = await Article.findByPk(articleId, {
                    include: [
                        { model: Picture },
                        { model: Category, as: "categories" }
                    ],
                    transaction
                });

                if (!article) {
                    const error = new Error(ERROR_MESSAGES.RESOURCE_NOT_FOUND + " (Article)");
                    error.statusCode = STATUS_CODES.NOT_FOUND;
                    throw error;
                }

                if (name) article.name = name;
                if (description) article.description = description;
                if (price) article.price = price;
                if (available !== undefined) article.available = available;

                if (pictureUrl) {
                    let picture = await Picture.findByPk(article.picture_id, { transaction });

                    const receivedFileName = path.basename(pictureUrl);
                    const storedFileName = path.basename(picture.url);

                    if (receivedFileName !== storedFileName) {
                        picture.url = pictureUrl;
                        await picture.save({ transaction });
                    }
                }

                if (categoryName) {
                    let existingCategories = await article.getCategories({ transaction });
                    let newCategories = await Category.findAll({
                        where: { name: categoryName },
                        transaction
                    });

                    if (newCategories.length === 0) {
                        const error = new Error(ERROR_MESSAGES.RESOURCE_NOT_FOUND + " (Catégorie)");
                        error.statusCode = STATUS_CODES.NOT_FOUND;
                        throw error;
                    }

                    let categoriesToAdd = newCategories.filter(newCat => !existingCategories.some(exCat => exCat.id === newCat.id));
                    let categoriesToRemove = existingCategories.filter(exCat => !newCategories.some(newCat => newCat.id === exCat.id));

                    await article.addCategories(categoriesToAdd, { transaction });
                    await article.removeCategories(categoriesToRemove, { transaction });
                }
                await article.save({ transaction });
            });

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