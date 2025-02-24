import "dotenv/config";
import { Sequelize } from "sequelize";

// Création de la connexion à la base de données via Sequelize
const sequelize = new Sequelize(process.env.PG_URL, {
    define: {
    // Configuration des timestamps pour tous les modèles
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
    },
});

export default sequelize;