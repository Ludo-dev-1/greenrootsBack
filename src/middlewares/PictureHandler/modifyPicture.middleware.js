import fs from 'fs/promises';
import path from 'node:path';
import { Picture } from '../../models/association.js';

const modifyPicture = async (req, res, next) => {
  const { imageId, newImageBase64 } = req.body;

  try {
    // Vérifiez si l'image existe dans la base de données
    const picture = await Picture.findByPk(imageId);
    if (!picture) {
      return res.status(404).json({ message: 'Image not found' });
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
    return res.status(500).json({
      message: 'Error while processing image',
    });
  }
};

export { modifyPicture };
