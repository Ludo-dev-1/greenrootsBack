import "dotenv/config"; // Importation de la configuration des variables d'environnement
import express from "express"; // Importation du framework Express
import cors from "cors";
import { router } from "./src/router.js";
import { errorHandler, notFound } from "./src/middlewares/errorHandler.js";

// Création de l'instance Express
const app = express();

// Autoriser les requêtes "cross-origin"
app.use(cors());

// Body parsers
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Configuration des fichiers statiques

// Liste des routes
app.use(router);

// Gestion des routes d'erreurs
app.use(notFound);
app.use(errorHandler);

// Initialisation du port d'écoute
app.listen(process.env.PORT, () => {
  console.log(`GreenRoots est désormais lancé sur le port ${process.env.PORT}`);
});
