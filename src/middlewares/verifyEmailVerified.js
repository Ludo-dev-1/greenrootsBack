import { User } from "../models/association.js"
import { STATUS_CODES, ERROR_MESSAGES } from "../utils/constants.js";

export const verifyEmailVerified = async (req, res, next) => {
    try {
        const user = await User.findByPk(req.user.id);
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