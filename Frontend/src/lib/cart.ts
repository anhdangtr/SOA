import { useSyncExternalStore } from "react";
import type { MenuItem } from "./menu";

type CartState = Record<string, { item: MenuItem; qty: number }>;

let state: CartState = {};
const listeners = new Set<() => void>();

function emit() {
  state = { ...state };
  for (const l of listeners) l();
}

// Hàm bổ trợ để hiển thị đơn vị tiền tệ thống nhất cho cả website
export const formatPrice = (price: number) => {
  return `${price}k`;
};

export const cart = {
  add(item: MenuItem) {
    const cur = state[item.id];
    state[item.id] = { item, qty: (cur?.qty ?? 0) + 1 };
    emit();
  },
  remove(id: string) {
    const cur = state[id];
    if (!cur) return;
    if (cur.qty <= 1) delete state[id];
    else state[id] = { ...cur, qty: cur.qty - 1 };
    emit();
  },
  clear() {
    state = {};
    emit();
  },
  get() {
    return state;
  },
};

export function useCart() {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => state,
    () => state,
  );
}

export function cartTotals(s: CartState) {
  const lines = Object.values(s);
  const count = lines.reduce((n, l) => n + l.qty, 0);
  // Tính tổng tiền dựa trên số lượng và giá (đơn vị là số nguyên, ví dụ: 290)
  const total = lines.reduce((n, l) => n + l.qty * l.item.price, 0);

  return {
    lines,
    count,
    total,
    // Nhi có thể dùng totalFormatted này để hiện luôn "450k" mà không cần cộng chuỗi
    totalFormatted: formatPrice(total),
  };
}
