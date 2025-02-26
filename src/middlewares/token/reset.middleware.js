import crypto from "node:crypto";
import { Op } from "sequelize";
import { User } from "../../models/association.js";
import { STATUS_CODES, ERROR_MESSAGES } from "../../utils/constants.utils.js";

/**
 * Middleware pour générer un token de réinitialisation de mot de passe
 * @param {Object} req - L'objet de requête Express
 * @param {Object} res - L'objet de réponse Express
 * @param {Function} next - La fonction next d'Express pour passer au middleware suivant
 */

const generateResetToken = async (req, res, next) => {
    try {
        const { email } = req.body;

        // Vérifier l'existence de l'utilisateur
        const user = await User.findOne({ where: { email } });

        if (!user) {
            const error = new Error(ERROR_MESSAGES.RESOURCE_NOT_FOUND + " (Aucun compte associé à cet email n'a été trouvé.)");
            error.statusCode = STATUS_CODES.NOT_FOUND;
            throw error;
        }

        // Générer un token de réinitialisation sécurisé
        const token = crypto.randomBytes(32).toString("hex");

        // Sauvegarder le token dans la base de données avec une durée de validité
        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 3600000; // 1 heure de validité
        await user.save();

        // Ajouter le token généré à la requête pour une utilisation ultérieure
        req.resetToken = token;
        req.user = user;
        next();
    } catch (error) {
        next(error);
    }
};

/**
 * Middleware pour vérifier la validité d'un token de réinitialisation
 * @param {Object} req - L'objet de requête Express
 * @param {Object} res - L'objet de réponse Express
 * @param {Function} next - La fonction next d'Express pour passer au middleware suivant
 */

const verifyResetToken = async (req, res, next) => {
    const { token } = req.params;

    try {
        // Recherche d'un utilisateur avec le token valide et non expiré
        const user = await User.findOne({
            where: {
                resetToken: token,
                resetTokenExpiration: { [Op.gt]: Date.now() },
            },
        });

        if (!user) {
            // Création d'une erreur si le token est invalide ou expiré
            const error = new Error(ERROR_MESSAGES.INVALID_INPUT + " (Token invalide ou expiré)");
            error.statusCode = STATUS_CODES.BAD_REQUEST;
            throw error;
        }

        // Ajout de l'utilisateur à la requête pour une utilisation ultérieure
        req.user = user;
        next();
    } catch (error) {
        next(error);
    }
};

export { generateResetToken, verifyResetToken };