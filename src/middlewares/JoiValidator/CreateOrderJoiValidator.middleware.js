import Joi from "joi";
import { validate } from "./joiValidatorGeneric.middleware.js";

const createOrderSchema = Joi.object({
    articles: Joi.array().items(
        Joi.object({
            id: Joi.number().required().messages({
                'number.base': "L'id de l'article doit être un nombre.",
                'any.required': "L'id de l'article est obligatoire."
            }),
            quantity: Joi.number().integer().min(1).required().messages({
                'number.base': 'La quantité doit être un nombre entier.',
                'number.min': 'La quantité doit être au moins 1.',
                'any.required': 'La quantité est obligatoire.'
            })
        })
    ).min(1).required().messages({
        'array.base': 'La liste des articles doit être un tableau.',
        'array.min': 'Au moins un article est requis.',
        'any.required': 'La liste des articles est obligatoire.'
    })
});

export const createOrderJoiValidator = validate(createOrderSchema);