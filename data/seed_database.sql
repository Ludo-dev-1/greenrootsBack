-- ------------------------------------------------
-- Echantillonnage de la base de données :  "greenroots"
-- ------------------------------------------------

-- Début d'une transaction
BEGIN;

-- Vide les tables, sans toucher à la structure des tables
TRUNCATE TABLE "user",
"tracking",
"role",
"order",
"category",
"article",
"picture",
"article_has_category",
"article_has_order" RESTART IDENTITY;

-- ----------------------------------------
-- Déchargement des données de la table "category"
-- ----------------------------------------
INSERT INTO "category" ("id", "name") VALUES
(1, 'Arbres fruitiers'),
(2, 'Arbres légendaires'),
(3, 'Arbres mellifères'),
(4, 'Arbres médicinaux'),
(5, 'Arbres tropicaux'),
(6, 'Arbres feuillus'),
(7, 'Arbres à croissance rapide'),
(8, 'Conifères'),
(9, 'Arbres d''ornement'),
(10, 'Arbres forestiers');


-- ----------------------------------------
-- Déchargement des données de la table "role"
-- ----------------------------------------
INSERT INTO "role" ("id", "name") VALUES
(1, 'Administrateur'),
(2, 'Membre');


-- ----------------------------------------
-- Déchargement des données de la table "picture"
-- ----------------------------------------
INSERT INTO "picture" ("id", "url", "description") VALUES
(1, 'Chêne pédonculé', 'Je trouve que ça passe bien en Amazonie'),
(2, 'Platane commun', 'Je trouve que ça passe bien en Amazonie'),
(3, 'Hêtre commun', 'Je trouve que ça passe bien en Amazonie'),
(4, 'Saule pleureur', 'Je trouve que ça passe bien en Amazonie'),
(5, 'Bouleau verruqueux', 'Je trouve que ça passe bien en Amazonie'),
(6, 'Pin sylvestre', 'Je trouve que ça passe bien en Amazonie'),
(7, 'Cèdre du Liban', 'Je trouve que ça passe bien en Amazonie'),
(8, 'Olivier', 'Je trouve que ça passe bien en Amazonie'),
(9, 'Acacia', 'Je trouve que ça passe bien en Amazonie'),
(10, 'Ginkgo biloba', 'Je trouve que ça passe bien en Amazonie'),
(11, 'Sequoia géant', 'Je trouve que ça passe bien en Amazonie'),
(12, 'Magnolia grandiflora', 'Je trouve que ça passe bien en Amazonie'),
(13, 'Tilleul à grandes feuilles', 'Je trouve que ça passe bien en Amazonie'),
(14, 'Noyer commun', 'Je trouve que ça passe bien en Amazonie'),
(15, 'Cerisier sauvage', 'Je trouve que ça passe bien en Amazonie'),
(16, 'Charme commun', 'Je trouve que ça passe bien en Amazonie'),
(17, 'Frêne élevé', 'Je trouve que ça passe bien en Amazonie'),
(18, 'Cocotier', 'Je trouve que ça passe bien en Amazonie'),
(19, 'Mimosa', 'Je trouve que ça passe bien en Amazonie'),
(20, 'Eucalyptus', 'Je trouve que ça passe bien en Amazonie');

