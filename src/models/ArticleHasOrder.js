import { Model, DataTypes } from "sequelize";
import sequelize from "../database.js";

export class ArticleHasOrder extends Model {}

ArticleHasOrder.init({
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    article_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        references: {
            model: "article",
            key: "id",
        },
        onDelete: "CASCADE",
    },
    order_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        references: {
            model: "order",
            key: "id",
        },
        onDelete: "CASCADE",
    },
    }, {
    sequelize,
    tableName: "article_has_order"
});
