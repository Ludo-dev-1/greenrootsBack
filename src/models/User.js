import { Model, DataTypes } from "sequelize";
import sequelize from "../database.js";

export class User extends Model {}

User.init({
    firstname: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    lastname: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    email: {
        type: DataTypes.TEXT,
        allowNull: false,
        unique: true
    },
    password: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    role_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 2 
    },
    // Indique si l'email de l'utilisateur a été vérifié
    emailVerified: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false, // Par défaut, l'email n'est pas vérifié
    },
    // Token pour la vérification de l'email
    verificationToken: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    // Champs de réinitialisation de token (mot de passe)
    resetToken: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    // Date d'expiration du token de réinitialisation
    resetTokenExpiration: {
        type: DataTypes.DATE,
        allowNull: true,
    }
}, {
    sequelize,
    tableName: "user"
});