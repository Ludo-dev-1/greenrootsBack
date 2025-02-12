export const validate = (schema) => (req, res, next) => {
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