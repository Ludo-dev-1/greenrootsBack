// middlewares/modifyImageMiddleware.js
import fs from 'fs';
import path from 'node:path';
import { Picture } from '../../models/association.js';

const modifyPicture = async (req, res, next) => {
  const { imageId, newImageBase64 } = req.body;

  // Vérifiez si l'image existe dans la base de données
  const picture = await Picture.findByPk(imageId);
  if (!picture) {
    return res.status(404).json({ message: 'Image not found' });
  }

  // Chemin du fichier existant
  const oldImagePath = path.join(__dirname, '../../public/uploads', picture.url);

  // Supprimez l'ancienne image du système de fichiers
  fs.unlink(oldImagePath, (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Error while deleting old image' });
    }
  });

  // Enregistrez la nouvelle image
  const basePath = 'public/uploads/';
  const imageName = `${Date.now()}.png`;
  const imagePath = path.join(basePath, imageName);

  fs.writeFile(imagePath, newImageBase64, { encoding: 'base64' }, async (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        message: 'Error while saving new image',
      });
    }

    // Mettez à jour l'URL de l'image dans la base de données
    picture.url = imagePath;
    await picture.save();

    req.updatedPicture = picture;
    next();
  });
};

export { modifyPicture };
