// Importation des dépendances
import "dotenv/config"; // Importation de la configuration des variables d'environnement
import express from "express"; // Importation du framework Express
import session from "express-session";
import cors from "cors";
import { xss } from "express-xss-sanitizer";
import rateLimit from "express-rate-limit";
import apiKeyMiddleware from "./src/middlewares/apiKey.middleware.js";
import { mainRouter } from "./src/routers/mainRouter.js";
import { authRouter } from "./src/routers/authRouter.js";
import { userRouter } from "./src/routers/userRouter.js";
import { adminRouter } from "./src/routers/adminRouter.js";
import { errorHandler, notFound } from "./src/middlewares/errorHandler.middleware.js";
// import { createRequire } from "module";
// import Redis from "ioredis";

// Création de l'instance Express
const app = express();

// const redisClient = new Redis({
//   host: "localhost",
//   port: 6379,
// });

// import { default as connectRedis } from 'connect-redis';

// const RedisStore = connectRedis(session);

// Configuration de la session
app.use(session({
  // store: new RedisStore({ client: redisClient }),
  secret: process.env.SESSION_SECRET, // Chaîne secrète pour signer les cookies de session
  resave: false, // Ne pas sauvegarder la session si elle n'a pas été modifiée
  saveUninitialized: true, // Sauvegarder une session non initialisée
  cookie: {
    secure: process.env.NODE_ENV === "production", // 'true' si le site utilise HTTPS (en production)
    httpOnly: true, // Rend le cookie inaccessible via JavaScript côté client
    sameSite: 'strict', // 'strict' pour une protection maximale contre les CSRF
    maxAge: 24 * 60 * 60 * 1000 // Durée de vie du cookie en millisecondes (ici 24 heures)
  }
}));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limiter chaque clé API à 100 requêtes par fenêtre de 15 minutes
  message: "Trop de requêtes provenant de cette IP, veuillez réessayer plus tard."
});

// Limitation des requêtes sur l'API
app.use(apiLimiter);

// Configuration de CORS avec validation dynamique de l'origine
app.use(cors({
  origin: (origin, callback) => {
    // Implémentez la logique pour valider l'origine basée sur la clé API
    const validOrigins = process.env.ALLOWED_ORIGINS.split(','); // Liste des origines autorisées de l'environnement
    if (!origin || validOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Non autorisé par CORS"));
    }
  },
  methods: ["GET", "POST", "PATCH", "DELETE"],
  credentials: true
}));

// Body parsers pour le corps des requêtes
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ limit: '5mb', extended: true }));

app.use(xss());

// Configuration des fichiers statiques
app.use("/uploads", express.static("public/uploads"));

// Middleware de vérification des clés API pour toutes les routes
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
