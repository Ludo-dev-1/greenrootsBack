import sharp from "sharp";
import { Picture } from '../models/association.js'; // Assurez-vous de remplacer par le chemin correct vers votre modèle

const imageMiddleware = async (req, res, next) => {
  try {
    const imageRecord = await Picture.findOne({ where: { id: req.params.pictureId } });

    if (!imageRecord) {
      return res.status(404).send('Image not found');
    }

    const imagePath = imageRecord.path; // Chemin de l'image dans votre base de données

    sharp(imagePath)
      .resize(800) // Redimensionne l'image
      .toBuffer()
      .then(data => {
        req.base64Image = data.toString('base64'); // Ajoutez la chaîne Base64 à la requête
        next(); // Passez au prochain middleware ou routeur
      })
      .catch(err => {
        console.error(err);
        res.status(500).send('Error processing image');
      });

  } catch (err) {
    console.error(err);
    res.status(500).send('Error retrieving image path from database');
  }
};

export default imageMiddleware;
