import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  CheckCircle2,
  Clock,
  CreditCard,
  MapPin,
  PackageCheck,
  Truck,
  XCircle,
} from "lucide-react";
import { subscribe } from "@/services/order/order.api";
import { STATUS_FLOW, STATUS_LABEL, type Order, type OrderStatus } from "@/shared/order.types";

// 1. FIX TẠI ĐÂY: Cập nhật danh sách Icon khớp với 4 bước mới
const ICONS: Record<OrderStatus, React.ComponentType<{ className?: string }>> = {
  PENDING_PAYMENT: CreditCard,
  CONFIRMED: CheckCircle2,
  DELIVERING: Truck, // Dùng icon xe tải cho bước giao hàng
  DELIVERED: PackageCheck,
  CANCELLED: XCircle,
};

export function OrderTracker({ orderId }: { orderId: string }) {
  const [order, setOrder] = useState<Order | undefined>();

  useEffect(() => subscribe((all) => setOrder(all[orderId])), [orderId]);

  if (!order) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-10 text-center text-muted-foreground">
        Order not found.
      </div>
    );
  }

  const cancelled = order.status === "CANCELLED";
  const currentIdx = STATUS_FLOW.indexOf(order.status);
  const progress = cancelled ? 0 : Math.max(0, (currentIdx / (STATUS_FLOW.length - 1)) * 100);

  return (
    <div className="space-y-6">
      {/* Summary card */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
        <div className="bg-gradient-sun p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-foreground/60">
                Order ID
              </p>
              <h2 className="mt-1 text-2xl font-extrabold text-foreground">{order.id}</h2>
            </div>
            {order.delivery && (
              <div className="rounded-xl bg-foreground/10 px-3 py-2 text-right backdrop-blur">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-foreground/70">
                  Delivery ID
                </p>
                <p className="text-sm font-bold text-foreground">{order.delivery.id}</p>
              </div>
            )}
          </div>
          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium text-foreground/80">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-4 w-4" /> {order.customer.address}
            </span>
            {order.delivery && (
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-4 w-4" /> ETA ~{order.delivery.etaMinutes} min ·{" "}
                {order.delivery.courier}
              </span>
            )}
          </div>
        </div>

        <div className="p-6">
          <AnimatePresence mode="wait">
            {cancelled ? (
              <motion.div
                key="cancelled"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-destructive"
              >
                <XCircle className="mt-0.5 h-5 w-5 shrink-0" />
                <div>
                  <p className="font-semibold">Order Cancelled</p>
                  <p className="text-sm opacity-90">
                    Payment failed. The Delivery Service was not triggered.
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div key="active" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={order.status}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="mb-5 flex items-center gap-3 rounded-xl bg-primary/15 p-3"
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      {(() => {
                        const Icon = ICONS[order.status] || CreditCard; // Thêm fallback để tránh lỗi
                        return <Icon className="h-4 w-4" />;
                      })()}
                    </span>
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Current Status
                      </p>
                      <p className="text-sm font-bold">{STATUS_LABEL[order.status]}</p>
                    </div>
                  </motion.div>
                </AnimatePresence>

                <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
                  <motion.div
                    initial={false}
                    animate={{ width: `${progress}%` }}
                    className="absolute inset-y-0 left-0 bg-gradient-sun"
                  />
                </div>

                <ol className="mt-6 grid gap-3 grid-cols-2 sm:grid-cols-4">
                  {STATUS_FLOW.map((s, i) => {
                    const Icon = ICONS[s];
                    const reached = i <= currentIdx;
                    const active = i === currentIdx;
                    return (
                      <li
                        key={s}
                        className={`flex flex-col items-center gap-2 rounded-xl border p-3 text-center text-xs transition ${reached ? "border-primary/40 bg-primary/10" : "border-border bg-background"}`}
                      >
                        <span
                          className={`flex h-9 w-9 items-center justify-center rounded-full ${reached ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"} ${active ? "animate-pulse" : ""}`}
                        >
                          <Icon className="h-4 w-4" />
                        </span>
                        <span className={`font-semibold ${reached ? "" : "text-muted-foreground"}`}>
                          {STATUS_LABEL[s]}
                        </span>
                      </li>
                    );
                  })}
                </ol>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Timeline */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Service Activity Log
        </h3>
        <ul className="space-y-2">
          {order.history.map((h, i) => (
            <motion.li
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-start gap-3 rounded-xl border border-border/60 bg-background p-3"
            >
              <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
              <div className="flex-1">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="text-sm font-semibold">{STATUS_LABEL[h.status]}</p>
                  <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                    {h.service} · {new Date(h.at).toLocaleTimeString()}
                  </p>
                </div>
                {h.note && <p className="text-sm text-muted-foreground">{h.note}</p>}
              </div>
            </motion.li>
          ))}
        </ul>
      </div>

      {/* Items */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Items
        </h3>
        <ul className="divide-y divide-border">
          {order.lines.map((l) => (
            <li key={l.item.id} className="flex items-center justify-between py-3 text-sm">
              <span>
                {l.qty} × {l.item.name}
              </span>
              <span className="font-semibold">{l.qty * l.item.price}k</span>
            </li>
          ))}
        </ul>
        <div className="mt-3 flex items-center justify-between border-t border-border pt-3 text-base font-bold">
          <span>Total</span>
          <span>{order.total}k</span>
        </div>
      </div>
    </div>
  );
}
