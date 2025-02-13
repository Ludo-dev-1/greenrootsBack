import multer from 'multer';
import path from "node:path";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // Utilise un timestamp pour éviter les conflits de noms de fichiers
  }
});

const upload = multer({ storage: storage });
