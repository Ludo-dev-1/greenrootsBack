import express from 'express';
import crypto from 'crypto';
import { User } from './models/association'; // Assurez-vous que le modèle User est correctement importé
import sendEmail from './utils/sendEmail'; // Assurez-vous que cette fonction envoie effectivement des emails

const router = express.Router();

router.post('/send-password-reset', async (req, res) => {
    const { email } = req.body;

    // Vérifiez si l'utilisateur existe
    const user = await User.findOne({ where: { email } });
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    // Générer un token de réinitialisation sécurisé
    const token = crypto.randomBytes(32).toString('hex');

    // Sauvegarder le token dans la base de données (par exemple, comme un champ sur le modèle User)
    user.resetToken = token;
    user.resetTokenExpiration = Date.now() + 3600000; // 1 heure de validité
    await user.save();

    // Créer le lien de réinitialisation
    const resetLink = `http://localhost:3000/reset-password/${token}`;

    // Envoyer l'email avec le lien de réinitialisation
    const emailContent = `
        <img src="http://localhost:3000/uploads/cocotier.webp" alt="Image de cocotier" width="100%">
        </div>
        <div class="header">
            <h1>Changement de mot de passe</h1>
        </div>
        <div class="content">
            <h1>Bonjour ${user.firstname},</h1>
            <p>Voici le lien pour modifier votre mot de passe :</p>
            <p><a href="${resetLink}" class="button">Changer le mot de passe</a></p>
            <p>Si vous n'êtes pas à l'origine de cette demande, veuillez contacter le support immédiatement !!</p>
            <h2>GreenRoots, parce qu’un arbre planté aujourd’hui est une forêt pour demain.</h2>
        </div>
        <div class="footer">
            <p>&copy; 2025 GreenRoots. Tous droits réservés.</p>
        </div>
    `;

    await sendEmail(user.email, 'Réinitialisation de votre mot de passe', emailContent);

    res.status(200).json({ message: 'Password reset link sent' });
});

export default router;
