import { verifyToken } from "../../utils/jwt.js";

export const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        const error = new Error("Authentification requise");
        error.statusCode = 401;
        return next(error);
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = verifyToken(token);
        req.user = decoded; // Ajoute les infos utilisateur "décodées" à la requête
        next();
    } catch (error) {
        error.statusCode = 403;
        next(error);
    }
};

// Fonction de vérification du rôle administrateur 
export const checkAdminAccess = (req, res, next) => {
    if (req.user.role_id !== 1) {
        const error = new Error("Accès non autorisé");
        error.statusCode = 403;
        return next(error);
    }
    next();
};