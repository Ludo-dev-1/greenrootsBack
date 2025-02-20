import fs from 'fs';
import { STATUS_CODES, ERROR_MESSAGES } from "../../utils/constants.utils.js";

const uploadPicture = (req, res, next) => {
  if (!req.body.pictureUrl) {
    const error = new Error(ERROR_MESSAGES.INVALID_INPUT);
    error.statusCode = STATUS_CODES.BAD_REQUEST;
    return next(error);
  }
  const base64Image = req.body.pictureUrl.split(';base64,').pop();
  const basePath = 'public/uploads/';
  const imageName = `${Date.now()}.png`;
  const imagePath = `${basePath}${imageName}`;

  fs.writeFile(imagePath, base64Image, { encoding: 'base64' }, (err) => {
    if (err) {
      console.error(err);
      const error = new Error(ERROR_MESSAGES.SERVER_ERROR);
      error.statusCode = STATUS_CODES.SERVER_ERROR + " (Error while saving image)";
      return next(error);
    }

    req.base64Image = `${req.protocol}://${req.get('host')}/uploads/${imageName}`;
    next();
  });
};

export { uploadPicture };
