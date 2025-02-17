import { Order, User, Article, ArticleHasOrder, Tracking, ArticleTracking, Picture, sequelize } from "../models/association.js";

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

    getArticleTrackingAdmin: async (req, res, next) => {
        try {
            // Vérifier si l'utilisateur est un administrateur
            if (req.user.role_id !== 1) {
                return res.status(403).json({ error: "Accès non autorisé" });
            }

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
                error.statusCode = 404;
                return next(error);
            }

            res.status(200).json(articleTracking);
        } catch (error) {
            error.statusCode = 500;
            return next(error);
        }
    },

    updateArticleTracking: async (req, res, next) => {
        const transaction = await sequelize.transaction();
        try {
            // Vérifier si l'utilisateur est un administrateur
            if (req.user.role_id !== 1) {
                return res.status(403).json({ error: "Accès non autorisé" });
            }

            const { orderId, trackingId } = req.params;
            const { status, growth, plant_place, picture_url } = req.body;

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
                await transaction.rollback();
                error.statusCode = 404;
                return next(error);
            }

            // Mettre à jour les champs
            if (status) articleTracking.status = status;
            if (growth) articleTracking.growth = growth;
            if (plant_place) articleTracking.plant_place = plant_place;
            if (picture_url) articleTracking.picture_url = picture_url;

            // Mise à jour de l'image

            // Sauvegarde des changements
            await articleTracking.save({ transaction });

            await transaction.commit();

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
            await transaction.rollback();
            error.statusCode = 500;
            return next(error);
        };
    }
};

export default adminOrderController;