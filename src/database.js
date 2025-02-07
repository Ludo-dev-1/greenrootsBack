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

export default sequelize;