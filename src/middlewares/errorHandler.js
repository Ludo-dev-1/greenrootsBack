const notFound = (req, res, next) => {
    const error = new Error("Aucun arbre de ce nom trouvé");
    error.statusCode = 404;
    next(error);
};

const errorHandler = (error, req, res, next) => {
    console.error("Erreur interceptée :", error);
    const status = error.statusCode || 500;

    const defaultError = status === 500 ? `Erreur serveur : ${error.message} ` : error.message;

    res.status(status).json({status, error: Array.isArray(defaultError) ? defaultError : [defaultError] });
};

export { notFound, errorHandler };