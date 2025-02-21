import fs from "fs";
import path from "node:path";

/**
 * Middleware pour modifier une image
 * @param {Object} req - L'objet de requête Express
 * @param {Object} res - L'objet de réponse Express
 * @param {Function} next - La fonction next d'Express pour passer au middleware suivant
 */

const modifyPicture = (req, res, next) => {
    try {
        const { pictureUrl } = req.body;

        // Vérifie si l'URL de l'image est en base64 sans préfixe
        if (pictureUrl && pictureUrl.match(/^[A-Za-z0-9+/=]*$/)) {
            const base64Image = pictureUrl;
            const basePath = 'public/uploads/';
            const imageName = `${Date.now()}.png`;
            const imagePath = `${basePath}${imageName}`;

            // Ecriture du fichier image
            fs.writeFileSync(imagePath, base64Image, { encoding: 'base64' });

            // Création de la nouvelle URL pour l'image
            const newPictureUrl = `${req.protocol}://${req.get('host')}/uploads/${imageName}`;
            // Mise à jour de l'URL de l'image dans le corps de la requête
            req.body.pictureUrl = newPictureUrl;
        }

        next();
    } catch (error) {
        console.error("Erreur lors du traitement de l'image en base 64:", error);
        next(error);
    }
};

export { modifyPicture };
