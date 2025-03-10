import { Router } from "express";
import { controllerWrapper as cw } from "../utils/controllerWrapper.utils.js";
import { authenticate, checkAdminAccess } from "../middlewares/token/auth.middleware.js";
import { crudAdminShopValidator } from "../middlewares/joiValidator/crudAdminShopValidator.middleware.js";
import adminShopController from "../controllers/adminShop.controller.js";
import adminOrderController from "../controllers/adminOrder.controller.js";
import { uploadPicture } from "../middlewares/pictureHandler/uploadPicture.middleware.js";
import { modifyPicture } from "../middlewares/pictureHandler/modifyPicture.middleware.js";

const adminRouter = Router();

// ================================
//     ROUTES ADMIN (ARTICLES)
// ================================

// * CRUD ARTICLES
// Page des articles (admin)
adminRouter.get("/api/articles", authenticate, checkAdminAccess, cw(adminShopController.getAllArticles));
// Page d'un article (admin)
adminRouter.get("/api/articles/:id", authenticate, checkAdminAccess, cw(adminShopController.getOneArticle));
// Création d'un article
adminRouter.post("/api/articles", authenticate, checkAdminAccess, crudAdminShopValidator, uploadPicture, cw(adminShopController.createArticleWithPicture));
// Modification d'un article
adminRouter.patch("/api/articles/:id", authenticate, checkAdminAccess, crudAdminShopValidator, modifyPicture, cw(adminShopController.updateArticle));
// Suppression d'un article
adminRouter.delete("/api/articles/:id", authenticate, checkAdminAccess, cw(adminShopController.deleteArticle));

// * COMMANDE / SUIVI (admin)
// Page de commandes (admin) récupération de toutes les commandes
adminRouter.get("/api/commandes", authenticate, checkAdminAccess, cw(adminOrderController.getAllOrders));
// Page de suivi d'une commande
adminRouter.get("/api/commandes/:id", authenticate, checkAdminAccess, cw(adminOrderController.getOrderDetailsAdmin));
// Page de suivi des articles d'une commande
adminRouter.get("/api/commandes/:id/suivi", authenticate, checkAdminAccess, cw(adminOrderController.getOrderTrackingAdmin));
// Page de suivi d'un article d'une commande
adminRouter.get("/api/commandes/:orderId/suivi/:trackingId", authenticate, checkAdminAccess, cw(adminOrderController.getArticleTrackingAdmin));
// Modification de suivi d'un article
adminRouter.patch("/api/commandes/:orderId/suivi/:trackingId", authenticate, checkAdminAccess, modifyPicture, cw(adminOrderController.updateArticleTracking));

export { adminRouter };