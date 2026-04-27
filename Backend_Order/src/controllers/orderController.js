const orderService = require("../services/orderService");

exports.createOrder = async (req, res, next) => {
  try {
    const order = await orderService.createOrder(req.body);
    res.status(201).json(order);
  } catch (error) {
    next(error);
  }
};

exports.listOrders = async (req, res, next) => {
  try {
    const orders = await orderService.listOrders();
    res.json(orders);
  } catch (error) {
    next(error);
  }
};

exports.listProducts = async (req, res, next) => {
  try {
    const products = await orderService.listProducts();
    res.json(products);
  } catch (error) {
    next(error);
  }
};

exports.getOrderById = async (req, res, next) => {
  try {
    const order = await orderService.getOrderById(req.params.orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json(order);
  } catch (error) {
    next(error);
  }
};

exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ message: "Missing status" });
    }

    const updated = await orderService.updateOrderStatus(req.params.orderId, status);
    if (!updated) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

exports.updatePaymentMethod = async (req, res, next) => {
  try {
    const { paymentMethod } = req.body;
    if (!paymentMethod) {
      return res.status(400).json({ message: "Missing paymentMethod" });
    }

    const updated = await orderService.updatePaymentMethod(req.params.orderId, paymentMethod);
    if (!updated) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};
