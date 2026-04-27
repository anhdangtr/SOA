import {
  cancelDelivery,
  createDelivery,
  getDeliveryByOrderId,
  markDeliveryAsDelivered,
  updateDeliveryStatus,
} from "../services/deliveryService.js";
import { shipmentModel } from "../models/shipmentModel.js";

export async function healthcheckController(_request, response) {
  await shipmentModel.healthcheck();
  response.json({ ok: true });
}

export async function createDeliveryController(request, response) {
  const delivery = await createDelivery(request.body);
  response.status(201).json(delivery);
}

export async function getDeliveryController(request, response) {
  const delivery = await getDeliveryByOrderId(request.params.orderId);
  if (!delivery) {
    response.status(404).json({ message: "Delivery not found" });
    return;
  }

  response.json(delivery);
}

export async function markDeliveredController(request, response) {
  const delivery = await markDeliveryAsDelivered(request.params.orderId);
  if (!delivery) {
    response.status(404).json({ message: "Delivery not found" });
    return;
  }

  response.json({ success: true, delivery });
}

export async function updateDeliveryStatusController(request, response) {
  const delivery = await updateDeliveryStatus(request.params.orderId, request.body);
  if (!delivery) {
    response.status(404).json({ message: "Delivery not found" });
    return;
  }

  response.json({ success: true, delivery });
}

export async function cancelDeliveryController(request, response) {
  const delivery = await cancelDelivery(request.params.orderId);
  if (!delivery) {
    response.status(404).json({ message: "Delivery not found" });
    return;
  }

  response.json({ success: true, delivery });
}
