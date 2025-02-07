import { Model, DataTypes } from "sequelize";
import sequelize from "../database.js";

export class Article extends Model {}

Article.init({
    name: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    price: {
        type: DataTypes.DECIMAL(10,2), // Type de données : décimal avec 10 chiffres dont 2 après la virgule
        allowNull: false
    },
    available: {
        type: DataTypes.BOOLEAN,
        allowNull: false
    }
}, {
    sequelize,
    tableName: "article"
});
