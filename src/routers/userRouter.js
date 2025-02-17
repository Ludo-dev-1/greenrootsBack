import { Router } from "express";
import { controllerWrapper as cw } from "../utils/controllerWrapper.js";
import mainController from "../controllers/main.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { crudUserProfileValidator } from "../middlewares/JoiValidator/crudUserProfileValidator.middleware.js";
import { createOrderJoiValidator } from "../middlewares/JoiValidator/CreateOrderJoiValidator.middleware.js";
import userController from "../controllers/user.controller.js";
import orderController from "../controllers/order.controller.js";

const userRouter = Router();

// ================================
//     ROUTES UTILISATEUR
// ================================


// * COMMANDE
// Page de validation de commande
userRouter.get("/commande", authenticate, cw(mainController.getOrderPage));
// Validation de la commande
userRouter.post("/commande", authenticate, createOrderJoiValidator, cw(orderController.createOrder));

// * COMPTE CRUD
// Page de compte utilisateur
userRouter.get("/compte", authenticate, cw(userController.getUserProfile));
// Modification des infos utilisateur
userRouter.patch("/compte", authenticate, crudUserProfileValidator, cw(userController.updateUserProfile));
// Suppression du compte 
userRouter.delete("/compte", authenticate, cw(userController.deleteUserProfile));

// * COMPTE COMMANDE
// Page de commandes passées
userRouter.get("/compte/commandes", authenticate, cw(userController.getOrders));
// Page de suivi d'une commande
userRouter.get("/compte/commandes/:id", authenticate, cw(orderController.getOrderDetails));
// Page de suivi des articles d'une commande
userRouter.get("/compte/commandes/:id/suivi", authenticate, cw(orderController.getOrderTracking));
// Page de suivi d'un article d'une commande
userRouter.get("/compte/commandes/:orderId/suivi/:articleTrackingId", authenticate, cw(orderController.getArticleTracking));
// Modification du nom d'un article dans le suivi
userRouter.patch("/compte/commandes/:orderId/suivi/:articleTrackingId", authenticate, cw(orderController.updateArticleTrackingName));

export { userRouter };