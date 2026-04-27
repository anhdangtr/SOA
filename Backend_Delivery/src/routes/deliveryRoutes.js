import { Router } from "express";
import {
  createDeliveryController,
  getDeliveryController,
  healthcheckController,
  markDeliveredController,
} from "../controllers/deliveryController.js";

const router = Router();

router.get("/health", healthcheckController);
router.post("/deliveries", createDeliveryController);
router.get("/deliveries/:orderId", getDeliveryController);
router.patch("/deliveries/:orderId/delivered", markDeliveredController);

export const deliveryRoutes = router;
