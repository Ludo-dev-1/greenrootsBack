import Joi from "joi";
import { validate } from "./joiValidatorGeneric.middleware.js";

const updateForgetPasswordSchema = Joi.object({
    newPassword: Joi.string()
    .min(14)
    .pattern(new RegExp('(?=.*[a-z])'))
    .pattern(new RegExp('(?=.*[A-Z])'))
    .pattern(new RegExp('(?=.*[0-9])'))
    .pattern(new RegExp('(?=.*[!@#\$%\^&\*])'))
    .required()
    .messages({
        'string.min': 'Le mot de passe doit contenir au moins 14 caractères.',
        'string.pattern.base': 'Le mot de passe doit contenir au moins une lettre minuscule, une lettre majuscule, un chiffre et un caractère spécial.',
        'any.required': 'Le mot de passe est obligatoire.'
    }),

repeat_password: Joi.valid(Joi.ref("newPassword"))
    .required()
    .messages({
        'any.only': 'Les mots de passe doivent correspondre.',
        'any.required': 'La confirmation du mot de passe est obligatoire.'
    }),
});

export const updateForgetPasswordJoiValidator = validate(updateForgetPasswordSchema);