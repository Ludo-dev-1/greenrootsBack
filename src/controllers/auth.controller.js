import { generateToken } from "../utils/jwt.utils.js"; // Pour le jeton d'authentification
import { User } from "../models/association.js";
import { sendEmail } from "../services/emailService.js"; // Service d'envoi d'email
import argon2 from "argon2"; // Pour le hash du mot de passe
import { v4 as uuidv4 } from "uuid"; // Pour le jeton de vérification
import { withTransaction } from "../utils/commonOperations.utils.js"; // Fonction utilitaire de gestion des transactions
import { STATUS_CODES, ERROR_MESSAGES } from "../utils/constants.utils.js"; // Constantes pour les codes de statut HTTP et les messages d'erreur

const authController = {
    // Affiche le formulaire d'inscription
    registerUserForm: async (req, res, next) => {
        try {
            res.status(STATUS_CODES.OK).json({ message: "Formulaire d'inscription" });
        } catch (error) {
            next(error);
        }
    },

    // Gère l'inscription d'un nouvel utilisateur
    register: async (req, res) => {
        // Génère un token unique pour la vérification de l'email
        const verificationToken = uuidv4();
        try {
            // eslint-disable-next-line no-unused-vars
            const { firstname, lastname, email, password, repeat_password, role_id } = req.body;

            const result = await withTransaction(async (transaction) => {
                // Vérifie si l'utilisateur existe déjà
                const existingUser = await User.findOne({ where: { email }, transaction });
                if (existingUser) {
                    const error = new Error("Une erreur s'est produite lors de la création du compte");
                    error.statusCode = STATUS_CODES.BAD_REQUEST;
                    throw error;
                }

                // Hash le mot de passe
                const hash = await argon2.hash(password);

                // Crée le nouvel utilisateur
                const newUser = await User.create({
                    firstname,
                    lastname,
                    email,
                    password: hash,
                    role_id,
                    emailVerified: false,
                    verificationToken
                }, { transaction });

                const verificationLink = `http://localhost:3000/verification/${verificationToken}`;

                // Envoie un email de confirmation
                await sendEmail(email, "Confirmation de création de compte", "confirmation", { firstname, verificationLink });

                return newUser;
            });

            // Renvoie les détails de l'utilisateur créé en réponse
            res.status(STATUS_CODES.CREATED).json({
                message: "Utilisateur créé avec succès",
                user: {
                    id: result.id,
                    firstname: result.firstname,
                    lastname: result.lastname,
                    email: result.email
                }
            });
        } catch (error) {
            // Passe l'erreur au middleware de gestion d'erreurs
            next(error);
        };
    },

    // Vérification de l'email de l'utilisateur
    verifyEmail: async (req, res, next) => {
        try {
            const { verifyToken } = req.params;

            // Recherche l'utilisateur avec le jeton de vérification
            const user = await User.findOne({ where: { verificationToken: verifyToken } });

            if (!user) {
                return res.status(STATUS_CODES.BAD_REQUEST).json({ message: "Lien de vérification invalide." });
            }

            // Met à jour le champ emailVerified à true
            user.emailVerified = true;
            user.verificationToken = null; // Optionnel : supprime le jeton de vérification après usage
            await user.save();

            res.status(STATUS_CODES.OK).json({ message: "Votre email a bien été validé." });
        } catch (error) {
            // Passe l'erreur au middleware de gestion d'erreurs
            next(error);
        }
    },

    // Affichage du formulaire de connexion
    loginUserForm: async (req, res, next) => {
        try {
            res.status(STATUS_CODES.OK).json({ message: "Formulaire de connexion" });
        } catch (error) {
            next(error);
        }
    },

    // Gestion de la connexion de l'utilisateur
    login: async (req, res, next) => {
        try {
            const { email, password } = req.body;

            // Vérifie si l'utilisateur existe
            const user = await User.findOne({ where: { email } });
            if (!user) {
                const error = new Error(ERROR_MESSAGES.UNAUTHORIZED_ACCESS + " (Email ou mot de passe incorrect)");
                error.statusCode = STATUS_CODES.UNAUTHORIZED;
                throw error;
            }

            // Vérifie le mot de passe saisi avec le mot de passe haché
            const isPasswordValid = await argon2.verify(user.password, password);

            if (!isPasswordValid) {
                const error = new Error(ERROR_MESSAGES.UNAUTHORIZED_ACCESS + " (Email ou mot de passe incorrect)");
                error.statusCode = STATUS_CODES.UNAUTHORIZED;
                throw error;
            }

            // Génère le token JWT
            const token = generateToken(user);

            res.status(STATUS_CODES.OK).json({ message: "Connexion réussie", token });
        } catch (error) {
            // Passe l'erreur au middleware de gestion d'erreurs
            next(error);
        }
    },

    // Affichage du formulaire de mot de passe oublié
    forgetPassword: async (req, res, next) => {
        try {
            res.status(STATUS_CODES.OK).json({ message: "Mot de passe oublié ?" });
        } catch (error) {
            next(error);
        }
    },

    // Gestion de la demande de réinitialisation de mot de passe
    forgetPasswordPost: async (req, res, next) => {
        try {
            const { resetToken, user } = req;

            // Crée le lien de réinitialisation
            const resetLink = `http://localhost:3000/changement-mot-de-passe/${resetToken}`;

            // Envoie l'email avec le lien de réinitialisation
            await sendEmail(user.email, "Changement de mot de passe", "forgetPassword", { email: user.email, resetLink, firstname: user.firstname });

            // Réponse
            res.status(STATUS_CODES.OK).json({
                message: "Un email de réinitialisation a été envoyé à votre adresse email."
            });
        } catch (error) {
            // Passe l'erreur au middleware de gestion d'erreurs
            next(error);
        }
    },

    // Affichage du formulaire de réinitialisation de mot de passe
    getResetPassword: async (req, res, next) => {
        try {
            res.status(STATUS_CODES.OK).json({ message: "Changement de mot de passe" });
        } catch (error) {
            next(error);
        }
    },

    // Gestion de la réinitialisation du mot de passe
    resetPassword: async (req, res, next) => {
        try {
            const { newPassword, repeat_password } = req.body;
            const user = req.user;

            if (newPassword !== repeat_password) {
                return res.status(STATUS_CODES.BAD_REQUEST).json({ message: "Les mots de passes ne correspondent pas" });
            };
            const hashedPassword = await argon2.hash(newPassword);
            // Met à jour le mot de passe de l'utilisateur
            user.password = hashedPassword;
            user.resetToken = null;
            user.resetTokenExpiration = null;
            await user.save();

            res.status(STATUS_CODES.OK).json({ message: "Mot de passe modifié avec succès" });
        } catch (error) {
            // Passe l'erreur au middleware de gestion d'erreurs
            next(error);
        }
    },
};

export default authController;