import type { MenuItem } from "@/lib/menu";

export type OrderStatus =
  | "PENDING_PAYMENT"
  | "CONFIRMED"
  | "DELIVERING"
  | "DELIVERED"
  | "CANCELLED";

export type PaymentMethod = "card" | "ewallet" | "cod";

export type CartLine = {
  item: MenuItem;
  qty: number;
};

export type PaymentStatus = "PENDING" | "SUCCESS" | "FAILED";

export type Payment = {
  orderId: string;
  method: PaymentMethod;
  status: PaymentStatus;
  txnId?: string;
};

export type Delivery = {
  orderId: string;
  id: string;
  etaMinutes: number;
  courier: string;
  status: "DELIVERING" | "DELIVERED";
};

export type OrderHistory = {
  status: OrderStatus;
  at: number;
  service: string;
  note?: string;
};

export type Order = {
  id: string;
  createdAt: number;
  customer: {
    name: string;
    phone: string;
    address: string;
  };
  lines: CartLine[];
  total: number;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  payment?: Payment;
  delivery?: {
    id: string;
    etaMinutes: number;
    courier: string;
  };
  history: OrderHistory[];
};

export const STATUS_FLOW: OrderStatus[] = [
  "PENDING_PAYMENT",
  "CONFIRMED",
  "DELIVERING",
  "DELIVERED",
];

export const STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING_PAYMENT: "Pending",
  CONFIRMED: "Paid",
  DELIVERING: "Shipping",
  DELIVERED: "Success",
  CANCELLED: "Cancelled",
};
