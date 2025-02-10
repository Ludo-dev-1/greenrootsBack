import { Router } from "express";
import { controllerWrapper as cw } from "./utils/controllerWrapper.js";
import mainRoute from "./controllers/main.controller.js";
import { authenticate } from "./middlewares/auth.middleware.js";
import authController from "./controllers/auth.controller.js";
import joiValidator from "./middlewares/joiValidator.middleware.js";

const router = Router();

// LANDING PAGE
router.get("/", cw(mainRoute.getNewArticles));
// BOUTIQUE
router.get("/boutique", cw(mainRoute.getAllArticles));
// COMMANDE
router.get("/commande", authenticate, cw(mainRoute.getOrders)); //order et tracking
router.post("/commande", authenticate, cw(mainRoute.createOrder));
router.patch("/compte", authenticate, cw(mainRoute.updateUserProfile));
// COMPTE
router.get("/compte", authenticate, cw(mainRoute.getUserProfile)); //user
router.get("/compte/suivi", authenticate, cw(mainRoute.getOrderTracking)); //user et order et tracking
// INSCRIPTION
router.get("/inscription", cw(authController.registerUserForm));
router.post("/inscription", joiValidator, cw(authController.register));
// CONNEXION
router.get("/connexion", cw(authController.loginUserForm));
router.post("/connexion", cw(authController.login));
// MOT DE PASSE OUBLIÉ
router.get("/mot-de-passe-oublie", cw(authController.forgetPassword)); //user?
// CGU
router.get("/cgu", cw(mainRoute.getCGU));
// ADMIN
router.get("/admin", authenticate, cw(mainRoute.getAdminDashboard)); //user

export { router };