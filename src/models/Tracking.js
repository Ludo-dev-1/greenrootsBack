import { Model, DataTypes } from "sequelize";
import sequelize from "../database.js";

export class Tracking extends Model {}

Tracking.init({
    growth: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    status: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    plant_place: {
        type: DataTypes.TEXT,
        allowNull: false
    }
}, {
    sequelize,
    tableName: "tracking"
});