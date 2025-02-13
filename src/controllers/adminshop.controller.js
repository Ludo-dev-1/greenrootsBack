import { Article, Picture, Category, sequelize } from "../models/association.js";

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
                include: [
                    { model: Picture },
                    { model: Category, as: "categories" }
                ]
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
            };

            const { categoryName, name, description, price, available, pictureUrl } = req.body;

            if (!categoryName || !name || !description || !price || available === undefined || !pictureUrl) {
                return res.status(400).json({ error: "Tous les champs sont obligatoires" });
            };

            const categories = await Category.findAll({
                where: { name: categoryName },
                transaction
            });

            const newPicture = await Picture.create({
                url: pictureUrl, 
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

            // Validation de la transaction
            await transaction.commit();

            res.status(201).json({
                message: "Article créé avec succès",
                article: newArticle
            });
        } catch (error) {
            // Annule les modifications en cas d'erreur de la transaction
            await transaction.rollback();
            console.error("Erreur lors de la création de l'article :", error);
            res.status(500).json({ error: "Erreur serveur lors de la création de l'article" });
        }
    },

    updateArticle: async (req, res, next) => {
        const transaction = await sequelize.transaction();
        try {
            // Vérification de si l'utilisateur est un administrateur
            if (req.user.role_id !== 1) {
                return res.status(403).json({ error: "Accès non autorisé" });
            }
            // Récupération de l'ID de l'article depuis les paramètres de la requête
            const articleId = req.params.id;

            const { categoryName, name, description, price, available, pictureUrl } = req.body;

            // Validation des données
            if (!categoryName || !name || !description || !price || available === undefined || !pictureUrl) {
                return res.status(400).json({ error: "Aucun champ à mettre à jour n'a été fourni." });
            }

            // Récupération de l'article existant
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
                await transaction.rollback();
                return res.status(404).json({ error: "L'article spécifié n'existe pas." });
            }

            // Mise à jour des champs de l'article 
            if (name) article.name = name;
            if (description) article.description = description;
            if (price) article.price = price;
            if (available !== undefined) article.available = available;

            // Mise à jour de l'image associée
            if (pictureUrl) {
                let picture = await Picture.findByPk(article.picture_id);
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

            // Validation de la transaction
            await transaction.commit();

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
            // Annule les modifications en cas d'erreur de la transaction
            await transaction.rollback();
            console.error("Erreur lors de la création de l'article :", error);
            res.status(500).json({ error: "Erreur serveur lors de la mise à de l'article" });
        }
    },

    deleteArticle: async (req, res, next) => {
        const transaction = await sequelize.transaction();
        try {
            // Vérification de si l'utilisateur est un administrateur
            if (req.user.role_id !== 1) {
                return res.status(403).json({ error: "Accès non autorisé" });
            }

            const articleId = req.params.id;

            const article = await Article.findByPk(articleId, {
                include: [Picture],
                transaction
            });

            if (!article) {
                await transaction.rollback();
                return res.status(404).json({ error: "Article non trouvé" })
            };
            
            await article.destroy({ transaction });

            // Suppression des catégories associées
            await article.setCategories([], { transaction });
            
            if (article.picture_id) {
                await Picture.destroy({
                    where: { id: article.picture_id },
                    transaction
                });
            };

            await transaction.commit();

            res.status(200).json({ message: "Article supprimé avec succès" });
        } catch (error) {
            await transaction.rollback();
            error.statusCode = 500;
            return next(error);
        }
    }
};

export default adminShopController;