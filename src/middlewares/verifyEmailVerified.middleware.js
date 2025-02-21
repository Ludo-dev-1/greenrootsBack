import { User } from "../models/association.js"
import { STATUS_CODES, ERROR_MESSAGES } from "../utils/constants.utils.js";

/**
 * Middleware pour vérifier si l'email de l'utilisateur est vérifié
 * @param {Object} req - L'objet de requête Express 
 * @param {Object} res - L'objet de réponse Express
 * @param {Function} next - La fonction next d'Express pour passer au middleware suivant
 */

export const verifyEmailVerified = async (req, res, next) => {
    try {
        // Recherche de l'utilisateur dans la base de données
        const user = await User.findByPk(req.user.id);
        // Vérifie si l'email de l'utilisateur est vérifié
        if (!user.emailVerified) {
            const error = new Error(ERROR_MESSAGES.UNAUTHORIZED_ACCESS + " (Vous devez vérifier votre email avant de passer une commande.)");
            error.statusCode = STATUS_CODES.FORBIDDEN;
            return next(error);
        }
        next();
    } catch (error) {
        next(error);
    }
}