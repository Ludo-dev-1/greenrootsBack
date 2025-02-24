import "dotenv/config";
import { STATUS_CODES, ERROR_MESSAGES } from "../utils/constants.utils.js";

/**
 * Middleware pour vérifier la clé API
 * @param {Object} req - L'objet de requête Express
 * @param {Object} res - L'objet de réponse Express
 * @param {Function} next - La fonction next d'Express pour passer au middleware suivant
 */

const apiKeyMiddleware = (req, res, next) => {
    // Extraction de la clé API de l'en-tête de la requête
    const apiKey = req.headers["x-api-key"];
    // Vérification de la présence et de la validité de la clé API
    if (!apiKey || apiKey !== process.env.API_KEY) {
        const error = new Error(ERROR_MESSAGES.UNAUTHORIZED_ACCESS);
        error.statusCode = STATUS_CODES.FORBIDDEN;
        return next(error);
    }
    next();
};

export default apiKeyMiddleware;