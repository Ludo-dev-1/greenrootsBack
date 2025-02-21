import Joi from "joi";
import { validate } from "./joiValidatorGeneric.middleware.js";

const emailForgetPasswordSchema = Joi.object({
    email: Joi.string()
        .email({ minDomainSegments: 2 })
        .required()
        .messages({
            'string.email': 'L\'email doit être valide.',
            'any.required': 'L\'email est obligatoire.'
        }),
});

export const emailForgetPasswordJoiValidator = validate(emailForgetPasswordSchema);