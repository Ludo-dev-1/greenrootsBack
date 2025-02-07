import { Model, DataTypes } from "sequelize";
import sequelize from "../database.js";

export class ArticleHasCategory extends Model {}

ArticleHasCategory.init({
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
    category_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        references: {
            model: "category",
            key: "id",
        },
        onDelete: "CASCADE",
    },
    }, {
    sequelize,
    tableName: "article_has_category"
});
