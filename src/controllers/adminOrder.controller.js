import { Order, User, Article, ArticleHasOrder, Tracking, ArticleTracking, Picture, sequelize } from "../models/association.js";
import { sendEmail } from "../services/emailService.js";
import { withTransaction } from "../utils/commonOperations.js";
import { STATUS_CODES, ERROR_MESSAGES } from "../utils/constants.js";

const adminOrderController = {
    getAllOrders: async (req, res, next) => {
        try {
            const orders = await Order.findAll({
                order: [["date", "DESC"]]
            });

            if (!orders || orders.length === 0) {
                const error = new Error("Aucune commande trouvée");
                error.statusCode = 404;
                return next(error);
            };

            res.status(200).json(orders);

        } catch (error) {
            next(error);
        }
    },

    getOrderDetailsAdmin: async (req, res, next) => {
        try {
            const orderId = req.params.id;

            const order = await Order.findByPk(orderId, {
                include: [
                    {
                        model: User,
                        attributes: ["id", "firstname", "lastname", "email"]
                    },
                    {
                        model: Article,
                        as: "articles",
                        through: {
                            model: ArticleHasOrder,
                            attributes: ["quantity"]
                        }
                    }
                ]
            });

            if (!order) {
                const error = new Error("Commande non trouvée");
                error.statusCode = 404;
                return next(error);
            }

            res.status(200).json(order);
        } catch (error) {
            next(error);
        }
    },

    getOrderTrackingAdmin: async (req, res, next) => {
        try {
            const orderId = req.params.id;

            const order = await Order.findByPk(orderId, {
                include: [
                    {
                        model: User,
                        attributes: ["id", "firstname", "lastname", "email"]
                    },
                    {
                        model: Tracking
                    },
                    {
                        model: Article,
                        as: "articles",
                        through: {
                            model: ArticleHasOrder,
                            attributes: ["quantity"]
                        },
                        include: [
                            {
                                model: ArticleTracking,
                                include: [Picture]
                            }
                        ]
                    }
                ]
            });

            if (!order) {
                const error = new Error("Commande non trouvée");
                error.statusCode = 404;
                return next(error);
            }

            res.status(200).json(order);
        } catch (error) {
            next(error);
        }
    },

    getArticleTrackingAdmin: async (req, res, next) => {
        try {
            const { orderId, trackingId } = req.params;

            const articleTracking = await ArticleTracking.findOne({
                where: { id: trackingId },
                include: [
                    {
                        model: Picture
                    },
                    {
                        model: ArticleHasOrder,
                        include: [
                            {
                                model: Order,
                                where: { id: orderId }
                            }
                        ]
                    }
                ]
            });

            if (!articleTracking) {
                const error = new Error("Suivi d'article non trouvé");
                error.statusCode = 404;
                return next(error);
            }

            res.status(200).json(articleTracking);
        } catch (error) {
            next(error);
        }
    },

    updateArticleTracking: async (req, res, next) => {
        try {
            const userId = req.user.id;
            const { orderId, trackingId } = req.params;
            const { status, growth, plant_place, picture_url } = req.body;

            const updatedTracking = await withTransaction(async (transaction) => {
                const articleTracking = await ArticleTracking.findOne({
                    where: { id: trackingId },
                    include: [
                        {
                            model: Picture
                        },
                        {
                            model: ArticleHasOrder,
                            include: [
                                {
                                    model: Order,
                                    where: { id: orderId }
                                }
                            ]
                        }
                    ],
                    transaction
                });
    
                if (!articleTracking) {
                    const error = new Error("Suivi d'article non trouvé");
                    error.statusCode = 404;
                    throw error;
                }

                // Mettre à jour les champs
                if (status) articleTracking.status = status;
                if (growth) articleTracking.growth = growth;
                if (plant_place) articleTracking.plant_place = plant_place;
                if (picture_url) articleTracking.picture_url = picture_url;

                // Récupération des informations de l'utilisateur pour l'e-mail
                const user = await User.findByPk(userId, { transaction });
                const email = user.email;
                const firstname = user.firstname;

                // Envoi de l'e-mail de update de suivi
                await sendEmail(email, "Nouvelles informations concernant le suivi de votre arbre", "newTrackingUpdate", {
                    firstname,
                    growth: articleTracking.growth,
                    status: articleTracking.status,
                    plant_place: articleTracking.plant_place,
                    nickname: articleTracking.nickname ? articleTracking.nickname : "",
                });
                

                // Sauvegarde des changements
                await articleTracking.save({ transaction });

                return articleTracking;
            });

            res.status(200).json({
                message: "Suivi d'article mis à jour avec succès",
                articleTracking: {
                    id: updatedTracking.id,
                    status: updatedTracking.status,
                    growth: updatedTracking.growth,
                    plant_place: updatedTracking.plant_place,
                    picture_url: updatedTracking.Picture.url
                }
            });
        } catch (error) {
            next(error);
        }
    }
};

export default adminOrderController;