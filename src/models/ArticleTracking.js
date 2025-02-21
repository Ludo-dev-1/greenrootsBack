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
    // ID de l'article associé
    article_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'article',
            key: 'id'
        }
    },
    // ID de la relation article-commande
    article_has_order_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'article_has_order',
            key: 'id'
        }
    },
    // ID de l'image associée
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