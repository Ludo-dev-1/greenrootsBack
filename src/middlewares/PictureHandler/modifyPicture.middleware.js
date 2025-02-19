import fs from 'fs/promises';
import path from 'node:path';
import { Picture } from '../../models/association.js';
import { STATUS_CODES, ERROR_MESSAGES } from "../../utils/constants.js";

const modifyPicture = async (req, res, next) => {
  const { imageId, newImageBase64 } = req.body;

  if (!imageId || !newImageBase64) {
    const error = new Error(ERROR_MESSAGES.INVALID_INPUT);
    error.statusCode = STATUS_CODES.BAD_REQUEST;
    return next(error);
  }

  try {
    // Vérifiez si l'image existe dans la base de données
    const picture = await Picture.findByPk(imageId);
    if (!picture) {
      const error = new Error(ERROR_MESSAGES.RESOURCE_NOT_FOUND);
      error.statusCode = STATUS_CODES.NOT_FOUND + " (Image not found)";
      return next(error);
    }

    // Chemin du fichier existant
    const oldImagePath = path.join('/var/www/html/apothéose/projet-GreenRoots-back/public/uploads', path.basename(picture.url));

    // Supprimez l'ancienne image du système de fichiers
    await fs.unlink(oldImagePath);

    // Enregistrez la nouvelle image
    const basePath = '/var/www/html/apothéose/projet-GreenRoots-back/public/uploads';
    const imageName = `${Date.now()}.png`;
    const imagePath = path.join(basePath, imageName);

    await fs.writeFile(imagePath, newImageBase64, { encoding: 'base64' });

    // Mettez à jour l'URL de l'image dans la base de données
    picture.url = imagePath;
    await picture.save();

    req.updatedPicture = picture;
    next();
  } catch (err) {
    console.error(err);
    const error = new Error(ERROR_MESSAGES.SERVER_ERROR + " (Error while processing image)");
    error.statusCode = STATUS_CODES.SERVER_ERROR;
    next(error);
  }
};

export { modifyPicture };
