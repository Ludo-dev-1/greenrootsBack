import { Model, DataTypes } from "sequelize";
import sequelize from "../database.js";

export class Category extends Model { }

Category.init({
    name: {
        type: DataTypes.TEXT,
        allowNull: false,
        unique: true
    }
}, {
    sequelize,
    tableName: "category"
});