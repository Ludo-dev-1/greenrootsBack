import { Model, DataTypes } from "sequelize";
import sequelize from "../database.js";

export class Picture extends Model {}

Picture.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    url: {
        type: DataTypes.TEXT,
        allowNull: false,
        unique: true
    },
}, {
    sequelize,
    tableName: "picture"
});