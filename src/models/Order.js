import { Model, DataTypes } from "sequelize";
import sequelize from "../database.js";
import { User } from "./User.js";

export class Order extends Model { }

Order.init({
    article_summary: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    date: {
        type: DataTypes.DATE,
        allowNull: false
    },
    total_price: { // Montant total de la commande, calculé à partir des prix des articles commandés
        type: DataTypes.DECIMAL(10, 2),  // Type de données : décimal avec 10 chiffres dont 2 après la virgule
        allowNull: false
    },
    // ID de l'utilisateur qui a passé la commande
    user_id: {
        type: DataTypes.INTEGER,
        references: {
            model: User,
            key: "id",
            onDelete: "CASCADE" // Suppression en cascade si l'utilisateur est supprimé
        }
    }
}, {
    sequelize,
    tableName: "order"
});