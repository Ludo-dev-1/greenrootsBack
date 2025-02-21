// Importation des constantes pour les codes de statut HTTP et les messages d'erreur
import { STATUS_CODES, ERROR_MESSAGES } from "../../utils/constants.utils.js";

/**
 * Fonction de création d'un middleware de validation générique utilisant Joi
 * @param {Object} schema - Le schéma Joi à utiliser pour la validation 
 * @returns {Function} Middleware de validation
 */

export const validate = (schema) => (req, res, next) => {
    try {
        // Validation du corps de la requête avec le schéma Joi fourni
        const { error } = schema.validate(req.body);
        // Si une erreur de validation est détectée
        if (error) {
            // Renvoie une réponse avec le statut 400 (Bad Request) et les détails de l'erreur
            return res.status(STATUS_CODES.BAD_REQUEST).json({
                error: error.details.map(detail => detail.message).join(", ")
            });
        }
        next();
    } catch (error) {
        next(error);
    }
};