import { User, Role, Order, Tracking, Picture, Article, Category, ArticleHasOrder, ArticleHasCategory } from "../models/association.js";

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
        await Picture.bulkCreate([
            { url: "ChenePedoncule", description: "Arbre robuste à longue durée de vie, utilisé en menuiserie et pour la biodiversité." },
            { url: "PlataneCommun", description: "Arbre forestier apprécié pour son bois et ses feuilles persistantes en hiver." },
            { url: "HetreCommun", description: "Arbre robuste à longue durée de vie, utilisé en menuiserie et pour la biodiversité." },
            { url: "SaulePleureur", description: "Arbre ornemental souvent planté près des points d’eau pour sa silhouette élégante." },
            { url: "BouleauVerruqueux", description: "Arbre résistant au froid, purifiant l’air et favorisant la biodiversité." },
            { url: "PinSylvestre", description: "Conifère robuste et résistant, utilisé pour la reforestation et l’exploitation forestière." },
            { url: "CedreDuLiban", description: "Arbre majestueux, symbole de longévité et apprécié pour son bois imputrescible." },
            { url: "Olivier", description: "Arbre méditerranéen produisant des olives, symbole de paix et de résilience." },
            { url: "Acacia", description: "Arbre à croissance rapide, utilisé en agroforesterie et en médecine traditionnelle." },
            { url: "GinkgoBiloba", description: "Arbre préhistorique aux vertus médicinales, résistant à la pollution." },
            { url: "SequoiaGeant", description: "Un des plus grands arbres du monde, connu pour sa longévité extrême." },
            { url: "MagnoliaGrandiflora", description: "Arbre ornemental à fleurs parfumées, populaire dans les parcs et jardins." },
            { url: "TilleulAGrandesFeuilles", description: "Arbre mellifère favorisant la pollinisation et la biodiversité." },
            { url: "NoyerCommun", description: "Arbre fruitier produisant des noix, apprécié pour son bois précieux." },
            { url: "CerisierSauvage", description: "Arbre fruitier donnant des cerises comestibles et apprécié pour ses fleurs printanières." },
            { url: "CharmeCommun", description: "Arbre rustique utilisé en haie ou en forêt, résistant et facile à entretenir." },
            { url: "FreneEleve", description: "Arbre élancé, apprécié pour sa résistance et son bois utilisé en ébénisterie." },
            { url: "Cocotier", description: "Arbre tropical produisant des noix de coco, cultivé en régions chaudes." },
            { url: "Mimosa", description: "Arbre ornemental à fleurs jaunes parfumées, très apprécié dans les jardins." },
            { url: "Eucalyptus", description: "Arbre à croissance rapide, utilisé en sylviculture et en huiles essentielles." }
        ]);

        // Insertion des articles (arbres)
        await Article.bulkCreate([
            { name: "Chêne pédonculé", description: "Arbre robuste à longue durée de vie, utilisé en menuiserie et pour la biodiversité.", picture_id: 1, price: 120, available: true },
            { name: "Platane commun", description: "Arbre forestier apprécié pour son bois et ses feuilles persistantes en hiver.", picture_id: 2, price: 90, available: true },
            { name: "Hêtre commun", description: "Arbre robuste à longue durée de vie, utilisé en menuiserie et pour la biodiversité.", picture_id: 3, price: 110, available: true },
            { name: "Saule pleureur", description: "Arbre ornemental souvent planté près des points d’eau pour sa silhouette élégante.", picture_id: 4, price: 150, available: true },
            { name: "Bouleau verruqueux", description: "Arbre résistant au froid, purifiant l’air et favorisant la biodiversité.", picture_id: 5, price: 80, available: true },
            { name: "Pin sylvestre", description: "Conifère robuste et résistant, utilisé pour la reforestation et l’exploitation forestière.", picture_id: 6, price: 100, available: true },
            { name: "Cèdre du Liban", description: "Arbre majestueux, symbole de longévité et apprécié pour son bois imputrescible.", picture_id: 7, price: 200, available: true },
            { name: "Olivier", description: "Arbre méditerranéen produisant des olives, symbole de paix et de résilience.", picture_id: 8, price: 250, available: true },
            { name: "Acacia", description: "Arbre à croissance rapide, utilisé en agroforesterie et en médecine traditionnelle.", picture_id: 9, price: 75, available: true },
            { name: "Ginkgo biloba", description: "Arbre préhistorique aux vertus médicinales, résistant à la pollution.", picture_id: 10, price: 180, available: true },
            { name: "Sequoia géant", description: "Un des plus grands arbres du monde, connu pour sa longévité extrême.", picture_id: 11, price: 500, available: true },
            { name: "Magnolia grandiflora", description: "Arbre ornemental à fleurs parfumées, populaire dans les parcs et jardins.", picture_id: 12, price: 130, available: true },
            { name: "Tilleul à grandes feuilles", description: "Arbre mellifère favorisant la pollinisation et la biodiversité.", picture_id: 13, price: 95, available: true },
            { name: "Noyer commun", description: "Arbre fruitier produisant des noix, apprécié pour son bois précieux.", picture_id: 14, price: 220, available: true },
            { name: "Cerisier sauvage", description: "Arbre fruitier donnant des cerises comestibles et apprécié pour ses fleurs printanières.", picture_id: 15, price: 140, available: true },
            { name: "Charme commun", description: "Arbre rustique utilisé en haie ou en forêt, résistant et facile à entretenir.", picture_id: 16, price: 85, available: true },
            { name: "Frêne élevé", description: "Arbre élancé, apprécié pour sa résistance et son bois utilisé en ébénisterie.", picture_id: 17, price: 100, available: true },
            { name: "Cocotier", description: "Arbre tropical produisant des noix de coco, cultivé en régions chaudes.", picture_id: 18, price: 300, available: true },
            { name: "Mimosa", description: "Arbre ornemental à fleurs jaunes parfumées, très apprécié dans les jardins.", picture_id: 19, price: 120, available: true },
            { name: "Eucalyptus", description: "Arbre à croissance rapide, utilisé en sylviculture et en huiles essentielles.", picture_id: 20, price: 150, available: true }
        ]);

        // Insertion des utilisateurs
        await User.bulkCreate([
            { firstname: "Nathan", lastname: "Begue", email: "nathan.begue@oclock.school", password: "arbre", role_id: 1 },
            { firstname: "Donovan", lastname: "Grout", email: "donovan.grout@oclock.school", password: "arbre", role_id: 1 }
        ]);

        // Insertion d'une commande
        await Order.create(
            { article_summary: "Cocotier", date: "06/02/25", price: 5555, user_id: 1 }
        );

        // Insertion d'un suivi de plantation
        await Tracking.create(
            { plant_place: "Amazonie", picture_id: 18, growth: "mature", status: "livré et planté", order_id: 1 }
        );

        // Insertion d'une relation article-commande
        await ArticleHasOrder.create(
            { order_id: 1, article_id: 18, quantity: 1 }
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
            { article_id: 2, category_id: 7 },
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
            { article_id: 16, category_id: 10 }
        ]);

    } catch (error) {
        // A remplacer par l'errorHandler
        console.error("Error seeding database:", error);
    }
}

seedDatabase();