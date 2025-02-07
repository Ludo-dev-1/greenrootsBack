import { Router } from "express";
import { controllerWrapper as cw } from "./utils/controllerWrapper.js";
import mainRoute from "./controllers/shop.controller.js";

const router = Router();

// LANDING PAGE
router.get("/", cw(mainRoute.getNewArticles));

// BOUTIQUE
router.get("/boutique", cw(mainRoute.getAllArticles));

export { router };