import "dotenv/config";

// Middleware de vérification des clés API
const apiKeyMiddleware = (req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    if (!apiKey || apiKey !== process.env.API_KEY) {
        return res.status(403).json({ message: "Accès non autorisé" });
    }
    next();
  };

export default apiKeyMiddleware;