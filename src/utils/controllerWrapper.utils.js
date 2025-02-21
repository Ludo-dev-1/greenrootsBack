import { STATUS_CODES, ERROR_MESSAGES } from "./constants.utils.js";

/**
 * Wrapper pour les fonctions des contrôleurs pour gérer les erreurs de manière uniforme
 * @param {Function} mdw - La fonction middleware du contrôleur à wrapper 
 * @returns {Function} - Une nouvelle fonction middleware qui gère les erreurs
 */

export function controllerWrapper(mdw) {
    return async (req, res, next) => {
        try {
            // Exécution du middleware original
            await mdw(req, res, next);
        } catch (error) {
            console.error(error);
            // Envoi d'une réponse d'erreur générique au client
            res.status(STATUS_CODES.SERVER_ERROR).json({ error: ERROR_MESSAGES.SERVER_ERROR + "(Unexpected server error. Please try again later.)" }); 
            // Stack leaking : on envoie au client une réponse 500 générique afin de ne pas faire fuiter d'information concernant notre stack technique !
            // Par exemple, si erreur Sequelize, alors : l'erreur Sequelize qui a eu lieu est affichée côté backend avec le console.log, mais le client n'en sait rien
        }
    };
}