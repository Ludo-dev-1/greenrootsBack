import fs from 'fs';
import { STATUS_CODES, ERROR_MESSAGES } from "../../utils/constants.utils.js";

/**
 * Middleware pour gérer l'upload d'une image
 * @param {Object} req - L'objet de requête Express
 * @param {Object} res - L'objet de réponse Express
 * @param {Function} next - La fonction next d'Express pour passer au middleware suivant
 */

const uploadPicture = (req, res, next) => {
  // Vérification de la présence de l'URL de l'image dans le corps de la requête
  if (!req.body.pictureUrl) {
    const error = new Error(ERROR_MESSAGES.INVALID_INPUT);
    error.statusCode = STATUS_CODES.BAD_REQUEST;
    return next(error);
  }
  // Extraction de la partie base64 de l'URL de l'image
  const base64Image = req.body.pictureUrl.split(';base64,').pop();
  // Définition du chemin de sauvegarde de l'image
  const basePath = 'public/uploads/';
  const imageName = `${Date.now()}.png`;
  const imagePath = `${basePath}${imageName}`;

  // Ecriture du fichier image
  fs.writeFile(imagePath, base64Image, { encoding: 'base64' }, (err) => {
    if (err) {
      console.error(err);
      const error = new Error(ERROR_MESSAGES.SERVER_ERROR);
      error.statusCode = STATUS_CODES.SERVER_ERROR + " (Error while saving image)";
      return next(error);
    }

    // Ajout de l'URL de l'image uploadée à la requête
    req.base64Image = `${req.protocol}://${req.get('host')}/uploads/${imageName}`;
    next();
  });
};

export { uploadPicture };
