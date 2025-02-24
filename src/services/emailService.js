import "dotenv/config";
import nodemailer from "nodemailer";
import path from "node:path";
import hbs from "nodemailer-express-handlebars";
import { STATUS_CODES, ERROR_MESSAGES } from "../utils/constants.utils.js";

/**
 * Configuration du transporteur d'emails avec Nodemailer
 */

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

/**
 * Configuration du moteur de templates Handlebars pour les emails
 */

const handlebarOptions = {
    viewEngine: {
        extName: ".hbs",
        partialsDir: path.resolve("/var/www/html/apothéose/projet-GreenRoots-back/views"),
        defaultLayout: false
    },
    viewPath: path.resolve("/var/www/html/apothéose/projet-GreenRoots-back/views"),
    extName: ".hbs"
};

// Application du moteur de template Handlebars au transporteur
transporter.use("compile", hbs(handlebarOptions));

/**
 * Fonction d'envoi de mail
 * @param {string} to - Adresse email du destinataire
 * @param {string} subject - Sujet de l'email
 * @param {string} template - Nom du template Handlebars à utiliser
 * @param {Object} context - Données à injecter dans le template
 * @throws {Error} - Erreur si l'envoi de l'email échoue
 */

const sendEmail = (to, subject, template, context) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject,
        template,
        context
    };

    transporter.sendMail(mailOptions, (error) => {
        if (error) {
            const customError = new Error(ERROR_MESSAGES.SERVER_ERROR);
            customError.statusCode = STATUS_CODES.SERVER_ERROR + " (Erreur lors de l'envoi du mail)";
            throw customError;
        }
    });
};

export { sendEmail };
