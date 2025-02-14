import { Order } from "../models/association.js"

const adminOrderController = {
    getAllOrders: async (req, res, next) => {
        try {
            const orders = await Order.findAll({
                order: [["date", "DESC"]]
            });

            if (!orders) {
                error.statusCode = 404;
                return next(error);
            };

            res.status(200).json(orders);

        } catch (error) {
            error.statusCode = 500;
            return next(error);
        }
    },
};

export default adminOrderController;