import "dotenv/config";
import { Model, DataTypes } from "sequelize";
import sequelize from "../database.js";
import { Picture } from "./Picture.js";
import Stripe from "stripe";

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
    picture_id: {
        type: DataTypes.INTEGER,
        references: {
            model: Picture,
            key: "id",
            onDelete: "CASCADE"
        }
    },
    stripe_product_id: {
        type: DataTypes.STRING,
        allowNull: true
    },
    stripe_price_id: {
        type: DataTypes.STRING,
        allowNull: true
    },
}, {
    sequelize,
    tableName: "article",
    hooks: {
        beforeCreate: async (article) => {
            const product = await stripe.products.create({
                name: article.name,
                description: article.description,
            });

            const price = await stripe.prices.create({
                product: product.id,
                unit_amount: article.price * 100, // Conversion en centimes
                currency: 'eur',
            });

            article.stripe_product_id = product.id;
            article.stripe_price_id = price.id;
        }
    }
});
