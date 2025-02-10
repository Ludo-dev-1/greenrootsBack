import { Article, Order, Picture, User, Tracking } from "../models/association.js";

const mainRoute = {
    // Récupération de tous les articles nouvellement créés
    getNewArticles: async (req, res, next) => {
        try {
            const articles = await Article.findAll({
                order: [["created_at", "DESC"]]
            });

            if (!articles) {
                error.statusCode = 404;
                return next(error);
            };

            const pictures = await Picture.findAll();

            if (!pictures) {
                const newError = new Error("Images non trouvées")
                newError.statusCode = 404;
                return next(newError);
            };

            res.status(200).json({ articles, pictures});

        } catch (error) {
            error.statusCode = 500;
            return next(error);
        }
    },

    // Récupération de tout les articles
    getAllArticles: async (req, res, next) => {
        try {
            const articles = await Article.findAll();

            if (!articles) {
                error.statusCode = 404;
                return next(error);
            };

            const pictures = await Picture.findAll();

            if (!pictures) {
                const newError = new Error("Images non trouvées")
                newError.statusCode = 404;
                return next(newError);
            };

            res.status(200).json({ articles, pictures});

        } catch (error) {
            error.statusCode = 500;
            return next(error);
        }
    },

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

    registerUserForm: async (req, res, next) => {
        try {
            res.status(200).json({ message: "Formulaire d'inscription" });

        } catch (error) {
            error.statusCode = 500;
            return next(error);
        }
    },

    loginUserForm: async (req, res, next) => {
        try {
            res.status(200).json({ message: "Formulaire de connexion" });

        } catch (error) {
            error.statusCode = 500;
            return next(error);
        }
    },
    login: async (req, res, next) => {
        try {
            res.status(200).json({ message: "Formulaire de connexion" });

        } catch (error) {
            error.statusCode = 500;
            return next(error);
        }
    },

    forgetPassword: async (req, res, next) => {
        try {
            res.status(200).json({ message: "Mot de passe oublié ?" });

        } catch (error) {
            error.statusCode = 500;
            return next(error);
        }
    },

    getCGU: async (req, res, next) => {
        try {
            res.status(200).json({ message: "Conditions Générales d'Utilisation" });

        } catch (error) {
            error.statusCode = 500;
            return next(error);
        }
    },

    getUserProfile: async (req, res, next) => {
        try {
            const userId = req.user.id;

            const user = await User.findByPk(userId);

            if (!user) {
                const error = new Error("Utilisateur non trouvé");
                error.statusCode = 404;
                return next(error);
            }

            res.status(200).json({ message: `Bonjour ${user.firstname}`, user: req.user });

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
};

export default mainRoute;