import { Router } from "express";
import {
  cancelDeliveryController,
  createDeliveryController,
  getDeliveryController,
  healthcheckController,
  markDeliveredController,
  updateDeliveryStatusController,
} from "../controllers/deliveryController.js";

const router = Router();

router.get("/health", healthcheckController);
router.post("/deliveries", createDeliveryController);
router.get("/deliveries/:orderId", getDeliveryController);
router.patch("/deliveries/:orderId/status", updateDeliveryStatusController);
router.patch("/deliveries/:orderId/delivered", markDeliveredController);
router.patch("/deliveries/:orderId/cancel", cancelDeliveryController);

export const deliveryRoutes = router;
