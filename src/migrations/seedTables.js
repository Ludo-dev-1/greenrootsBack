import "dotenv/config";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { User, Role, Order, Tracking, ArticleTracking, Picture, Article, Category, ArticleHasOrder, ArticleHasCategory, sequelize } from "../models/association.js";
import argon2 from "argon2";
import { saveImage, convertImageToBase64 } from "../utils/picture.utils.js";
import { createProductAndPrice } from "../utils/stripe.utils.js";
import { STATUS_CODES, ERROR_MESSAGES } from "../utils/constants.utils.js";


// Configuration du chemin du fichier
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Objet de requête factice pour simuler l'upload d'une image côté back
const fakeReq = {
    protocol: `${process.env.PROTOCOL}`,
    get: (header) => {
        if (header === "host") {
            return `${process.env.HOST}:${process.env.PORT}`;
        }
    }
};

/**
 * Fonction principale pour peupler la base de données
 */

async function seedDatabase() {
    try {
        // Insertion des catégories d'arbres
        await Category.bulkCreate([
            { name: "Arbres fruitiers" },
            { name: "Arbres légendaires" },
            { name: "Arbres mellifères" },
            { name: "Arbres médicinaux" },
            { name: "Arbres tropicaux" },
            { name: "Arbres feuillus" },
            { name: "Arbres à croissance rapide" },
            { name: "Conifères" },
            { name: "Arbres d'ornement" },
            { name: "Arbres forestiers" }
        ]);

        // Insertion des rôles utilisateur
        await Role.bulkCreate([
            { name: "Administrateur" },
            { name: "Membre" }
        ]);

        // Insertion des images d'arbres
        const images = [
            "chene_pedoncule.webp",
            "platane_commun.webp",
            "hetre.webp",
            "saule.webp",
            "bouleau_verruqueux.webp",
            "pin_sylvestre.webp",
            "cedre_du_liban.webp",
            "olivier.webp",
            "acacia.webp",
            "ginkgo_biloba.webp",
            "sequoia_geant.webp",
            "magnolia.webp",
            "tilleul_a_grandes_feuilles.webp",
            "noyer.webp",
            "cerisier_sauvage.webp",
            "charme_commun.webp",
            "frene_eleve.webp",
            "cocotier.webp",
            "mimosa.webp",
            "eucalyptus.webp"
        ];

        const imagePromises = images.map(async (imageName) => {
            const imagePath = path.join(__dirname, "..", "..", "images", imageName);
            const base64Image = convertImageToBase64(imagePath);
            const publicUrl = await saveImage(base64Image, imageName, fakeReq);

            return { url: publicUrl };
        });

        const pictures = await Promise.all(imagePromises);
        await Picture.bulkCreate(pictures);

        // Insertion des articles (arbres)
        const articlesData = [
            { name: "Chêne pédonculé", description: "Arbre robuste à longue durée de vie, utilisé en menuiserie et pour la biodiversité.", picture_id: 1, unit_amount: 12000, available: true },
            { name: "Platane commun", description: "Arbre ornemental, ne produit pas de fruits, beaucoup planté pour agrémenter le paysage routier.", picture_id: 2, unit_amount: 9000, available: true },
            { name: "Hêtre commun", description: "Cet arbre est apprécié pour son rôle crucial dans les écosystèmes forestiers en tant qu'habitat pour de nombreuses espèces.", picture_id: 3, unit_amount: 11000, available: true },
            { name: "Saule pleureur", description: "Arbre ornemental souvent planté près des points d’eau pour sa silhouette élégante.", picture_id: 4, unit_amount: 15000, available: true },
            { name: "Bouleau verruqueux", description: "Arbre résistant au froid, purifiant l’air et favorisant la biodiversité.", picture_id: 5, unit_amount: 8000, available: true },
            { name: "Pin sylvestre", description: "Conifère robuste et résistant, utilisé pour la reforestation et l’exploitation forestière.", picture_id: 6, unit_amount: 10000, available: true },
            { name: "Cèdre du Liban", description: "Arbre majestueux, symbole de longévité et apprécié pour son bois imputrescible.", picture_id: 7, unit_amount: 20000, available: true },
            { name: "Olivier", description: "Arbre méditerranéen produisant des olives, symbole de paix et de résilience.", picture_id: 8, unit_amount: 25000, available: true },
            { name: "Acacia", description: "Arbre à croissance rapide, utilisé en agroforesterie et en médecine traditionnelle.", picture_id: 9, unit_amount: 7500, available: true },
            { name: "Ginkgo biloba", description: "Arbre préhistorique aux vertus médicinales, résistant à la pollution.", picture_id: 10, unit_amount: 18000, available: true },
            { name: "Sequoia géant", description: "Un des plus grands arbres du monde, connu pour sa longévité extrême.", picture_id: 11, unit_amount: 50000, available: true },
            { name: "Magnolia grandiflora", description: "Arbre ornemental à fleurs parfumées, populaire dans les parcs et jardins.", picture_id: 12, unit_amount: 13000, available: true },
            { name: "Tilleul à grandes feuilles", description: "Arbre mellifère favorisant la pollinisation et la biodiversité.", picture_id: 13, unit_amount: 9500, available: true },
            { name: "Noyer commun", description: "Arbre fruitier produisant des noix, apprécié pour son bois précieux.", picture_id: 14, unit_amount: 22000, available: true },
            { name: "Cerisier sauvage", description: "Arbre fruitier donnant des cerises comestibles et apprécié pour ses fleurs printanières.", picture_id: 15, unit_amount: 14000, available: true },
            { name: "Charme commun", description: "Arbre rustique utilisé en haie ou en forêt, résistant et facile à entretenir.", picture_id: 16, unit_amount: 8500, available: true },
            { name: "Frêne élevé", description: "Arbre élancé, apprécié pour sa résistance et son bois utilisé en ébénisterie.", picture_id: 17, unit_amount: 10000, available: true },
            { name: "Cocotier", description: "Arbre tropical produisant des noix de coco, cultivé en régions chaudes.", picture_id: 18, unit_amount: 30000, available: true },
            { name: "Mimosa", description: "Arbre ornemental à fleurs jaunes parfumées, très apprécié dans les jardins.", picture_id: 19, unit_amount: 12000, available: true },
            { name: "Eucalyptus", description: "Arbre à croissance rapide, utilisé en sylviculture et en huiles essentielles.", picture_id: 20, unit_amount: 15000, available: true }
        ];

        for (const articleData of articlesData) {
            const { name, description, unit_amount } = articleData;
            const { product_id, price_id } = await createProductAndPrice(name, description, unit_amount);

            await Article.create({
                ...articleData,
                stripe_product_id: product_id,
                stripe_price_id: price_id,
                price: unit_amount / 100 // Convert to euros if necessary
            });
        }

        // Insertion des utilisateurs
        await User.bulkCreate([
            { firstname: "Nathan", lastname: "Begue", email: "nathan.begue@oclock.school", password: await argon2.hash("arbre"), role_id: 1, emailVerified: true },
            { firstname: "Donovan", lastname: "Grout", email: "donovan.grout@oclock.school", password: await argon2.hash("arbre"), role_id: 1, emailVerified: true },
            { firstname: "Ludovic", lastname: "Thibaud", email: "ludovic.thibaud@oclock.school", password: await argon2.hash("arbre"), role_id: 2, emailVerified: true },
            { firstname: "Léo", lastname: "Khatchatourian", email: "leo.khatchatourian@oclock.school", password: await argon2.hash("arbre"), role_id: 2, emailVerified: true },
        ]);

        // Insertion d'une commande
        await Order.create(
            { article_summary: "Cocotier", date: "06/02/25", total_price: 5555, user_id: 1 }
        );

        // Insertion d'un suivi de plantation
        await Tracking.create(
            { status: "livré et planté", order_id: 1 }
        );

        // Insertion d'une relation article-commande
        await ArticleHasOrder.create(
            { order_id: 1, article_id: 18, quantity: 1 }
        );

        // Insertion d'un suivi d'article
        await ArticleTracking.create(
            { growth: "mature", status: "livré et planté", plant_place: "Amazonie", nickname: "Coco", article_id: 18, article_has_order_id: 1, picture_id: 18 }
        );

        // Insertion des relations article-catégorie
        await ArticleHasCategory.bulkCreate([
            { article_id: 1, category_id: 10 },
            { article_id: 8, category_id: 1 },
            { article_id: 14, category_id: 1 },
            { article_id: 15, category_id: 1 },
            { article_id: 18, category_id: 1 },
            { article_id: 8, category_id: 2 },
            { article_id: 10, category_id: 2 },
            { article_id: 11, category_id: 2 },
            { article_id: 9, category_id: 3 },
            { article_id: 13, category_id: 3 },
            { article_id: 10, category_id: 4 },
            { article_id: 20, category_id: 4 },
            { article_id: 18, category_id: 5 },
            { article_id: 2, category_id: 6 },
            { article_id: 3, category_id: 6 },
            { article_id: 13, category_id: 6 },
            { article_id: 17, category_id: 6 },
            { article_id: 2, category_id: 9 },
            { article_id: 9, category_id: 7 },
            { article_id: 20, category_id: 7 },
            { article_id: 6, category_id: 8 },
            { article_id: 7, category_id: 8 },
            { article_id: 11, category_id: 8 },
            { article_id: 4, category_id: 9 },
            { article_id: 12, category_id: 9 },
            { article_id: 19, category_id: 9 },
            { article_id: 3, category_id: 10 },
            { article_id: 5, category_id: 10 },
            { article_id: 13, category_id: 10 },
            { article_id: 13, category_id: 4 },
            { article_id: 16, category_id: 10 }
        ]);

        await sequelize.close();
    } catch {
        const customError = new Error(ERROR_MESSAGES.SERVER_ERROR);
        customError.statusCode = STATUS_CODES.SERVER_ERROR;
        throw customError;
    } finally {
        await sequelize.close();
    }
}

seedDatabase().catch(() => {
    process.exit(1);
});