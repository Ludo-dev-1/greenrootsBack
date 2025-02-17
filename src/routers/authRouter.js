import { Router } from "express";
import { controllerWrapper as cw } from "../utils/controllerWrapper.js";
import authController from "../controllers/auth.controller.js";
import { registerJoiValidator } from "../middlewares/JoiValidator/registerJoiValidator.middleware.js";
import { emailForgetPasswordJoiValidator } from "../middlewares/JoiValidator/emailForgetPasswordJoiValidator.middleware.js";

const authRouter = Router();

// ================================
//     ROUTES AUTHENTIFICATION
// ================================


// * INSCRIPTION
// Page d'inscription 
authRouter.get("/inscription", cw(authController.registerUserForm));
// Validation de l'inscription
authRouter.post("/inscription", registerJoiValidator, cw(authController.register));

// * CONNEXION
// Page de connexion
authRouter.get("/connexion", cw(authController.loginUserForm));
// Validation de la connexion
authRouter.post("/connexion", cw(authController.login));

// * MOT DE PASSE OUBLIÉ
// Page du mot de passe oublié
authRouter.get("/mot-de-passe-oublie", cw(authController.forgetPassword));
// Validation de l'email pour l'envoi du lien de réinitialisation
authRouter.post("/mot-de-passe-oublie", emailForgetPasswordJoiValidator, cw(authController.forgetPasswordPost));
// * BONUS 
// // Page de changement de mot de passe
// authRouter.get("/changement-mot-de-passe", cw()); // A FAIRE
// // Validation du changement de mot de passe
// authRouter.post("/changement-mot-de-passe", updateForgetPasswordJoiValidator, cw()); // A FAIRE

export { authRouter };