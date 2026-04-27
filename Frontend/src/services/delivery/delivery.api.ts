import { appConfig } from "@/shared/config";
import { httpJson } from "@/shared/http";
import type { Delivery } from "@/shared/order.types";

export async function triggerDelivery(orderId: string, address?: string) {
  return httpJson<Delivery>(`${appConfig.deliveryServiceUrl}/deliveries`, {
    method: "POST",
    body: JSON.stringify({ orderId, address }),
  });
}

export async function getDelivery(orderId: string) {
  return httpJson<Delivery>(`${appConfig.deliveryServiceUrl}/deliveries/${orderId}`);
}

export async function markDelivered(orderId: string) {
  await httpJson<{ success: boolean }>(`${appConfig.deliveryServiceUrl}/deliveries/${orderId}/delivered`, {
    method: "PATCH",
  });
}
