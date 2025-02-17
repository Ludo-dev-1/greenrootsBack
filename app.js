import "dotenv/config"; // Importation de la configuration des variables d'environnement
import express from "express"; // Importation du framework Express
import cors from "cors";
import { mainRouter } from "./src/routers/mainRouter.js";
import { authRouter } from "./src/routers/authRouter.js";
import { userRouter } from "./src/routers/userRouter.js";
import { adminRouter } from "./src/routers/adminRouter.js";
import { errorHandler, notFound } from "./src/middlewares/errorHandler.js";

// Création de l'instance Express
const app = express();

// Autoriser les requêtes "cross-origin"
app.use(cors());

// Body parsers
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Configuration des fichiers statiques
app.use("/uploads", express.static("public/uploads"));

// Liste des routes
app.use(mainRouter);
app.use(authRouter);
app.use(userRouter);
app.use(adminRouter);

// Gestion des routes d'erreurs
app.use(notFound);
app.use(errorHandler);

// Initialisation du port d'écoute
app.listen(process.env.PORT, () => {
  console.log(`GreenRoots est désormais lancé sur le port ${process.env.PORT}`);
});