-- ----------------------------------------
-- Déchargement des données de la table "article"
-- ----------------------------------------
INSERT INTO "article" ("id", "name", "description", "picture_id", "price", "available") VALUES
(1, 'Chêne pédonculé', 'Arbre robuste à longue durée de vie, utilisé en menuiserie et pour la biodiversité.', 1, 120, true),
(2, 'Platane commun', 'Arbre forestier apprécié pour son bois et ses feuilles persistantes en hiver.', 2, 90, true),
(3, 'Hêtre commun', 'Arbre robuste à longue durée de vie, utilisé en menuiserie et pour la biodiversité.', 3, 110, true),
(4, 'Saule pleureur', 'Arbre ornemental souvent planté près des points d’eau pour sa silhouette élégante.', 4, 150, true),
(5, 'Bouleau verruqueux', 'Arbre résistant au froid, purifiant l’air et favorisant la biodiversité.', 5, 80, true),
(6, 'Pin sylvestre', 'Conifère robuste et résistant, utilisé pour la reforestation et l’exploitation forestière.', 6, 100, true),
(7, 'Cèdre du Liban', 'Arbre majestueux, symbole de longévité et apprécié pour son bois imputrescible.', 7, 200, true),
(8, 'Olivier', 'Arbre méditerranéen produisant des olives, symbole de paix et de résilience.', 8, 250, true),
(9, 'Acacia', 'Arbre à croissance rapide, utilisé en agroforesterie et en médecine traditionnelle.', 9, 75, true),
(10, 'Ginkgo biloba', 'Arbre préhistorique aux vertus médicinales, résistant à la pollution.', 10, 180, true),
(11, 'Sequoia géant', 'Un des plus grands arbres du monde, connu pour sa longévité extrême.', 11, 500, true),
(12, 'Magnolia grandiflora', 'Arbre ornemental à fleurs parfumées, populaire dans les parcs et jardins.', 12, 130, true),
(13, 'Tilleul à grandes feuilles', 'Arbre mellifère favorisant la pollinisation et la biodiversité.', 13, 95, true),
(14, 'Noyer commun', 'Arbre fruitier produisant des noix, apprécié pour son bois précieux.', 14, 220, true),
(15, 'Cerisier sauvage', 'Arbre fruitier donnant des cerises comestibles et apprécié pour ses fleurs printanières.', 15, 140, true),
(16, 'Charme commun', 'Arbre rustique utilisé en haie ou en forêt, résistant et facile à entretenir.', 16, 85, true),
(17, 'Frêne élevé', 'Arbre élancé, apprécié pour sa résistance et son bois utilisé en ébénisterie.', 17, 100, true),
(18, 'Cocotier', 'Arbre tropical produisant des noix de coco, cultivé en régions chaudes.', 18, 300, true),
(19, 'Mimosa', 'Arbre ornemental à fleurs jaunes parfumées, très apprécié dans les jardins.', 19, 120, true),
(20, 'Eucalyptus', 'Arbre à croissance rapide, utilisé en sylviculture et en huiles essentielles.', 20, 150, true);


-- ----------------------------------------
-- Déchargement des données de la table "user"
-- ----------------------------------------
INSERT INTO "user" ("id", "firstname", "lastname", "email", "password", "role_id") VALUES
(1, 'Nathan', 'begue', 'nathan.begue@oclock.school', 'arbre', 1),
(2, 'Donovan', 'Grout', 'donovan.grout@oclock.school', 'arbre', 1);

-- ----------------------------------------
-- Déchargement des données de la table "order"
-- ----------------------------------------
INSERT INTO "order" ("id", "article_summary", "date", "price", "user_id") VALUES
(1, 'Cocotier', '06/02/25', 5555, 1);


-- ----------------------------------------
-- Déchargement des données de la table "tracking"
-- ----------------------------------------
INSERT INTO "tracking" ("id", "plant_place", "picture_id", "growth", "status", "order_id") VALUES
(1, 'Amazonie', 18, 'mature', 'livré et planté', 1);



-- ----------------------------------------
-- Déchargement des données de la table "article_has_order"
-- ----------------------------------------
INSERT INTO "article_has_order" ("article_id", "order_id", "quantity") VALUES
(18, 1, 1);


-- ----------------------------------------
-- Déchargement des données de la table "article_has_category"
-- ----------------------------------------

INSERT INTO "article_has_category" ("article_id", "category_id") VALUES
(8, 1),
(14, 1),
(15, 1),
(18, 1),
(8, 2),
(10, 2),
(11, 2),
(9, 3),
(13, 3),
(10, 4),
(20, 4),
(18, 5),
(2, 6),
(3, 6),
(13, 6),
(17, 6),
(2, 7),
(9, 7),
(20, 7),
(6, 8),
(7, 8),
(11, 8),
(4, 9),
(12, 9),
(19, 9),
(3, 10),
(5, 10),
(13, 10),
(16, 10);

COMMIT;


-- ------------------------------
-- Mise à jour des séquences d'ID
-- -----------------------------
BEGIN;

SELECT setval('user_id_seq', (SELECT MAX(id) from "user"));
SELECT setval('role_id_seq', (SELECT MAX(id) from "role"));
SELECT setval('category_id_seq', (SELECT MAX(id) from "category"));
SELECT setval('tracking_id_seq', (SELECT MAX(id) from "tracking"));
SELECT setval('order_id_seq', (SELECT MAX(id) from "order"));
SELECT setval('picture_id_seq', (SELECT MAX(id) from "picture"));
SELECT setval('article_id_seq', (SELECT MAX(id) from "article"));

COMMIT;