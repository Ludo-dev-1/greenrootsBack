// utils/imageUtils.js
import fs from 'fs';
import path from 'node:path';

const saveImage = (base64Image, imageName) => {
  const basePath = 'public/uploads/';
  const imagePath = `${basePath}${imageName}`;

  return new Promise((resolve, reject) => {
    fs.writeFile(imagePath, base64Image, { encoding: 'base64' }, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve(imagePath);
      }
    });
  });
};

const convertImageToBase64 = (imagePath) => {
    const image = fs.readFileSync(imagePath);
    return image.toString("base64");
};

export { saveImage, convertImageToBase64 };
