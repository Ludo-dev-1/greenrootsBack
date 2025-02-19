import { Article, User, Tracking, ArticleHasOrder, ArticleTracking, Order, sequelize } from "../models/association.js";
import argon2 from "argon2"; // Pour le hash du mot de passe
import { withTransaction } from "../utils/commonOperations.js"; // Fonction utilitaire de gestion des transactions
import { STATUS_CODES, ERROR_MESSAGES } from "../utils/constants.js"; // Constantes pour les codes de statut HTTP et les messages d'erreur


const userController = {
    // Récupération de toutes les commandes d'un utilisateur
    getOrders: async (req, res, next) => {
        try {
            // Récupère l'ID de l'utilisateur à partir du token JWT
            const userId = req.user.id;

            // Recherche toutes les commandes de l'utilisateur triées par date décroissante
            const orders = await Order.findAll({
                where: { user_id: userId },
                order: [["date", "DESC"]]
            });

            // Si aucune commande n'est trouvée, renvoie une erreur
            if (!orders || orders.length === 0) {
                const error = new Error(ERROR_MESSAGES.RESOURCE_NOT_FOUND + " (Commande)");
                error.statusCode = STATUS_CODES.NOT_FOUND;
                return next(error);
            };

            // Renvoie les commandes trouvées
            res.status(STATUS_CODES.OK).json(orders);

        } catch (error) {
            // Passe l'erreur au middleware de gestion d'erreurs
            next(error);
        }
    },

    // Récupération du profil de l'utilisateur
    getUserProfile: async (req, res, next) => {
        try {
            // Récupère l'ID de l'utilisateur à partir du token JWT
            const userId = req.user.id;

            // Recherche l'utilisateur par son ID en sélectionnant uniquement les champs recherchés
            const user = await User.findByPk(userId, {
                attributes: ["firstname", "lastname", "email", "created_at", "updated_at"]
            });

            // Si l'utilisateur n'est pas trouvé, renvoie une erreur
            if (!user) {
                const error = new Error(ERROR_MESSAGES.RESOURCE_NOT_FOUND + " (Utilisateur)");
                error.statusCode = STATUS_CODES.NOT_FOUND;
                return next(error);
            }

            // Renvoie les informations de l'utilisateur
            res.status(STATUS_CODES.OK).json(user);

        } catch (error) {
            // Passe l'erreur au middleware de gestion d'erreurs
            next(error);
        }
    },

    // Récupération du suivi des commandes d'un utilisateur
    getOrderTracking: async (req, res, next) => {
        try {
            // Récupère l'ID de l'utilisateur à partir du token JWT
            const userId = req.user.id;

            // Recherche tous les suivis de commande pour l'utilisateur, avec les détails des commandes et des articles
            const tracking = await Tracking.findAll({
                include: [{
                    model: Order,
                    where: { user_id: userId },
                    include: [{ model: Article, as: "articles" }]
                }],
                // Trie les résultats par date de commande décroissante
                order: [[Order, "date", "DESC"]]
            });

            // Si aucun suivi n'est trouvé, renvoie une erreur
            if (!tracking || tracking.length === 0) {
                const error = new Error(ERROR_MESSAGES.RESOURCE_NOT_FOUND + " (Suivi de commande)");
                error.statusCode = STATUS_CODES.NOT_FOUND;
                return next(error);
            }

            // Renvoie les informations de suivi
            res.status(STATUS_CODES.OK).json(tracking);
        } catch (error) {
            // Passe l'erreur au middleware de gestion d'erreurs
            next(error);
        }
    },

    // Mise à jour du profil de l'utilisateur
    updateUserProfile: async (req, res, next) => {
        try {
            // Récupère l'ID de l'utilisateur à partir du token JWT
            const userId = req.user.id;
            const { firstname, lastname, email, password, repeat_password } = req.body;

            // Vérifie si au moins un champ à mettre à jour a été fourni
            if (!firstname && !lastname && !email && !password && !repeat_password) {
                const error = new Error(ERROR_MESSAGES.INVALID_INPUT + " (Aucun champ à mettre à jour)");
                error.statusCode = STATUS_CODES.BAD_REQUEST;
                return next(error);
            }

            const result = await withTransaction(async (transaction) => {
                // Prépare les champs à mettre à jour
                const updateFields = {};
                if (firstname) updateFields.firstname = firstname;
                if (lastname) updateFields.lastname = lastname;
                if (email) updateFields.email = email;
                // Si un nouveau mot de passe est fourni, le hash avant de le stocker
                if (password && password === repeat_password) {
                    updateFields.password = await argon2.hash(password);
                } else if (password !== repeat_password) {
                    const error = new Error(ERROR_MESSAGES.INVALID_INPUT + " (Les mots de passe ne correspondent pas)");
                    error.statusCode = STATUS_CODES.BAD_REQUEST;
                    throw error;
                }

                // Met à jour l'utilisateur dans la base de données
                const [updateCount, [updatedUser]] = await User.update(updateFields, {
                    where: { id: userId },
                    returning: true,
                    transaction
                });

                // Si aucun utilisateur n'a été mis à jour, renvoie une erreur
                if (updateCount === 0) {
                    const error = new Error(ERROR_MESSAGES.RESOURCE_NOT_FOUND + " (Utilisateur)");
                    error.statusCode = STATUS_CODES.NOT_FOUND;
                    throw error;
                }

                return updatedUser;
            });

            // Renvoie les détails de l'utilisateur mis à jour
            res.status(STATUS_CODES.OK).json({
                message: "Profil mis à jour avec succès",
                user: result // Les données mises à jour
            });
        } catch (error) {
            // Passe l'erreur au middleware de gestion d'erreurs
            next(error);
        }
    },

    // Suppression du profil de l'utilisateur et toutes les données associées
    deleteUserProfile: async (req, res, next) => {
        try {
            // Récupère l'ID de l'utilisateur à partir du token JWT
            const userId = req.user.id;

            await withTransaction(async (transaction) => {
                // Vérifie si l'utilisateur existe
                const user = await User.findByPk(userId, { transaction });
                
                if (!user) {
                    const error = new Error(ERROR_MESSAGES.RESOURCE_NOT_FOUND + " (Utilisateur)");
                    error.statusCode = STATUS_CODES.NOT_FOUND;
                    throw error;
                }
                
                // Supprime les suivis d'articles associés aux commandes de l'utilisateur
                await ArticleTracking.destroy({
                    where: {},
                    include: [{
                        model: ArticleHasOrder,
                        include: [{
                            model: Order,
                            where: { user_id: userId }
                        }]
                    }],
                    transaction
                });

                // Supprime les relations ArticleHasOrder associées aux commandes de l'utilisateur
                await ArticleHasOrder.destroy({
                    where: {},
                    include: [{
                        model: Order,
                        where: { user_id: userId }
                    }],
                    transaction
                });

                // Supprime les suivis de commandes associés à l'utilisateur
                await Tracking.destroy({
                    where: {},
                    include: [{
                        model: Order,
                        where: { user_id: userId }
                    }],
                    transaction
                });

                // Supprime les commandes associées à l'utilisateur
                await Order.destroy({
                    where: { user_id: userId },
                    transaction
                });

                // Supprime l'utilisateur
                await user.destroy({ transaction });
            });

            // Réponse
            res.status(STATUS_CODES.OK).json({ message: "Profil utilisateur et données associées supprimés avec succès" });
        } catch (error) {
            // Passe l'erreur au middleware de gestion d'erreurs
            next(error);
        }
    },
};

export default userController;