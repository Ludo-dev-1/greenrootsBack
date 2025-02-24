import { sequelize } from "../models/association.js";

/**
 * Fonction pour exécuter une opération dans une transaction
 * @param {Function} operation - La fonction à exécuter dans la transaction
 * @returns {Promise<any>} - Le résultat de l'opération
 * @throws {Error} - Si une erreur se produit pendant l'opération
 */

export const withTransaction = async (operation) => {
    // Nouvelle transaction
    const transaction = await sequelize.transaction();
    try {
        // Exécution de l'opération en passant la transaction en argument
        const result = await operation(transaction);
        // Validation de la transaction si l'opération réussit
        await transaction.commit();
        return result;
    } catch (error) {
        // Annulation de la transaction en cas d'erreur
        await transaction.rollback();
        // Propagation de l'erreur pour qu'elle puisse être gérée en amont
        throw error;
    }
};