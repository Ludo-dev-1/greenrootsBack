// Importation des dépendances
import "dotenv/config"; // Importation de la configuration des variables d'environnement
import express from "express"; // Importation du framework Express
import session from "express-session";
import cors from "cors";
import { xss } from "express-xss-sanitizer";
import apiKeyMiddleware from "./src/middlewares/apiKey.middleware.js";
import { mainRouter } from "./src/routers/mainRouter.js";
import { authRouter } from "./src/routers/authRouter.js";
import { userRouter } from "./src/routers/userRouter.js";
import { adminRouter } from "./src/routers/adminRouter.js";
import { errorHandler, notFound } from "./src/middlewares/errorHandler.middleware.js";

// Création de l'instance Express
const app = express();

app.use(cors({
  origin: (origin, callback) => {
      callback(null, true); // Autoriser toutes les origines
  }
}));

// Configuration de la session
app.use(session({
  secret: process.env.SESSION_SECRET, // Chaîne secrète pour signer les cookies de session
  resave: false, // Ne pas sauvegarder la session si elle n'a pas été modifiée
  saveUninitialized: true, // Sauvegarder une session non initialisée
  cookie: { secure: true } // 'true' si le site utilise HTTPS
}))

// Body parsers pour le corps des requêtes
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ limit: '5mb', extended: true }));

app.use(xss());

// Configuration des fichiers statiques
app.use("/uploads", express.static("public/uploads"));

// Appliquer le middleware de vérification des clés API à toutes les routes
app.use(apiKeyMiddleware);

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
