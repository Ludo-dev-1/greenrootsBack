import "dotenv/config"; // Importation de la configuration des variables d'environnement
import express, { Router } from "express"; // Importation du framework Express
import cors from "cors";
import { router } from "./src/router.js";

// Création de l'instance Express
const app = express();

// Autoriser les requêtes "cross-origin"
app.use(cors());

// Body parsers
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Configuration des fichiers statiques

// Liste des routeurs
app.use(router);

// Initialisation du port d'écoute
app.listen(process.env.PORT, () => {
  console.log(`GreenRoots est désormais lancé sur le port ${process.env.PORT}`);
});
