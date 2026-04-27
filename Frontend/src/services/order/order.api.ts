import { appConfig } from "@/shared/config";
import { httpJson } from "@/shared/http";
import type {
  CartLine,
  CheckoutCustomerInput,
  Order,
  OrderStatus,
  PaymentMethod,
} from "@/shared/order.types";

export async function createOrder(input: {
  customer: CheckoutCustomerInput;
  lines: CartLine[];
  paymentMethod: PaymentMethod;
  shippingFee: number;
  promoCode?: string;
  discountAmount?: number;
}) {
  return httpJson<Order>(`${appConfig.orderServiceUrl}/orders`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function getOrder(orderId: string) {
  return httpJson<Order>(`${appConfig.orderServiceUrl}/orders/${orderId}`);
}

export async function getAllOrders() {
  const orders = await httpJson<Order[]>(`${appConfig.orderServiceUrl}/orders`);
  return Object.fromEntries(orders.map((order) => [order.id, order])) as Record<string, Order>;
}

export function subscribe(listener: (orders: Record<string, Order>) => void) {
  void getAllOrders().then(listener);
  const interval = window.setInterval(() => {
    void getAllOrders().then(listener).catch(() => {});
  }, 3000);

  return () => window.clearInterval(interval);
}

export async function manualAdvance(orderId: string, target: OrderStatus) {
  await httpJson<void>(`${appConfig.orderServiceUrl}/orders/${orderId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status: target }),
  });
}
