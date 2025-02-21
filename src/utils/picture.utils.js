import fs from 'fs';
import path from 'node:path';

/**
 * Sauvegarde une image base64 sur le serveur et retourne son URL publique
 * @param {string} base64Image - L'image encodée en base64
 * @param {string} imageName - Le nom à donner à l'image
 * @param {Object} req - L'objet requête Express 
 * @returns {Promise<string>} L'URL publique de l'image sauvegardée
 */

const saveImage = (base64Image, imageName, req) => {
  // Définition du chemin de base pour les uploads
  const basePath = 'public/uploads/';
  // Chemin complet du fichier image
  const imagePath = `${basePath}${imageName}`;

  return new Promise((resolve, reject) => {
    // Ecriture du fichier image
    fs.writeFile(imagePath, base64Image, { encoding: 'base64' }, (err) => {
      if (err) {
        // Rejet de la promesse en cas d'erreur
        reject(err);
      } else {
        // Création de l'URL publique de l'image
        const publicUrl = `${req.protocol}://${req.get('host')}/uploads/${imageName}`;
        // Résolution de la promesse avec l'URL publique
        resolve(publicUrl);
      }
    });
  });
};

const convertImageToBase64 = (imagePath) => {
    const image = fs.readFileSync(imagePath);
    return image.toString("base64");
};

export { saveImage, convertImageToBase64 };
