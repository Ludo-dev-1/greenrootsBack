import { Order, User, Article, ArticleHasOrder, Tracking, ArticleTracking, Picture } from "../models/association.js";

const adminOrderController = {
    getAllOrders: async (req, res, next) => {
        try {
            // Vérifier si l'utilisateur est un administrateur
            if (req.user.role_id !== 1) {
                return res.status(403).json({ error: "Accès non autorisé" });
            }

            const orders = await Order.findAll({
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

    getOrderDetailsAdmin: async (req, res, next) => {
        try {
            // Vérifier si l'utilisateur est un administrateur
            if (req.user.role_id !== 1) {
                return res.status(403).json({ error: "Accès non autorisé" });
            };

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
                error.statusCode = 404;
                return next(error);
            }

            res.status(200).json(order);
        } catch (error) {
            error.statusCode = 500;
            return next(error);
        }
    },

    getOrderTrackingAdmin: async (req, res, next) => {
        try {
            // Vérifier si l'utilisateur est un administrateur
            if (req.user.role_id !== 1) {
                return res.status(403).json({ error: "Accès non autorisé" });
            }

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
                error.statusCode = 404;
                return next(error);
            }

            res.status(200).json(order);
        } catch (error) {
            error.statusCode = 500;
            return next(error);
        }
    },

/*     updateArticleTracking: async (req, res, next) => {
        try {
            // Vérifier si l'utilisateur est un administrateur
            if (req.user.role_id !== 1) {
                return res.status(403).json({ error: "Accès non autorisé" });
            }

            const { orderId, trackingId } = req.params;
            const { status, growth, plant_place } = req.body;

            // Vérifier si la commande existe
            const order = await Order.findByPk(orderId);
            if (!order) {
                error.statusCode = 404;
                return next(error);
            }

            // Trouver et mettre à jour le suivi de l'article
            const articleTracking = await ArticleTracking.findOne({
                where: { id: trackingId },
                include: [{ model: Picture }]
            });

            if (!articleTracking) {
                error.statusCode = 404;
                return next(error);
            }

            // Mettre à jour les champs
            if (status) articleTracking.status = status;
            if (growth) articleTracking.growth = growth;
            if (plant_place) articleTracking.plant_place = plant_place;

            // Mise à jour de l'image

            res.status(200).json({
                message: "Suivi d'article mis à jour avec succès",
                articleTracking: {
                    id: articleTracking.id,
                    status: articleTracking.status,
                    growth: articleTracking.growth,
                    plant_place: articleTracking.plant_place,
                    picture_url: articleTracking.Picture.url
                }
            });

        } catch (error) {
            error.statusCode = 500;
            return next(error);
        }
    } */
};

export default adminOrderController;