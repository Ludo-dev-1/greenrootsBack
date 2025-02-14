import fs from 'fs';

const uploadImage = (req, res, next) => {
  const base64Image = req.body.pictureUrl.split(';base64,').pop();
  const basePath = 'public/uploads/';
  const imageName = `${Date.now()}.png`;
  const imagePath = `${basePath}${imageName}`;

  fs.writeFile(imagePath, base64Image, { encoding: 'base64' }, (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        message: 'Error while saving image',
      });
    }

    req.base64Image = imagePath;
    next();
  });
};

export { uploadImage };
