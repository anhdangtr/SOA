import { useSyncExternalStore } from "react";
import type { MenuItem } from "./menu";

type CartState = Record<string, { item: MenuItem; qty: number }>;

let state: CartState = {};
let selectedIds = new Set<string>();
let selectedIdsSnapshot: string[] = [];
const listeners = new Set<() => void>();

function syncSelectedIdsSnapshot() {
  selectedIdsSnapshot = Array.from(selectedIds).filter((id) => state[id]);
}

function emit() {
  state = { ...state };
  syncSelectedIdsSnapshot();
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
    selectedIds.add(item.id);
    emit();
  },
  remove(id: string) {
    const cur = state[id];
    if (!cur) return;
    if (cur.qty <= 1) {
      delete state[id];
      selectedIds.delete(id);
    } else {
      state[id] = { ...cur, qty: cur.qty - 1 };
    }
    emit();
  },
  clear() {
    state = {};
    selectedIds = new Set();
    emit();
  },
  removeMany(ids: string[]) {
    for (const id of ids) {
      delete state[id];
      selectedIds.delete(id);
    }
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
  return cartTotalsFromLines(Object.values(s));
}

export function cartTotalsFromLines(lines: Array<{ item: MenuItem; qty: number }>) {
  const count = lines.reduce((n, l) => n + l.qty, 0);
  const total = lines.reduce((n, l) => n + l.qty * l.item.price, 0);

  return {
    lines,
    count,
    total,
    // Nhi có thể dùng totalFormatted này để hiện luôn "450k" mà không cần cộng chuỗi
    totalFormatted: formatPrice(total),
  };
}

export const reviewCartSelection = {
  toggle(id: string) {
    if (selectedIds.has(id)) {
      selectedIds.delete(id);
    } else if (state[id]) {
      selectedIds.add(id);
    }
    emit();
  },
  selectOnly(ids: string[]) {
    selectedIds = new Set(ids.filter((id) => state[id]));
    emit();
  },
  selectAll() {
    selectedIds = new Set(Object.keys(state));
    emit();
  },
  clear() {
    selectedIds = new Set();
    emit();
  },
  has(id: string) {
    return selectedIds.has(id);
  },
  getSelectedIds() {
    return selectedIdsSnapshot;
  },
};

export function reviewCartSelectedLines(s: CartState) {
  return Object.entries(s)
    .filter(([id]) => selectedIds.has(id))
    .map(([, value]) => value);
}

export function useReviewCartSelection() {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => selectedIdsSnapshot,
    () => selectedIdsSnapshot,
  );
}
