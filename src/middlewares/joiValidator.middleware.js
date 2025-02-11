import Joi from "joi";

const registerJoiValidator = (req, res, next) => {
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

        role_id: Joi.number().default(2),

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

const crudJoiValidator = (req, res, next) => {
    const schema = Joi.object({
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

    try {
        const { error } = schema.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }
        next();
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
};

export { registerJoiValidator, crudJoiValidator };