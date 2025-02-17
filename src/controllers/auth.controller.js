import { generateToken } from "../utils/jwt.js";
import { User, sequelize } from "../models/association.js";
import { sendEmail } from "../services/emailService.js";
import argon2 from "argon2";

const authController = {
    registerUserForm: async (req, res, next) => {
        try {
            res.status(200).json({ message: "Formulaire d'inscription" });

        } catch (error) {
            error.statusCode = 500;
            return next(error);
        }
    },

    register: async (req, res) => {
        const transaction = await sequelize.transaction();
        try {
            const { firstname, lastname, email, password, repeat_password, role_id } = req.body;

            const hash = await argon2.hash(password);

            // Vérification de l'existence de l'utilisateur
            const existingUser = await User.findOne({ where: { email }, transaction });
            if (existingUser) {
                await transaction.rollback();
                return res.status(400).json({ error: "Une erreur s'est produite lors de la création du compte" });
            }

            // Création de l'utilisateur
            const newUser = await User.create({
                firstname,
                lastname,
                email,
                password: hash,
                role_id,
            }, { transaction });

            sendEmail(email, "Confirmation de création de compte", "confirmation", { firstname });
            
            await transaction.commit();


            res.status(201).json({
                message: "Utilisateur créé avec succès",
                user: {
                    id: newUser.id,
                    firstname: newUser.firstname,
                    lastname: newUser.lastname,
                    email: newUser.email,
                    password: newUser.hash
                }
            });
        } catch (error) {
            await transaction.rollback();
            console.error("Erreur dans le contrôleur d'inscription :", error);
            return res.status(500).json({ error: error.message });
        };
    },

    loginUserForm: async (req, res, next) => {
        try {
            res.status(200).json({ message: "Formulaire de connexion" });

        } catch (error) {
            error.statusCode = 500;
            return next(error);
        }
    },

    login: async (req, res) => {
        try {
            console.log("Requête reçue avec :", req.body);
            const { email, password } = req.body;

            // Vérifier si l'utilisateur existe
            const user = await User.findOne({ where: { email } });
            if (!user) {
                console.log("Utilisateur non trouvé");
                return res.status(401).json({ error: "Email ou mot de passe incorrect" });
            }
            console.log("Utilisateur trouvé", user);

            // Vérifier le mot de passe saisi avec le mot de passe haché
            const isPasswordValid = await argon2.verify(user.password, password);

            if (!isPasswordValid) {
                console.log("Mot de passe incorrect");

                return res.status(401).json({ error: "Email ou mot de passe incorrect" });
            }

            // Générer le token JWT
            const token = generateToken(user);
            console.log("Token généré :", token);

            res.status(200).json({ message: "Connexion réussie", token });
        } catch (error) {
            console.error("Erreur dans le contrôleur login :", error);
            return res.status(500).json({ error: error.message });
        }
    },

    forgetPassword: async (req, res, next) => {
        try {
            res.status(200).json({ message: "Mot de passe oublié ?" });

        } catch (error) {
            error.statusCode = 500;
            return next(error);
        }
    },

    forgetPasswordPost: async (req, res, next) => {
        try {
            const { email } = req.body;

            // Vérification de l'existence de l'utilisateur
            const user = await User.findOne({ where: { email } });
            
            if (!user) {
                return res.status(404).json({ error: "Aucun compte associé à cet email n'a été trouvé." });
            }

            // Réponse
            res.status(200).json({
                message: "Un email de réinitialisation a été envoyé à votre adresse email."
            });

        } catch (error) {
            error.statusCode = 500;
            return next(error);
        }
    }
};

export default authController;