import jwt from "jsonwebtoken";

export const generateToken = (user) => {
    const payload = {
        id: user.id,
        email: user.email,
        role_id: user.role_id
    }

    const secret = process.env.JWT_SECRET;
    const options = { expiresIn: "8h" }; // Expiration du token dans 8h : à vérifier syntaxe

    return jwt.sign(payload, secret, options);
};

export const verifyToken = (token) => {
    const secret = process.env.JWT_SECRET;

    try {
        return jwt.verify(token, secret); // Retourne les données si le token est valide
    } catch (error) {
        throw new Error("Token invalide ou expiré");
    }
}