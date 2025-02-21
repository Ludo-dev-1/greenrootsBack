import { STATUS_CODES, ERROR_MESSAGES } from "../utils/constants.utils.js";

/**
 * Middleware pour gérer les routes non trouvées
 * @param {Object} req - L'objet de requête Express
 * @param {Object} res - L'objet de réponse Express
 * @param {Function} next - La fonction next d'Express pour passer au middleware suivant
 */

const notFound = (req, res, next) => {
    // Création d'une erreur pour les routes non trouvées
    const error = new Error(ERROR_MESSAGES.ROUTE_NOT_FOUND);
    error.statusCode = STATUS_CODES.NOT_FOUND;
    next(error);
};

/**
 * Middleware de gestion globale des erreurs
 * @param {Error} error - L'objet d'erreur 
 * @param {Object} req - L'objet de requête Express
 * @param {Object} res - L'objet de réponse Express
 * @param {Function} next - La fonction next d'Express pour passer au middleware suivant (pas utilisée ici mais nécessaire pour la signature du middleware)
 */

const errorHandler = (error, req, res, next) => {
    console.error("Erreur interceptée :", error);
    // Détermination du code de statut HTTP
    const status = error.statusCode || STATUS_CODES.SERVER_ERROR;
    // Détermination du message d'erreur
    const errorMessage = error.message || ERROR_MESSAGES.SERVER_ERROR;

    // Envoi de la réponse d'erreur
    res.status(status).json({
        status, 
        error: Array.isArray(errorMessage) ? errorMessage : [errorMessage] 
    });
};

export { notFound, errorHandler };