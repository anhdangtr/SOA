import { z } from "zod";
import { config } from "../config.js";
import { shipmentModel } from "../models/shipmentModel.js";

const createDeliverySchema = z.object({
  orderId: z.string().min(1, "orderId is required"),
  address: z.string().min(1, "address is required").default("Address pending confirmation"),
});

const updateDeliveryStatusSchema = z.object({
  status: z.enum(["DELIVERING", "DELIVERED", "CANCELLED"]),
});

function createError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function mapStatus(status) {
  if (status === "COMPLETED") {
    return "DELIVERED";
  }

  if (status === "CANCELLED") {
    return "CANCELLED";
  }

  return "DELIVERING";
}

function toDeliveryResponse(shipment) {
  const estimatedDeliveryAt =
    shipment.status === "COMPLETED" || shipment.status === "CANCELLED"
      ? shipment.updatedAt.getTime()
      : shipment.createdAt.getTime() + config.defaultEtaMinutes * 60 * 1000;
  const etaTarget =
    shipment.status === "COMPLETED" || shipment.status === "CANCELLED"
      ? shipment.updatedAt.getTime()
      : shipment.createdAt.getTime() + config.defaultEtaMinutes * 60 * 1000;

  return {
    orderId: shipment.orderId,
    id: shipment.id,
    etaMinutes: Math.max(0, Math.ceil((etaTarget - Date.now()) / (1000 * 60))),
    estimatedDeliveryAt,
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
  const shipment = await shipmentModel.findShipmentByOrderId(orderId);
  if (!shipment) {
    return null;
  }

  if (shipment.status === "CANCELLED") {
    throw createError(409, "Cancelled delivery cannot be marked as delivered");
  }

  const updatedShipment = await shipmentModel.updateShipmentStatus(orderId, "COMPLETED");
  return updatedShipment ? toDeliveryResponse(updatedShipment) : null;
}

export async function updateDeliveryStatus(orderId, input) {
  const payload = updateDeliveryStatusSchema.parse(input);
  const shipment = await shipmentModel.findShipmentByOrderId(orderId);
  if (!shipment) {
    return null;
  }

  if (shipment.status === "COMPLETED") {
    throw createError(409, "Delivered shipment can no longer change status");
  }

  if (shipment.status === "CANCELLED") {
    throw createError(409, "Cancelled shipment can no longer change status");
  }

  const nextStatus = payload.status === "DELIVERED" ? "COMPLETED" : payload.status;
  const updatedShipment = await shipmentModel.updateShipmentStatus(orderId, nextStatus);
  return updatedShipment ? toDeliveryResponse(updatedShipment) : null;
}

export async function cancelDelivery(orderId) {
  const shipment = await shipmentModel.findShipmentByOrderId(orderId);
  if (!shipment) {
    return null;
  }

  if (shipment.status === "COMPLETED") {
    throw createError(409, "Delivered shipment cannot be cancelled");
  }

  const updatedShipment = await shipmentModel.updateShipmentStatus(orderId, "CANCELLED");
  return updatedShipment ? toDeliveryResponse(updatedShipment) : null;
}
