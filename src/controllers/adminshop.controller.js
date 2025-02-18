import { Article, Picture, Category, sequelize } from "../models/association.js";
import { withTransaction } from "../utils/commonOperations.js";

const adminShopController = {
    // Fonction de vérification du rôle administrateur 
    checkAdminAccess: (req, res, next) => {
        if (req.user.role_id !== 1) {
            next(new Error("Accès non autorisé"));
            return false;
        }
        return true;
    },

    // Récupération de tout les articles
    getAllArticles: async (req, res, next) => {
        try {
            if (!adminShopController.checkAdminAccess(req, res, next)) return;

            const articles = await Article.findAll({
                include: [
                    { model: Picture },
                    { model: Category, as: "categories" }
                ]
            });

            if (!articles) {
                return next(new Error ("Aucun article trouvé"));
            };

            res.status(200).json({ articles });

        } catch (error) {
            next(error);
        }
    },

    // Récupération d'un seul article
    getOneArticle: async (req, res, next) => {
        try {
            if (!adminShopController.checkAdminAccess(req, res, next)) return;

            const articleId = req.params.id;

            const oneArticle = await Article.findByPk(articleId, {
                include: [
                    { model: Picture },
                    { model: Category, as: "categories" }
                ]
            });

            if (!oneArticle) {
                return next(newError("Cet arbre n'existe pas ou a été retiré !"));
            };

            res.status(200).json(oneArticle);
        } catch (error) {
            next(error);
        }
    },

    createArticleWithPicture: async (req, res, next) => {
        try {
            // Vérification de si l'utilisateur est un administrateur
            if (!adminShopController.checkAdminAccess(req, res, next)) return;

            const { categoryName, name, description, price, available, pictureUrl } = req.body;

            if (!categoryName || !name || !description || !price || available === undefined || !pictureUrl) {
                return next(new Error("Tous les champs sont obligatoires"));
            };

            const result = await withTransaction(async (transaction) => {
                const categories = await Category.findAll({
                    where: { name: categoryName },
                    transaction
                });
    
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

            res.status(201).json({
                message: "Article créé avec succès",
                article: result
            });
        } catch (error) {
            next(error);
        }
    },

    updateArticle: async (req, res, next) => {
        try {
            // Vérification de si l'utilisateur est un administrateur
            if (!adminShopController.checkAdminAccess(req, res, next)) return;

            // Récupération de l'ID de l'article depuis les paramètres de la requête
            const articleId = req.params.id;

            const { categoryName, name, description, price, available, pictureUrl } = req.body;

            // Validation des données
            if (!categoryName && !name && !description && !price && available === undefined && !pictureUrl) {
                return next(new Error("Aucun champ à mettre à jour n'a été fourni."));
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
                    throw new Error("L'article spécifié n'existe pas.");
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

            res.status(200).json({
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
            // Vérification de si l'utilisateur est un administrateur
            if (!adminShopController.checkAdminAccess(req, res, next)) return;

            const articleId = req.params.id;

            await withTransaction(async (transaction) => {
                const article = await Article.findByPk(articleId, {
                    include: [Picture],
                    transaction
                });

                if (!article) {
                    throw new Error("Article non trouvé");
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

            res.status(200).json({ message: "Article supprimé avec succès" });
        } catch (error) {
            next(error);
        }
    }
};

export default adminShopController;