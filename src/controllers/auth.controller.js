import { generateToken } from "../utils/jwt.js";
import { User } from "../models/association.js";

const authController = {
    login: async (req, res) => {
        try {
            console.log("Requête reçue avec :", req.body);
            const { email, password } = req.body;
            const user = await User.findOne({ where: { email } });
            if(!user) {
                console.log("Utilisateur non trouvé");
                return res.status(401).json({ error: "Email ou mot de passe incorrect" });
            }
            console.log("Utilisateur trouvé", user);
            
            if (user.password !== password) {
                console.log("Mot de passe incorrect");
                
                return res.status(401).json({ error: "Email ou mot de passe incorrect" });
            }

            const token = generateToken(user);
            console.log("Token généré :", token);
            
            res.status(200).json({ message: "Connexion réussie", token});
        } catch (error) {
            console.error("Erreur dans le contrôleur login :", error);
            return res.status(500).json({ error: "Erreur serveur" });
        }
    },
};

export default authController;