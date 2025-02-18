import { verifyToken } from "../../utils/jwt.js";
import { ROLES, STATUS_CODES, ERROR_MESSAGES } from "../../utils/constants.js";

export const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        const error = new Error(ERROR_MESSAGES.AUTHENTICATION_REQUIRED);
        error.statusCode = STATUS_CODES.UNAUTHORIZED;
        return next(error);
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = verifyToken(token);
        req.user = decoded; // Ajoute les infos utilisateur "décodées" à la requête
        next();
    } catch (error) {
        error.statusCode = STATUS_CODES.FORBIDDEN;
        next(error);
    }
};

// Fonction de vérification du rôle administrateur 
export const checkAdminAccess = (req, res, next) => {
    if (req.user.role_id !== ROLES.ADMIN) {
        const error = new Error(ERROR_MESSAGES.UNAUTHORIZED_ACCESS);
        error.statusCode = STATUS_CODES.FORBIDDEN;
        return next(error);
    }
    next();
};