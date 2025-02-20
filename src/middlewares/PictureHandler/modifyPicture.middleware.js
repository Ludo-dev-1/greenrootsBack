import fs from "fs";
import path from "node:path";

const modifyPicture = (req, res, next) => {
    try {
        const { pictureUrl } = req.body;

        // Vérifie si l'URL de l'image est en base64 sans préfixe
        if (pictureUrl && pictureUrl.match(/^[A-Za-z0-9+/=]*$/)) {
            const base64Image = pictureUrl;
            const basePath = 'public/uploads/';
            const imageName = `${Date.now()}.png`;
            const imagePath = `${basePath}${imageName}`;

            fs.writeFileSync(imagePath, base64Image, { encoding: 'base64' });

            const newPictureUrl = `${req.protocol}://${req.get('host')}/uploads/${imageName}`;
            req.body.pictureUrl = newPictureUrl;
        }

        next();
    } catch (error) {
        console.error("Erreur lors du traitement de l'image en base 64:", error);
        next(error);
    }
};

export { modifyPicture };
