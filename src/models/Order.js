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
    price: {
        type: DataTypes.DECIMAL(10,2),
        allowNull: false
    }
}, {
    sequelize,
    tableName: "order"
});