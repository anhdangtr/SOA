import { z } from "zod";
import { config } from "../config.js";
import { shipmentModel } from "../models/shipmentModel.js";

const createDeliverySchema = z.object({
  orderId: z.string().min(1, "orderId is required"),
  address: z.string().min(1, "address is required").default("Address pending confirmation"),
});

function mapStatus(status) {
  return status === "COMPLETED" ? "DELIVERED" : "DELIVERING";
}

function toDeliveryResponse(shipment) {
  const etaTarget =
    shipment.status === "COMPLETED"
      ? shipment.updatedAt.getTime()
      : shipment.createdAt.getTime() + config.defaultEtaMinutes * 60 * 1000;

  return {
    orderId: shipment.orderId,
    id: shipment.id,
    etaMinutes: Math.max(0, Math.ceil((etaTarget - Date.now()) / (1000 * 60))),
    courier: "Ga U Muoi Express",
    status: mapStatus(shipment.status),
    createdAt: shipment.createdAt.getTime(),
    updatedAt: shipment.updatedAt.getTime(),
  };
}

export async function createDelivery(input) {
  const payload = createDeliverySchema.parse(input);
  const existing = await shipmentModel.findShipmentByOrderId(payload.orderId);
  if (existing) {
    return toDeliveryResponse(existing);
  }

  const shipment = await shipmentModel.createShipment({
    orderId: payload.orderId,
    address: payload.address,
  });

  return toDeliveryResponse(shipment);
}

export async function getDeliveryByOrderId(orderId) {
  const shipment = await shipmentModel.findShipmentByOrderId(orderId);
  return shipment ? toDeliveryResponse(shipment) : null;
}

export async function markDeliveryAsDelivered(orderId) {
  const shipment = await shipmentModel.updateShipmentStatus(orderId, "COMPLETED");
  return shipment ? toDeliveryResponse(shipment) : null;
}
