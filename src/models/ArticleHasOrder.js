import { Model, DataTypes } from "sequelize";
import sequelize from "../database.js";

export class ArticleHasOrder extends Model {}

ArticleHasOrder.init({
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    article_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        /* primaryKey: true, // Permet de définir une unicité entre les attributs */
        references: {
            model: "article", // Fait référence à la table article
            key: "id", // Fait référence à la colonne id de la table article
        },
        onDelete: "CASCADE", // Si l'article est supprimé, cette entrée sera aussi supprimée
    },
    order_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        /* primaryKey: true, // Permet de définir une unicité entre les attributs */
        references: {
            model: "order", // Fait référence à la table article
            key: "id", // Fait référence à la colonne id de la table article
        },
        onDelete: "CASCADE", // Si l'article est supprimé, cette entrée sera aussi supprimée
    },
    }, {
    sequelize,
    tableName: "article_has_order",
    indexes: [
        {
            unique: true,
            fields: ['article_id', 'order_id']
        }
    ]
});
