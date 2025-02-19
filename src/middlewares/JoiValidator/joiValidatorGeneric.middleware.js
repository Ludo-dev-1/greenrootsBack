import { STATUS_CODES, ERROR_MESSAGES } from "../../utils/constants.js";

export const validate = (schema) => (req, res, next) => {
    try {
        const { error } = schema.validate(req.body);
        if (error) {
            return res.status(STATUS_CODES.BAD_REQUEST).json({
                error: error.details.map(detail => detail.message).join(", ")
            });
        }
        next();
    } catch (error) {
        next(error);
    }
};