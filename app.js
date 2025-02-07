import "dotenv/config";
import express from "express";

const app = express();

// Configuration des fichiers statiques

// Liste des routeurs


app.listen(process.env.PORT, () => {
  console.log(`GreenRoots est désormais lancé sur le port ${process.env.PORT}`);
});
