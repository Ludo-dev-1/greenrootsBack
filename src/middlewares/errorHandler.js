import { STATUS_CODES, ERROR_MESSAGES } from "../utils/constants.js";

const notFound = (req, res, next) => {
    const error = new Error(ERROR_MESSAGES.ROUTE_NOT_FOUND);
    error.statusCode = STATUS_CODES.NOT_FOUND;
    next(error);
};

const errorHandler = (error, req, res, next) => {
    console.error("Erreur interceptée :", error);
    const status = error.statusCode || STATUS_CODES.SERVER_ERROR;
    const errorMessage = error.message || ERROR_MESSAGES.SERVER_ERROR;

    res.status(status).json({
        status, 
        error: Array.isArray(errorMessage) ? errorMessage : [errorMessage] 
    });
};

export { notFound, errorHandler };