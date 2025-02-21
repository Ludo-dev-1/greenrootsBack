import jwt from "jsonwebtoken";

/**
 * Génère un token JWT pour un utilisateur
 * @param {Object} user - L'objet utilisateur contenant les informations à inclure dans le token
 * @returns {string} - Le token JWT généré
 */

export const generateToken = (user) => {
    // Définition du payload du token
    const payload = {
        id: user.id,
        email: user.email,
        role_id: user.role_id
    }

    // Récupération de la clé secrète depuis les variables d'environnement
    const secret = process.env.JWT_SECRET;
    // Configuration des options du token, notamment sa durée de validité
    const options = { expiresIn: "8h" }; // Expiration du token dans 8h

    // Génération et retour du token signé
    return jwt.sign(payload, secret, options);
};

/**
 * Vérifie la validité d'un token JWT
 * @param {string} token - Le token JWT à vérifier 
 * @returns {Object} - Les données décodées du token si celui-ci est valide
 * @throws {Error} - Si le token est invalide ou expiré
 */

export const verifyToken = (token) => {
    // Récupération de la clé secrète depuis les variables d'environnement
    const secret = process.env.JWT_SECRET;

    try {
        // Vérification et décodage du token
        return jwt.verify(token, secret); // Retourne les données si le token est valide
    } catch (error) {
        // Lève une erreur si le token est invalide ou expiré
        throw new Error("Token invalide ou expiré");
    }
}