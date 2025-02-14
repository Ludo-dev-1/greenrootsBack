import { Article, User, Tracking, Order, sequelize } from "../models/association.js";
import argon2 from "argon2";

const userController = {
    getOrders: async (req, res, next) => {
        try {
            const userId = req.user.id;

            const orders = await Order.findAll({
                where: { user_id: userId },
                order: [["date", "DESC"]]
            });

            if (!orders) {
                error.statusCode = 404;
                return next(error);
            };

            res.status(200).json(orders);

        } catch (error) {
            error.statusCode = 500;
            return next(error);
        }
    },

    getUserProfile: async (req, res, next) => {
        try {
            const userId = req.user.id;

            const user = await User.findByPk(userId, 
                {
                    attributes: ["firstname", "lastname", "email", "created_at", "updated_at"]
                });

            if (!user) {
                const error = new Error("Utilisateur non trouvé");
                error.statusCode = 404;
                return next(error);
            }

            res.status(200).json({
                firstname: user.firstname,
                lastname: user.lastname,
                email: user.email,
                created_at: user.created_at,
                updated_at: user.updated_at
            });

        } catch (error) {
            error.statusCode = 500;
            return next(error);
        }
    },

    getOrderTracking: async (req, res, next) => {
        try {
            const userId = req.user.id;

            const tracking = await Tracking.findAll({
                include: [{
                    model: Order,
                    where: { user_id: userId },
                    include: [{ model: Article, as: 'articles' }]
                }],
                order: [[Order, 'date', 'DESC']]
            });

            if (!tracking || tracking.length === 0) {
                const error = new Error("Aucun suivi de commande trouvé");
                error.statusCode = 404;
                return next(error);
            }

            res.status(200).json(tracking);
        } catch (error) {
            error.statusCode = 500;
            return next(error);
        }
    },

    updateUserProfile: async (req, res, next) => {
        try {
            const userId = req.user.id;
            const { firstname, lastname, email, password, repeat_password } = req.body;

            if (!firstname && !lastname && !email && !password && !repeat_password) {
                return res.status(400).json({ error: "Aucun champ à mettre à jour" });
            }

            const updateFields = {};
            if (firstname) updateFields.firstname = firstname;
            if (lastname) updateFields.lastname = lastname;
            if (email) updateFields.email = email;
            if (password && password === repeat_password) {
                updateFields.password = await argon2.hash(password);
            } else if (password !== repeat_password) {
                return res.status(400).json({ error: "Les mots de passe ne correspondent pas" })
            }

            const updatedUser = await User.update(updateFields, {
                where: { id: userId }, returning: true
            });

            if (!updatedUser[0]) {
                return res.status(404).json({ error: "Utilisateur non trouvé" });
            }

            res.status(200).json({
                message: "Profil mis à jour avec succès",
                user: updatedUser[1][0], // Les données mises à jour
            });
        } catch (error) {
            error.statusCode = 500;
            return next(error);
        }
    },

    deleteUserProfile: async (req, res, next) => {
        const transaction = await sequelize.transaction();
        try {
            const userId = req.user.id;

            // Vérifier si l'utilisateur existe
            const user = await User.findByPk(userId);
            if (!user) {
                await transaction.rollback();
                const error = new Error("Utilisateur non trouvé");
                error.statusCode = 404;
                return next(error);
            }

            // Supprimer l'utilisateur
            await user.destroy({ transaction });

            // Supprimer les suivis de commandes associés à l'utilisateur
            await Tracking.destroy({
                where: {}, // Obligatoire même si vide
                include: [{
                    model: Order,
                    where: { user_id: userId } // Filtre sur les commandes associées à l'utilisateur avec l'ID correspondant
                }],
                transaction
            });

            // Supprimer les commandes associées à l'utilisateur
            await Order.destroy({
                where: { user_id: userId },
                transaction
            });

            // Valider la transaction
            await transaction.commit();

            // Réponse
            res.status(200).json({ message: "Profil utilisateur et données associées supprimés avec succès" });
        } catch (error) {
            error.statusCode = 500;
            return next(error);
        }
    },
};

export default userController;