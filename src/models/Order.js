import { Model, DataTypes } from "sequelize";
import sequelize from "../database.js";

export class Order extends Model {}

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
        type: DataTypes.DECIMAL(10,2),  // Type de données : décimal avec 10 chiffres dont 2 après la virgule
        allowNull: false
    }
}, {
    sequelize,
    tableName: "order"
});