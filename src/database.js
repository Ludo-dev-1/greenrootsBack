import "dotenv/config";
import { Sequelize } from "sequelize";

// Créer la connexion vers la BDD via Sequelize
const sequelize = new Sequelize(process.env.PG_URL, {
  define: {
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
});

// Test de connexion (pour vérifier si tout se passe bien)
/* try {
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");
} catch (error) {
    console.error("Unable to connect to the database:", error);
} */

export default sequelize;
