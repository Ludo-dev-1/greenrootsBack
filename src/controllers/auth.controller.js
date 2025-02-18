import { generateToken } from "../utils/jwt.js";
import { User } from "../models/association.js";
import { sendEmail } from "../services/emailService.js";
import argon2 from "argon2";
import { withTransaction } from "../utils/commonOperations.js";

const authController = {
    registerUserForm: async (req, res, next) => {
        try {
            res.status(200).json({ message: "Formulaire d'inscription" });
        } catch (error) {
            next(error);
        }
    },

    register: async (req, res) => {
        try {
            const { firstname, lastname, email, password, repeat_password, role_id } = req.body;

            const result = await withTransaction(async (transaction) => {
                // Vérification de l'existence de l'utilisateur
                const existingUser = await User.findOne({ where: { email }, transaction });
                if (existingUser) {
                    const error = new Error("Une erreur s'est produite lors de la création du compte");
                    error.statusCode = 400;
                    throw error;
                }

                const hash = await argon2.hash(password);

                // Création de l'utilisateur
                const newUser = await User.create({
                    firstname,
                    lastname,
                    email,
                    password: hash,
                    role_id,
                }, { transaction });

                await sendEmail(email, "Confirmation de création de compte", "confirmation", { firstname });

                return newUser;
            });

            res.status(201).json({
                message: "Utilisateur créé avec succès",
                user: {
                    id: result.id,
                    firstname: result.firstname,
                    lastname: result.lastname,
                    email: result.email,
                    // password: result.hash
                }
            });
        } catch (error) {
            next(error);
        };
    },

    loginUserForm: async (req, res, next) => {
        try {
            res.status(200).json({ message: "Formulaire de connexion" });
        } catch (error) {
            next(error);
        }
    },

    login: async (req, res) => {
        try {
            const { email, password } = req.body;

            // Vérifier si l'utilisateur existe
            const user = await User.findOne({ where: { email } });
            if (!user) {
                const error = new Error("Email ou mot de passe incorrect");
                error.statusCode = 401;
                throw error;
            }

            // Vérifier le mot de passe saisi avec le mot de passe haché
            const isPasswordValid = await argon2.verify(user.password, password);

            if (!isPasswordValid) {
                const error = new Error("Email ou mot de passe incorrect");
                error.statusCode = 401;
                throw error;
            }

            // Générer le token JWT
            const token = generateToken(user);

            res.status(200).json({ message: "Connexion réussie", token });
        } catch (error) {
            next(error);
        }
    },

    forgetPassword: async (req, res, next) => {
        try {
            res.status(200).json({ message: "Mot de passe oublié ?" });
        } catch (error) {
            next(error);
        }
    },

    forgetPasswordPost: async (req, res, next) => {
        try {
            const { resetToken, user } = req;
    
            // Créer le lien de réinitialisation
            const resetLink = `http://localhost:3000/changement-mot-de-passe/${resetToken}`;
    
            // Envoyer l'email avec le lien de réinitialisation
            await sendEmail(user.email, "Changement de mot de passe", "forgetPassword", {email: user.email, resetLink, firstname: user.firstname});
    
            // Réponse
            res.status(200).json({
                message: "Un email de réinitialisation a été envoyé à votre adresse email."
            });
        } catch (error) {
            next(error);
        }
    },

    getResetPassword: async (req, res, next) => {
        try {
            res.status(200).json({ message: "Changement de mot de passe" });
        } catch (error) {
            next(error);
        }
    },

    resetPassword: async (req, res, next) => {
            try {
                const { newPassword, repeat_password  } = req.body;
                const user = req.user;
        
                if (newPassword !== repeat_password) {
                    return res.status(400).json({ message: "Les mots de passes ne correspondent pas" })
                };
                const hashedPassword = await argon2.hash(newPassword)
                // Mettre à jour le mot de passe de l'utilisateur
                user.password = hashedPassword;
                user.resetToken = null;
                user.resetTokenExpiration = null;
                await user.save();
        
                res.status(200).json({ message: 'Mot de passe modifié avec succès' });
            } catch (error) {
                next(error);
            }
        },  
};

export default authController;