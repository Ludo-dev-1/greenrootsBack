import { Article, User, Tracking, ArticleHasOrder, ArticleTracking, Order, sequelize } from "../models/association.js";
import argon2 from "argon2";
import { withTransaction } from "../utils/commonOperations.js";
import { STATUS_CODES, ERROR_MESSAGES } from "../utils/constants.js";


const userController = {
    getOrders: async (req, res, next) => {
        try {
            const userId = req.user.id;

            const orders = await Order.findAll({
                where: { user_id: userId },
                order: [["date", "DESC"]]
            });

            if (!orders || orders.length === 0) {
                const error = new Error(ERROR_MESSAGES.RESOURCE_NOT_FOUND + " (Commande)");
                error.statusCode = STATUS_CODES.NOT_FOUND;
                return next(error);
            };

            res.status(STATUS_CODES.OK).json(orders);

        } catch (error) {
            next(error);
        }
    },

    getUserProfile: async (req, res, next) => {
        try {
            const userId = req.user.id;

            const user = await User.findByPk(userId, {
                attributes: ["firstname", "lastname", "email", "created_at", "updated_at"]
            });

            if (!user) {
                const error = new Error(ERROR_MESSAGES.RESOURCE_NOT_FOUND + " (Utilisateur)");
                error.statusCode = STATUS_CODES.NOT_FOUND;
                return next(error);
            }

            res.status(STATUS_CODES.OK).json(user);

        } catch (error) {
            next(error);
        }
    },

    getOrderTracking: async (req, res, next) => {
        try {
            const userId = req.user.id;

            const tracking = await Tracking.findAll({
                include: [{
                    model: Order,
                    where: { user_id: userId },
                    include: [{ model: Article, as: "articles" }]
                }],
                order: [[Order, "date", "DESC"]]
            });

            if (!tracking || tracking.length === 0) {
                const error = new Error(ERROR_MESSAGES.RESOURCE_NOT_FOUND + " (Suivi de commande)");
                error.statusCode = STATUS_CODES.NOT_FOUND;
                return next(error);
            }

            res.status(STATUS_CODES.OK).json(tracking);
        } catch (error) {
            next(error);
        }
    },

    updateUserProfile: async (req, res, next) => {
        try {
            const userId = req.user.id;
            const { firstname, lastname, email, password, repeat_password } = req.body;

            if (!firstname && !lastname && !email && !password && !repeat_password) {
                const error = new Error(ERROR_MESSAGES.INVALID_INPUT + " (Aucun champ à mettre à jour)");
                error.statusCode = STATUS_CODES.BAD_REQUEST;
                return next(error);
            }

            const result = await withTransaction(async (transaction) => {
                const updateFields = {};
                if (firstname) updateFields.firstname = firstname;
                if (lastname) updateFields.lastname = lastname;
                if (email) updateFields.email = email;
                if (password && password === repeat_password) {
                    updateFields.password = await argon2.hash(password);
                } else if (password !== repeat_password) {
                    const error = new Error(ERROR_MESSAGES.INVALID_INPUT + " (Les mots de passe ne correspondent pas)");
                    error.statusCode = STATUS_CODES.BAD_REQUEST;
                    throw error;
                }

                const [updateCount, [updatedUser]] = await User.update(updateFields, {
                    where: { id: userId },
                    returning: true,
                    transaction
                });

                if (updateCount === 0) {
                    const error = new Error(ERROR_MESSAGES.RESOURCE_NOT_FOUND + " (Utilisateur)");
                    error.statusCode = STATUS_CODES.NOT_FOUND;
                    throw error;
                }

                return updatedUser;
            });

/*             const updatedUser = await User.update(updateFields, {
                where: { id: userId }, 
                returning: true,
                transaction
            });

            if (!updatedUser[0]) {
                return res.status(STATUS_CODES.NOT_FOUND).json({ error: "Utilisateur non trouvé" });
            } */

            res.status(STATUS_CODES.OK).json({
                message: "Profil mis à jour avec succès",
                user: result
                /* user: updatedUser[1][0], */ // Les données mises à jour
            });
        } catch (error) {
            next(error);
        }
    },

    deleteUserProfile: async (req, res, next) => {
        try {
            const userId = req.user.id;

            await withTransaction(async (transaction) => {
                // Vérifier si l'utilisateur existe
                const user = await User.findByPk(userId, { transaction });
                
                if (!user) {
                    const error = new Error(ERROR_MESSAGES.RESOURCE_NOT_FOUND + " (Utilisateur)");
                    error.statusCode = STATUS_CODES.NOT_FOUND;
                    throw error;
                }
                
                // Supprimer les suivis d'articles associés aux commandes de l'utilisateur
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

                // Supprimer les relations ArticleHasOrder associées aux commandes de l'utilisateur
                await ArticleHasOrder.destroy({
                    where: {},
                    include: [{
                        model: Order,
                        where: { user_id: userId }
                    }],
                    transaction
                });

                // Supprimer les suivis de commandes associés à l'utilisateur
                await Tracking.destroy({
                    where: {},
                    include: [{
                        model: Order,
                        where: { user_id: userId }
                    }],
                    transaction
                });

                // Supprimer les commandes associées à l'utilisateur
                await Order.destroy({
                    where: { user_id: userId },
                    transaction
                });

                // Supprimer l'utilisateur
                await user.destroy({ transaction });
            });

            // Réponse
            res.status(STATUS_CODES.OK).json({ message: "Profil utilisateur et données associées supprimés avec succès" });
        } catch (error) {
            next(error);
        }
    },
};

export default userController;