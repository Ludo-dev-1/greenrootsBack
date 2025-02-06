import "dotenv/config";
import express from "express";
//import path from "node:path";

const app = express();

// Configuration des fichiers statiques
//app.use(express.static(path.join(import.meta.dirname, "public")));

// Liste des routeurs


app.listen(process.env.PORT, () => {
  console.log(`GreenRoots est désormais lancé sur le port ${process.env.PORT}`);
});
