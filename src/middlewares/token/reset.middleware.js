import crypto from 'crypto';
import { Op } from 'sequelize';
import { User } from "../../models/association.js"

const generateResetToken = async (req, res, next) => {
    try {
        const { email } = req.body;

        // Vérification de l'existence de l'utilisateur
        const user = await User.findOne({ where: { email } });

        if (!user) {
            const error = new Error("Aucun compte associé à cet email n'a été trouvé.");
            error.statusCode = 404;
            throw error;
        }

        // Générer un token de réinitialisation sécurisé
        const token = crypto.randomBytes(32).toString('hex');

        // Sauvegarder le token dans la base de données avec une durée de validité
        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 3600000; // 1 heure de validité
        await user.save();

        // Ajoutez le token généré à la requête pour une utilisation ultérieure
        req.resetToken = token;
        req.user = user;
        next();
    } catch (error) {
        next(error);
    }
};

const verifyResetToken = async (req, res, next) => {
    const { token } = req.params;

    try {
        const user = await User.findOne({
            where: {
                resetToken: token,
                resetTokenExpiration: { [Op.gt]: Date.now() },
            },
        });

        if (!user) {
            return res.status(400).json({ message: "Token invalide ou expiré" });
        }

        req.user = user;
        next();
    } catch (error) {
        next(error);
    }
};

export { generateResetToken, verifyResetToken };