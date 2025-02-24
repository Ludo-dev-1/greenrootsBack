import { verifyToken } from "../../utils/jwt.utils.js"; // Pour le jeton d'authentification
import { ROLES, STATUS_CODES, ERROR_MESSAGES } from "../../utils/constants.utils.js"; // Constantes pour les codes de statut HTTP et les messages d'erreur


/**
 * Middleware d'authentification
 * Vérifie la présence et la validité du token JWT dans les en-têtes de la requête
 * @param {Object} req - L'objet de requête Express
 * @param {Object} res - L'objet de réponse Express
 * @param {Function} next - La fonction next d'Express pour passer au middleware suivant
 */

export const authenticate = (req, res, next) => {
    // Récupère le header d'autorisation
    const authHeader = req.headers.authorization;

    // Vérifie que le header d'autorisation est présent et au bon format
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        const error = new Error(ERROR_MESSAGES.AUTHENTICATION_REQUIRED);
        error.statusCode = STATUS_CODES.UNAUTHORIZED;
        return next(error);
    }

    // Extrait le token du header
    const token = authHeader.split(" ")[1];

    try {
        const decoded = verifyToken(token); // Vérifie et décode le token
        req.user = decoded; // Ajoute les informations utilisateur décodées à la requête
        next();
    } catch (error) {
        error.statusCode = STATUS_CODES.FORBIDDEN;
        next(error);
    }
};

/**
 * Middleware de vérification du rôle administrateur
 * Vérifie si l'utilisateur authentifié a les droits d'administrateur
 * @param {Object} req - L'objet de requête Express
 * @param {Object} res - L'objet de réponse Express
 * @param {Function} next - La fonction next d'Express pour passer au middleware suivant
 */


export const checkAdminAccess = (req, res, next) => {
    // Vérifie si l'utilisateur a le rôle administrateur
    if (req.user.role_id !== ROLES.ADMIN) {
        const error = new Error(ERROR_MESSAGES.UNAUTHORIZED_ACCESS);
        error.statusCode = STATUS_CODES.FORBIDDEN;
        return next(error);
    }
    next();
};