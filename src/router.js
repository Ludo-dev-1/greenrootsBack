import { Router } from "express";
import { controllerWrapper as cw } from "./utils/controllerWrapper.js";
import mainController from "./controllers/main.controller.js";
import { authenticate } from "./middlewares/auth.middleware.js";
import authController from "./controllers/auth.controller.js";
import { registerJoiValidator, crudAdminShopValidator, crudUserProfileValidator, updateForgetPasswordJoiValidator, emailForgetPasswordJoiValidator, createOrderJoiValidator} from "./middlewares/joiValidator.middleware.js";
import adminShopController from "./controllers/adminshop.controller.js";
import adminOrderController from "./controllers/adminOrder.controller.js";
import userController from "./controllers/user.controller.js";
import orderController from "./controllers/order.controller.js";
import { uploadImage } from "./middlewares/imageHandler.middleware.js";
import { modifyImage } from "./middlewares/modifyImage.middleware.js";

const router = Router();

// =================================
//        ROUTES PRINCIPALES
// =================================


// * LANDING PAGE
// Page principale
router.get("/", cw(mainController.getNewArticles));

// * BOUTIQUE
// Page de tout les articles (accessibles par tout le monde)
router.get("/boutique", cw(mainController.getAllArticles));
// Page de détails d'un article (accessible par tout le monde)
router.get("/boutique/article/:id", cw(mainController.getOneArticle));

// * CGU
// Page de conditions générale
router.get("/cgu", cw(mainController.getCGU));


// ================================
//     ROUTES AUTHENTIFICATION
// ================================


// * INSCRIPTION
// Page d'inscription 
router.get("/inscription", cw(authController.registerUserForm));
// Validation de l'inscription
router.post("/inscription", registerJoiValidator, cw(authController.register));

// * CONNEXION
// Page de connexion
router.get("/connexion", cw(authController.loginUserForm));
// Validation de la connexion
router.post("/connexion", cw(authController.login));

// * MOT DE PASSE OUBLIÉ
// Page du mot de passe oublié
router.get("/mot-de-passe-oublie", cw(authController.forgetPassword));
// Validation de l'email pour l'envoi du lien de réinitialisation
router.post("/mot-de-passe-oublie", emailForgetPasswordJoiValidator, cw(authController.forgetPasswordPost));
// * BONUS 
// // Page de changement de mot de passe
// router.get("/changement-mot-de-passe", cw()); // A FAIRE
// // Validation du changement de mot de passe
// router.post("/changement-mot-de-passe", updateForgetPasswordJoiValidator, cw()); // A FAIRE


// ================================
//     ROUTES UTILISATEUR
// ================================


// * COMMANDE
// Page de validation de commande
router.get("/commande", authenticate, cw(mainController.getOrderPage));
// Validation de la commande
router.post("/commande", authenticate, createOrderJoiValidator, cw(orderController.createOrder));

// * COMPTE CRUD
// Page de compte utilisateur
router.get("/compte", authenticate, cw(userController.getUserProfile));
// Modification des infos utilisateur
router.patch("/compte", authenticate, crudUserProfileValidator, cw(userController.updateUserProfile));
// Suppression du compte 
router.delete("/compte", authenticate, cw(userController.deleteUserProfile));

// * COMPTE COMMANDE
// Page de commandes passées
router.get("/compte/commandes", authenticate, cw(userController.getOrders));
// Page de suivi d'une commande
router.get("/compte/commandes/:id", authenticate, cw(orderController.getOrderDetails));
// Page de suivi des articles d'une commande
router.get("/compte/commandes/:id/suivi", authenticate, cw(orderController.getOrderTracking));
// Page de suivi d'un article d'une commande
router.get("/compte/commandes/:orderId/suivi/:trackingId", authenticate, cw(orderController.getArticleTracking));


// ================================
//     ROUTES ADMIN (ARTICLES)
// ================================

// * CRUD ARTICLES
// Page des articles (admin)
router.get("/api/articles", authenticate, cw(adminShopController.getAllArticles));
// Page d'un article (admin)
router.get("/api/articles/:id", authenticate, cw(adminShopController.getOneArticle));
// Création d'un article
router.post("/api/articles", authenticate, crudAdminShopValidator, uploadImage, cw(adminShopController.createArticleWithPicture));
// Modification d'un article
router.patch("/api/articles/:id", authenticate, crudAdminShopValidator, modifyImage, cw(adminShopController.updateArticle));
// Suppression d'un article
router.delete("/api/articles/:id", authenticate, cw(adminShopController.deleteArticle));

// * COMMANDE / SUIVI (admin)
// Page de commandes (admin) récupération de toutes les commandes
router.get("/api/commandes", authenticate, cw(adminOrderController.getAllOrders));
// Page de suivi d'une commande
router.get("/api/commandes/:id", authenticate, cw(adminOrderController.getOrderDetailsAdmin));
// Page de suivi des articles d'une commande
router.get("/api/commandes/:id/suivi", authenticate, cw(adminOrderController.getOrderTrackingAdmin));
router.get("/api/commandes/:orderId/suivi/:trackingId", authenticate, cw(adminOrderController.getArticleTrackingAdmin));
router.patch("/api/commandes/:orderId/suivi/:trackingId", authenticate, modifyImage, cw(adminOrderController.updateArticleTracking)); // A DEBUG


export { router };