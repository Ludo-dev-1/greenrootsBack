import { Router } from "express";
import { controllerWrapper as cw } from "./utils/controllerWrapper.js";
import mainRoute from "./controllers/shop.controller.js";
import { authenticate } from "./middlewares/auth.middleware.js";
import authController from "./controllers/auth.controller.js";

const router = Router();

// LANDING PAGE
router.get("/", cw(mainRoute.getNewArticles));
// BOUTIQUE
router.get("/boutique", cw(mainRoute.getAllArticles));
// COMMANDE
router.get("/commande", cw(mainRoute.getOrders)); //order et tracking
// COMPTE
router.get("/compte", authenticate, cw(mainRoute.getUserProfile)); //user
router.get("/compte/suivi", authenticate,cw(mainRoute.getOrderTracking)); //user et order et tracking
// INSCRIPTION
router.get("/inscription", cw(mainRoute.registerUserForm));
router.post("/inscription", cw(authController.register));
// CONNEXION
router.get("/connexion", cw(mainRoute.loginUserForm));
router.post("/connexion", cw(authController.login));
// MOT DE PASSE OUBLIÉ
router.get("/mot-de-passe-oublie", cw(mainRoute.forgetPassword)); //user?
// CGU
router.get("/cgu", cw(mainRoute.getCGU)); 
// ADMIN
router.get("/admin", authenticate, cw(mainRoute.getAdminDashboard)); //user

export { router };