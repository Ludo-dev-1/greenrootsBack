import { Order, User, Article, ArticleHasOrder, Tracking, ArticleTracking, Picture, sequelize } from "../models/association.js";
import { sendEmail } from "../services/emailService.js"; // Service d'envoi d'email
import { withTransaction } from "../utils/commonOperations.utils.js"; // Fonction utilitaire de gestion des transactions
import { STATUS_CODES, ERROR_MESSAGES } from "../utils/constants.utils.js"; // Constantes pour les codes de statut HTTP et les messages d'erreur

const adminOrderController = {
    // Récupération de toutes les commandes triées par date décroissante
    getAllOrders: async (req, res, next) => {
        try {
            const orders = await Order.findAll({
                order: [["date", "DESC"]]
            });

            // Si aucune commande n'est trouvée, renvoie une erreur
            if (!orders || orders.length === 0) {
                const error = new Error(ERROR_MESSAGES.RESOURCE_NOT_FOUND + " (Commande)");
                error.statusCode = STATUS_CODES.NOT_FOUND;;
                return next(error);
            };

            // Renvoie les commandes en réponse
            res.status(STATUS_CODES.OK).json(orders);

        } catch (error) {
            // Passe l'erreur au middleware de gestion d'erreurs
            next(error);
        }
    },

    // Récupération des détails d'une commande spécifique
    getOrderDetailsAdmin: async (req, res, next) => {
        try {
            const orderId = req.params.id;

            // Récupère la commande avec les informations de l'utilisateur et des articles associés
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

            // Si la commande n'est pas trouvée, renvoie une erreur
            if (!order) {
                const error = new Error(ERROR_MESSAGES.RESOURCE_NOT_FOUND + " (Commande)");
                error.statusCode = STATUS_CODES.NOT_FOUND;;
                return next(error);
            }

            // Renvoie les détails de la commande en réponse
            res.status(STATUS_CODES.OK).json(order);
        } catch (error) {
            // Passe l'erreur au middleware de gestion d'erreurs
            next(error);
        }
    },

    // Récupération du suivi d'une commande spécifique
    getOrderTrackingAdmin: async (req, res, next) => {
        try {
            const orderId = req.params.id;

            // Récupère la commande avec les informations de l'utilisateur, le suivi, les articles et leur suivi
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

            // Si la commande n'est pas trouvée, renvoie une erreur
            if (!order) {
                const error = new Error(ERROR_MESSAGES.RESOURCE_NOT_FOUND + " (Commande)");
                error.statusCode = STATUS_CODES.NOT_FOUND;;
                return next(error);
            }

            // Renvoie les détails du suivi de la commande en réponse
            res.status(STATUS_CODES.OK).json(order);
        } catch (error) {
            // Passe l'erreur au middleware de gestion d'erreurs
            next(error);
        }
    },

    // Récupération du suivi d'un article spécifique d'une commande
    getArticleTrackingAdmin: async (req, res, next) => {
        try {
            const { orderId, trackingId } = req.params;

            // Récupère le suivi de l'article avec les informations de l'image et de la commande associée
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

            // Si le suivi de l'article n'est pas trouvé, renvoie une erreur
            if (!articleTracking) {
                const error = new Error(ERROR_MESSAGES.RESOURCE_NOT_FOUND + " (Suivi d'article)");
                error.statusCode = STATUS_CODES.NOT_FOUND;;
                return next(error);
            }

            // Renvoie les détails du suivi de l'article en réponse
            res.status(STATUS_CODES.OK).json(articleTracking);
        } catch (error) {
            // Passe l'erreur au middleware de gestion d'erreurs
            next(error);
        }
    },

    // Mise à jour du suivi d'un article spécifique d'une commande
    updateArticleTracking: async (req, res, next) => {
        try {
            // Récupération de l'ID de l'utilisateur connecté depuis le middleware d'authentification
            const userId = req.user.id;
            // Extraction des paramètres de la requête
            const { orderId, trackingId } = req.params;
            // Extraction des données envoyées depuis le corps de la requête
            const { status, growth, plant_place, picture_url } = req.body;

            // Utilisation d'une transaction pour s'assurer que toutes les opérations soient traitées
            const updatedTracking = await withTransaction(async (transaction) => {
                // Recherche du suivi d'article correspondant à l'ID fourni
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
                                    // Vérifie que le suivi appartient bien à la commande spécifiée
                                    model: Order,
                                    where: { id: orderId }
                                }
                            ]
                        }
                    ],
                    transaction // Exécution dans le contexte de la transaction
                });
    
                // Si le suivi d'article n'est pas trouvé, renvoie une erreur
                if (!articleTracking) {
                    const error = new Error(ERROR_MESSAGES.RESOURCE_NOT_FOUND + " (Suivi d'article)");
                    error.statusCode = STATUS_CODES.NOT_FOUND;;
                    throw error;
                }

                // Met à jour les champs du suivi d'article si des valeurs sont fournies dans la requête
                if (status) articleTracking.status = status;
                if (growth) articleTracking.growth = growth;
                if (plant_place) articleTracking.plant_place = plant_place;
                if (picture_url) articleTracking.picture_url = picture_url;

                // Récupère les informations de l'utilisateur pour envoyer un email de notification
                const user = await User.findByPk(userId, { transaction });
                const email = user.email;
                const firstname = user.firstname;

                // Envoie l'e-mail pour informer l'utilisateur des mises à jour du suivi
                await sendEmail(email, "Nouvelles informations concernant le suivi de votre arbre", "newTrackingUpdate", {
                    firstname,
                    growth: articleTracking.growth,
                    status: articleTracking.status,
                    plant_place: articleTracking.plant_place,
                    nickname: articleTracking.nickname ? articleTracking.nickname : "", // Ajout du surnom de l'article si disponible
                });
                

                // Sauvegarde des changements dans la base de données
                await articleTracking.save({ transaction });

                // Retourne le suivi mis à jour
                return articleTracking;
            });

            // Réponse HTTP avec les détails du suivi mis à jour
            res.status(STATUS_CODES.OK).json({
                message: "Suivi d'article mis à jour avec succès",
                articleTracking: {
                    id: updatedTracking.id,
                    status: updatedTracking.status,
                    growth: updatedTracking.growth,
                    plant_place: updatedTracking.plant_place,
                    picture_url: updatedTracking.Picture.url // Renvoie l'URL de l'image associée
                }
            });
        } catch (error) {
            // Passe l'erreur au middleware global de gestion des erreurs
            next(error);
        }
    }
};

export default adminOrderController;