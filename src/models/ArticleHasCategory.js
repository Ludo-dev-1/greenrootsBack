import { Model, DataTypes } from "sequelize";
import sequelize from "../database.js";

export class ArticleHasCategory extends Model {}

ArticleHasCategory.init({
    article_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true, // Permet de définir une unicité entre les attributs
        references: {
            model: "article", // Fait référence à la table article
            key: "id", // Fait référence à la colonne id de la table article
        },
        onDelete: "CASCADE", // Si l'article est supprimé, cette entrée sera aussi supprimée
    },
    category_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true, // Permet de définir une unicité entre les attributs
        references: {
            model: "category", // Fait référence à la table category
            key: "id", // Fait référence à la colonne id de la table category
        },
        onDelete: "CASCADE", // Si l'article est supprimé, cette entrée sera aussi supprimée
    },
    }, {
    sequelize,
    tableName: "article_has_category"
});
