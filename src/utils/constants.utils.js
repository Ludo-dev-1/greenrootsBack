/**
 * Constantes pour les rôles utilisateur
 * @enum {number}
 */

export const ROLES = {
    ADMIN: 1, // Identifiant pour le rôle administrateur
    MEMBER: 2 // Identifiant pour le rôle membre
};

/**
 * Constantes pour les codes de statut HTTP
 * @enum {number}
 */

export const STATUS_CODES = {
    OK: 200,            // Requête réussie
    CREATED: 201,       // Ressource créée avec succès
    BAD_REQUEST: 400,   // Requête invalide
    UNAUTHORIZED: 401,  // Authentification nécessaire
    FORBIDDEN: 403,     // Accès refusé
    NOT_FOUND: 404,     // Ressource non trouvée
    SERVER_ERROR: 500   // Erreur interne du serveur
};

/**
 * Messages d'erreur standardisés
 * @enum {string}
 */

export const ERROR_MESSAGES = {
    AUTHENTICATION_REQUIRED: "Authentification requise",
    UNAUTHORIZED_ACCESS: "Accès non autorisé",
    ROUTE_NOT_FOUND: "Root non trouvée",
    SERVER_ERROR: "Une erreur est survenue",
    RESOURCE_NOT_FOUND: "Ressource non trouvée",
    INVALID_INPUT: "Données d'entrée invalides"
};