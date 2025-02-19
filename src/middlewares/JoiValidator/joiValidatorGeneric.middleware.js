import { STATUS_CODES, ERROR_MESSAGES } from "../../utils/constants.js";

export const validate = (schema) => (req, res, next) => {
    try {
        const { error } = schema.validate(req.body);
        if (error) {
/*             const validationError = new Error(ERROR_MESSAGES.INVALID_INPUT);
            validationError.statusCode = STATUS_CODES.BAD_REQUEST;
            validationError.details = error.details.map(detail => detail.message);
            throw validationError; */
            return res.status(400).json({ error: error.details[0].message });
        }
        next();
    } catch (error) {
/*         if (!error.statusCode) {
            error.statusCode = STATUS_CODES.BAD_REQUEST;
        }
        next(error); */
        res.status(400).send({ error: error.message });
    }
};