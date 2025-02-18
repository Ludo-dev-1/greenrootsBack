const notFound = (req, res, next) => {
    const error = new Error("Root non trouvée");
    error.statusCode = 404;
    next(error);
};

const errorHandler = (error, req, res, next) => {
    console.error("Erreur interceptée :", error);
    const status = error.statusCode || 500;
    const defaultError = `Erreur serveur : ${error.defaultError} ` || "Une erreur est survenue";

    res.status(status).json({
        status, 
        error: Array.isArray(defaultError) ? defaultError : [defaultError] 
    });
};

export { notFound, errorHandler };