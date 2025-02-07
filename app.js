import "dotenv/config"; // Importation de la configuration des variables d'environnement
import express from "express"; // Importation du framework Express

// Création de l'instance Express
const app = express();

// Configuration des fichiers statiques

// Liste des routeurs

// Initialisation du port d'écoute
app.listen(process.env.PORT, () => {
  console.log(`GreenRoots est désormais lancé sur le port ${process.env.PORT}`);
});
