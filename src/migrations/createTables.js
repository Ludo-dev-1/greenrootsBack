import "../models/association.js";
import { sequelize } from "../models/association.js";

async function createTables() {
    try {
        // Supprime toutes les tables existantes dans la base de données
        await sequelize.drop();
        console.log("tables dropped");
        // Synchronise les modèles avec la base de données, créant les tables nécessaires
        await sequelize.sync();
        console.log("databases synchronized");
    } catch (error) {
        console.log(error);
        // Termine le processus avec un code d'erreur (1)
        process.exit(1);
    };
};

createTables();