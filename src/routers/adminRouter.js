import { Router } from "express";
import { controllerWrapper as cw } from "../utils/controllerWrapper.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { crudAdminShopValidator } from "../middlewares/JoiValidator/crudAdminShopValidator.middleware.js";
import adminShopController from "../controllers/adminshop.controller.js";
import adminOrderController from "../controllers/adminOrder.controller.js";
import { uploadPicture } from "../middlewares/PictureHandler/uploadPicture.middleware.js";
import { modifyPicture } from "../middlewares/PictureHandler/modifyPicture.middleware.js";

const adminRouter = Router();

// ================================
//     ROUTES ADMIN (ARTICLES)
// ================================

// * CRUD ARTICLES
// Page des articles (admin)
adminRouter.get("/api/articles", authenticate, cw(adminShopController.getAllArticles));
// Page d'un article (admin)
adminRouter.get("/api/articles/:id", authenticate, cw(adminShopController.getOneArticle));
// Création d'un article
adminRouter.post("/api/articles", authenticate, crudAdminShopValidator, uploadPicture, cw(adminShopController.createArticleWithPicture));
// Modification d'un article
adminRouter.patch("/api/articles/:id", authenticate, crudAdminShopValidator, cw(adminShopController.updateArticle));// EN ATTENTE DE TEST POUR LES IMAGES
// Suppression d'un article 
adminRouter.delete("/api/articles/:id", authenticate, cw(adminShopController.deleteArticle));

// * COMMANDE / SUIVI (admin)
// Page de commandes (admin) récupération de toutes les commandes
adminRouter.get("/api/commandes", authenticate, cw(adminOrderController.getAllOrders));
// Page de suivi d'une commande
adminRouter.get("/api/commandes/:id", authenticate, cw(adminOrderController.getOrderDetailsAdmin));
// Page de suivi des articles d'une commande
adminRouter.get("/api/commandes/:id/suivi", authenticate, cw(adminOrderController.getOrderTrackingAdmin));
// Page de suivi d'un article d'une commande
adminRouter.get("/api/commandes/:orderId/suivi/:trackingId", authenticate, cw(adminOrderController.getArticleTrackingAdmin));
// Modification de suivi d'un article
adminRouter.patch("/api/commandes/:orderId/suivi/:trackingId", authenticate, cw(adminOrderController.updateArticleTracking));// EN ATTENTE DE TEST POUR LES IMAGES modifyPicture

export { adminRouter };