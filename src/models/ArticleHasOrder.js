import { Model, DataTypes } from "sequelize";
import sequelize from "../database.js";

export class ArticleHasOrder extends Model {}

ArticleHasOrder.init({
    id: { // Identifiant unique de la relation article-commande
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    quantity: { // Quantité de l'article dans la commande
        type: DataTypes.INTEGER,
        allowNull: false
    },
    article_id: { // Référence à l'article
        type: DataTypes.INTEGER,
        allowNull: false,
        /* primaryKey: true, // Permet de définir une unicité entre les attributs */
        references: {
            model: "article", // Fait référence à la table article
            key: "id", // Fait référence à la colonne id de la table article
        },
        onDelete: "CASCADE", // Si l'article est supprimé, cette entrée sera aussi supprimée
    },
    order_id: { // Référence à la commande
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
    indexes: [ // Index pour assurer l'unicité de la combinaison article_id et order_id (remplace les "primaryKey: true" des article_id et order_id qui causaient des conflits)
        {
            unique: true,
            fields: ["article_id", "order_id"]
        }
    ]
});
