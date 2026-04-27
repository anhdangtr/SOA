const express = require("express");
const router = express.Router();

const paymentController = require("../controllers/paymentController");

// Health check (để test service đang chạy)
router.get("/health", (req, res) => {
  res.json({
    service: "payment-service",
    status: "running",
    timestamp: new Date().toISOString(),
  });
});

// Create / process payment
router.post("/payments", paymentController.processPayment);

// Get payment by orderId
router.get("/payments/:orderId", paymentController.getPaymentByOrderId);

module.exports = router;
