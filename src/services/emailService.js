import "dotenv/config";
import nodemailer from "nodemailer";
import path from "node:path";
import hbs from "nodemailer-express-handlebars";

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

// Configurer le moteur de template Handlebars
const handlebarOptions = {
    viewEngine: {
        extName: '.hbs',
        partialsDir: path.resolve('/var/www/html/apothéose/projet-GreenRoots-back/views'),
        defaultLayout: false
    },
    viewPath: path.resolve('/var/www/html/apothéose/projet-GreenRoots-back/views'),
    extName: '.hbs'
};

transporter.use('compile', hbs(handlebarOptions));

const sendEmail = (to, subject, template, context) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject,
        template,
        context
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log('Erreur lors de l\'envoi de l\'email :', error);
        } else {
            console.log('Email envoyé :', info.response);
        }
    });
};

export { sendEmail };
