import { Router } from "express";
import { controllerWrapper as cw } from "../utils/controllerWrapper.js";
import mainController from "../controllers/main.controller.js";

const mainRouter = Router();

// =================================
//        ROUTES PRINCIPALES
// =================================


// * LANDING PAGE
// Page principale
mainRouter.get("/", cw(mainController.getNewArticles));

// * BOUTIQUE
// Page de tous les articles (accessibles par tout le monde)
mainRouter.get("/boutique", cw(mainController.getAllArticles));
// Page de détails d'un article (accessible par tout le monde)
mainRouter.get("/boutique/article/:id", cw(mainController.getOneArticle));

// * CGU
// Page de conditions générale d'utilisation
mainRouter.get("/conditions-generales-d-utilisation", cw(mainController.getCGU));

// * CGV
// Page de conditions générale de vente
mainRouter.get("/conditions-generales-de-vente", cw(mainController.getCGV));

// * MENTIONS LÉGALES
// Page de Mentions légales
mainRouter.get("/mentions-legales", cw(mainController.getTermsAndConditions));

export { mainRouter };