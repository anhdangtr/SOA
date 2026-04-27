const paymentService = require("../services/paymentService");

exports.processPayment = async (req, res, next) => {
  const { orderId, outcome, method } = req.body;
  if (!orderId || !outcome) {
    return res.status(400).json({ message: "Missing orderId or outcome" });
  }

  try {
    const payment = await paymentService.processPayment({
      orderId,
      outcome,
      method,
    });
    res.json(payment);
  } catch (error) {
    next(error);
  }
};

exports.getPaymentByOrderId = async (req, res, next) => {
  try {
    const payment = await paymentService.getPayment(req.params.orderId);
    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }
    res.json(payment);
  } catch (error) {
    next(error);
  }
};
