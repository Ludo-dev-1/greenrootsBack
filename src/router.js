import { Router } from "express";
import { controllerWrapper as cw } from "./utils/controllerWrapper.js";
import mainController from "./controllers/main.controller.js";
import { authenticate } from "./middlewares/auth.middleware.js";
import authController from "./controllers/auth.controller.js";
import { registerJoiValidator, crudAdminShopValidator, crudUserProfileValidator, updateForgetPasswordJoiValidator, emailForgetPasswordJoiValidator } from "./middlewares/joiValidator.middleware.js";
import adminShopController from "./controllers/adminshop.controller.js";
import userController from "./controllers/user.controller.js";

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
// Page de changement de mot de passe
router.get("/changement-mot-de-passe", cw()); // A FAIRE
// Validation du changement de mot de passe
router.post("/changement-mot-de-passe", updateForgetPasswordJoiValidator, cw()); // A FAIRE


// ================================
//     ROUTES UTILISATEUR
// ================================


// * COMMANDE
// Page de validation de commande
router.get("/commande", authenticate, cw(mainController.getOrderPage));
// Validation de la commande
router.post("/commande", authenticate, cw(mainController.createOrder));

// * COMPTE
// Page de compte utilisateur
router.get("/compte", authenticate, cw(userController.getUserProfile));
// Modification des infos utilisateur
router.patch("/compte", authenticate, crudUserProfileValidator, cw(userController.updateUserProfile));
// Suppression du compte 
router.delete("/compte", authenticate, cw(userController.deleteUserProfile));
// Page de commandes passées
router.get("/compte/commandes", authenticate, cw(userController.getOrders));
// Page de suivi des commandes
router.get("/compte/commandes/:id", authenticate, cw(userController.getOrderTracking));
router.get("/compte/commandes/:id/suivi/id", authenticate, cw(userController.getOrderTracking));


// ================================
//     ROUTES ADMIN (ARTICLES)
// ================================


router.get("/api/articles", authenticate, cw(adminShopController.getAllArticles));
router.get("/api/articles/:id", authenticate, cw(adminShopController.getOneArticle));
router.post("/api/articles", authenticate, crudAdminShopValidator, cw(adminShopController.createArticleWithPicture));
router.patch("/api/articles/:id", authenticate, crudAdminShopValidator, cw(adminShopController.updateArticle));
router.delete("/api/articles/:id", authenticate, cw(adminShopController.deleteArticle));

router.get("/compte/commandes", authenticate, cw(userController.getAllOrders));

// USER
// GET /compte/commandes/suivi/:id : Voir le détail du suivi d’un article d’une commande
// ADMIN
// PATCH /compte/commandes/suivi/:id : Modifier le suivi du détail d’un article d’une commande (Admin)


export { router };