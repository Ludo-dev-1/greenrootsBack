import { Router } from "express";
import { controllerWrapper as cw } from "./utils/controllerWrapper.js";
import mainController from "./controllers/main.controller.js";
import { authenticate } from "./middlewares/auth.middleware.js";
import authController from "./controllers/auth.controller.js";
import { registerJoiValidator, crudJoiValidator } from "./middlewares/joiValidator.middleware.js";
import shopController from "./controllers/shop.controller.js";

const router = Router();

// LANDING PAGE
router.get("/", cw(mainController.getNewArticles));

// BOUTIQUE
router.get("/boutique", cw(mainController.getAllArticles));
router.get("/boutique/:id", cw(mainController.getOneArticle));

// BOUTIQUE CRUD
router.get("/api/articles", authenticate, cw(shopController.getAllArticles));
router.get("/api/articles/:id", authenticate, cw(shopController.getOneArticle));
router.post("/api/articles", authenticate, crudJoiValidator, cw(shopController.createArticleWithPicture)); // Validation des données lors de la création d'un article : modifier pour utiliser une méthode dans joiValidator.middleware.js
router.patch("/api/articles/:id", authenticate, crudJoiValidator, cw(shopController.updateArticle));
router.delete("/api/articles/:id", authenticate, cw(shopController.deleteArticle));

// COMMANDE
router.get("/commande", authenticate, cw(mainController.getOrders)); //order et tracking
router.post("/commande", authenticate, cw(mainController.createOrder));
router.patch("/compte", authenticate, cw(mainController.updateUserProfile));
// COMPTE
router.get("/compte", authenticate, cw(mainController.getUserProfile)); //user
router.get("/compte/suivi", authenticate, cw(mainController.getOrderTracking)); //user et order et tracking
// INSCRIPTION
router.get("/inscription", cw(authController.registerUserForm));
router.post("/inscription", registerJoiValidator, cw(authController.register));
// CONNEXION
router.get("/connexion", cw(authController.loginUserForm));
router.post("/connexion", cw(authController.login));
// MOT DE PASSE OUBLIÉ
router.get("/mot-de-passe-oublie", cw(authController.forgetPassword)); //user?
// CGU
router.get("/cgu", cw(mainController.getCGU));
// ADMIN
router.get("/admin", authenticate, cw(mainController.getAdminDashboard)); //user

export { router };