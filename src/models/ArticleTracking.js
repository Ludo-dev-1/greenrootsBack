import { Model, DataTypes } from "sequelize";
import sequelize from "../database.js";

export class ArticleTracking extends Model {}

ArticleTracking.init({
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
    },
    nickname: {
        type: DataTypes.STRING,
        allowNull: true
    },
    article_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'article',
            key: 'id'
        }
    },
    article_has_order_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'article_has_order',
            key: 'id'
        }
    },
    picture_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'picture',
            key: 'id'
        }
    }
}, {
    sequelize,
    tableName: "article_tracking"
});