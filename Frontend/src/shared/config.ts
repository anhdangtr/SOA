export const appConfig = {
  orderServiceUrl: import.meta.env.VITE_ORDER_SERVICE_URL ?? "http://localhost:8081",
  paymentServiceUrl: import.meta.env.VITE_PAYMENT_SERVICE_URL ?? "http://localhost:8082",
  deliveryServiceUrl: import.meta.env.VITE_DELIVERY_SERVICE_URL ?? "http://localhost:8083",
} as const;
