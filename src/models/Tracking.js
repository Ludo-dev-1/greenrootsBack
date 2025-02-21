import { Model, DataTypes } from "sequelize";
import sequelize from "../database.js";

export class Tracking extends Model {}

Tracking.init({
    status: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    // ID de la commande associée
    order_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'order',
            key: 'id'
        }
    }
}, {
    sequelize,
    tableName: "tracking"
});