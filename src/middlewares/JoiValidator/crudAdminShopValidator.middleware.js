import Joi from "joi";
import { validate } from "./joiValidatorGeneric.middleware.js";

const crudAdminShopSchema = Joi.object({
    categoryName: Joi.array().items(Joi.string().required().messages({
        'string.base': 'Le nom de la catégorie doit être une chaîne de caractères.',
        'string.empty': 'Le champ nom de la catégorie est obligatoire.',
        'any.required': 'Le champ nom de la catégorie est obligatoire.'
    })),
    name: Joi.string().min(2).max(100).required().messages({
        'string.base': 'Le nom doit être une chaîne de caractères.',
        'string.empty': 'Le champ nom est obligatoire.',
        'string.min': 'Le nom doit contenir au moins 2 caractères.',
        'string.max': 'Le nom doit contenir au maximum 100 caractères.',
        'any.required': 'Le champ nom est obligatoire.'
    }),

    description: Joi.string().min(10).required().messages({
        'string.base': 'La description doit être une chaîne de caractères.',
        'string.empty': 'Le champ description est obligatoire.',
        'string.min': 'La description de l\'image doit contenir au moins 10 caractères.',
        'any.required': 'Le champ description est obligatoire.'
    }),

    price: Joi.number().min(1).max(9999999999).precision(2).required().messages({
        'number.base': 'Le prix doit être un nombre.',
        'number.min': 'Le prix doit être supérieur ou égal à 1.',
        'number.max': 'Le prix doit contenir au maximum 10 chiffres.',
        'any.required': 'Le champ prix est obligatoire.'
    }),

    available: Joi.boolean().required().messages({
        'boolean.base': 'Le champ disponibilité doit être vrai ou faux.',
        'any.required': 'Le champ disponibilité est obligatoire.'
    }),

    pictureUrl: Joi.string().min(4).required().messages({
        'string.base': 'L\'URL de l\'image doit être une chaîne de caractères.',
        'string.empty': 'Le champ URL de l\'image est obligatoire.',
        'string.min': 'L\'URL de l\'image doit contenir au moins 4 caractères.',
        'any.required': 'Le champ URL de l\'image est obligatoire.'
    })
});

export const crudAdminShopValidator = validate(crudAdminShopSchema);