const express = require("express");
const orderController = require("../controllers/orderController");

const router = express.Router();

router.get("/health", (req, res) => {
  res.json({
    service: "order-service",
    status: "running",
    timestamp: new Date().toISOString(),
  });
});

router.get("/products", orderController.listProducts);
router.post("/orders", orderController.createOrder);
router.get("/orders", orderController.listOrders);
router.get("/orders/:orderId", orderController.getOrderById);
router.patch("/orders/:orderId/status", orderController.updateOrderStatus);
router.patch("/orders/:orderId/payment-method", orderController.updatePaymentMethod);

module.exports = router;
