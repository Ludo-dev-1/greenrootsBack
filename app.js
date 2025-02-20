// Importation des dépendances
import "dotenv/config"; // Importation de la configuration des variables d'environnement
import express from "express"; // Importation du framework Express
import session from "express-session";
import cors from "cors";
import { mainRouter } from "./src/routers/mainRouter.js";
import { authRouter } from "./src/routers/authRouter.js";
import { userRouter } from "./src/routers/userRouter.js";
import { adminRouter } from "./src/routers/adminRouter.js";
import { errorHandler, notFound } from "./src/middlewares/errorHandler.js";

// Création de l'instance Express
const app = express();

// Gestion des requêtes "cross-origin"
app.use(cors());
// Configuration de la session
app.use(session({
  secret: 'votre_secret_de_session', // Chaîne secrète pour signer les cookies de session
  resave: false, // Ne pas sauvegarder la session si elle n'a pas été modifiée
  saveUninitialized: true, // Sauvegarder une session non initialisée
  cookie: { secure: false } // Utiliser 'true' si votre site utilise HTTPS
}))

// Body parsers pour le corps des requêtes
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ limit: '5mb', extended: true }));

// Configuration des fichiers statiques
app.use("/uploads", express.static("public/uploads"));

// Définition des routes
app.use(mainRouter);
app.use(authRouter);
app.use(userRouter);
app.use(adminRouter);

// Gestion des erreurs
app.use(notFound);
app.use(errorHandler);

// Démarrage du serveur (initialisation du port d'écoute)
app.listen(process.env.PORT, () => {
  console.log(`GreenRoots est désormais lancé sur le port ${process.env.PORT}`);
});
