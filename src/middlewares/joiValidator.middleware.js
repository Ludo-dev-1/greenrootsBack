import Joi from "joi";

const joiValidator = (req, res, next) => {
    const schema = Joi.object({
        firstname: Joi.string()
            .min(2)
            .max(64)
            .pattern(new RegExp('^[A-Za-z]+$'))
            .required()
            .messages({
                'string.min': 'Le prénom doit contenir au moins 2 caractères.',
                'string.max': 'Le prénom ne peut pas dépasser 64 caractères.',
                'string.pattern.base': 'Le prénom ne peut contenir que des lettres.',
                'any.required': 'Le prénom est obligatoire.'
            }),

        lastname: Joi.string()
            .min(2)
            .max(64)
            .pattern(new RegExp('^[A-Za-z]+$'))
            .required()
            .messages({
                'string.min': 'Le nom doit contenir au moins 2 caractères.',
                'string.max': 'Le nom ne peut pas dépasser 64 caractères.',
                'string.pattern.base': 'Le nom ne peut contenir que des lettres.',
                'any.required': 'Le nom est obligatoire.'
            }),

        email: Joi.string()
            .email({ minDomainSegments: 2 })
            .required()
            .messages({
                'string.email': 'L\'email doit être valide.',
                'any.required': 'L\'email est obligatoire.'
            }),

        password: Joi.string()
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

        repeat_password: Joi.valid(Joi.ref("password"))
            .required()
            .messages({
                'any.only': 'Les mots de passe doivent correspondre.',
                'any.required': 'La confirmation du mot de passe est obligatoire.'
            }),

        role_id: Joi.number().default(2).required(),

    });

    try {
        const { error } = schema.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }
        next();
    } catch (error) {
        res.status(400).send({ error: error.message });
    };
};

export default joiValidator;