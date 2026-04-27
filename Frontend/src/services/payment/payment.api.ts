import { appConfig } from "@/shared/config";
import { httpJson } from "@/shared/http";
import { manualAdvance } from "@/services/order/order.api";
import type { Payment, PaymentMethod, PaymentStatus } from "@/shared/order.types";

export async function processPayment(
  orderId: string,
  outcome: Extract<PaymentStatus, "SUCCESS" | "FAILED">,
  method?: PaymentMethod,
): Promise<Payment> {
  const payment = await httpJson<Payment>(`${appConfig.paymentServiceUrl}/payments`, {
    method: "POST",
    body: JSON.stringify({ orderId, outcome, method }),
  });

  await manualAdvance(orderId, payment.status === "SUCCESS" ? "CONFIRMED" : "CANCELLED");
  return payment;
}

export async function getPayment(orderId: string) {
  return httpJson<Payment>(`${appConfig.paymentServiceUrl}/payments/${orderId}`);
}

export async function manualPayment(
  orderId: string,
  outcome: Extract<PaymentStatus, "SUCCESS" | "FAILED">,
  method?: PaymentMethod,
): Promise<Payment> {
  return processPayment(orderId, outcome, method);
}
