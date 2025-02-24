import "dotenv/config";
import { Model, DataTypes } from "sequelize";
import sequelize from "../database.js";
import { Picture } from "./Picture.js";
import Stripe from "stripe";

// Initialisation de l'instance Stripe avec la clé secrète
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

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
    },
    // ID de l'image associée
    picture_id: {
        type: DataTypes.INTEGER,
        references: {
            model: Picture,
            key: "id",
            onDelete: "CASCADE"
        }
    },
    // ID du produit Stripe associé
    stripe_product_id: {
        type: DataTypes.STRING,
        allowNull: false
    },
    // ID du prix Stripe associé
    stripe_price_id: {
        type: DataTypes.STRING,
        allowNull: false
    },
}, {
    sequelize,
    tableName: "article",
    hooks: {
        // Hook exécuté avant la création d'un article
        beforeCreate: async (article) => {
            // Création du produit dans Stripe
            const product = await stripe.products.create({
                name: article.name,
                description: article.description,
            });

            // Crée le prix dans Stripe
            const price = await stripe.prices.create({
                product: product.id,
                unit_amount: article.price * 100, // Conversion en centimes
                currency: "eur",
            });

            // Assignation des IDs Stripe à l'article
            article.stripe_product_id = product.id;
            article.stripe_price_id = price.id;
        }
    }
});
