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
import { toast } from "sonner";
import { cancelOrder, subscribe } from "@/services/order/order.api";
import { STATUS_FLOW, STATUS_LABEL, type Order, type OrderStatus } from "@/shared/order.types";

const ICONS: Record<OrderStatus, React.ComponentType<{ className?: string }>> = {
  PENDING_PAYMENT: CreditCard,
  CONFIRMED: CheckCircle2,
  DELIVERING: Truck,
  DELIVERED: PackageCheck,
  CANCELLED: XCircle,
};

const DELIVERY_STATUS_LABEL: Record<NonNullable<Order["delivery"]>["status"], string> = {
  DELIVERING: "On the way",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

const STATUS_STYLES: Record<
  OrderStatus,
  {
    badge: string;
    icon: string;
    activeStep: string;
    reachedStep: string;
  }
> = {
  PENDING_PAYMENT: {
    badge: "bg-amber-100 text-amber-800",
    icon: "bg-amber-500 text-white",
    activeStep: "border-amber-300 bg-amber-50",
    reachedStep: "border-amber-300 bg-amber-50",
  },
  CONFIRMED: {
    badge: "bg-sky-100 text-sky-800",
    icon: "bg-sky-500 text-white",
    activeStep: "border-sky-300 bg-sky-50",
    reachedStep: "border-sky-300 bg-sky-50",
  },
  DELIVERING: {
    badge: "bg-orange-100 text-orange-800",
    icon: "bg-orange-500 text-white",
    activeStep: "border-orange-300 bg-orange-50",
    reachedStep: "border-orange-300 bg-orange-50",
  },
  DELIVERED: {
    badge: "bg-emerald-100 text-emerald-800",
    icon: "bg-emerald-500 text-white",
    activeStep: "border-emerald-300 bg-emerald-50",
    reachedStep: "border-emerald-300 bg-emerald-50",
  },
  CANCELLED: {
    badge: "bg-slate-100 text-slate-700",
    icon: "bg-slate-500 text-white",
    activeStep: "border-slate-300 bg-slate-50",
    reachedStep: "border-slate-300 bg-slate-50",
  },
};

export function OrderTracker({ orderId }: { orderId: string }) {
  const [order, setOrder] = useState<Order | undefined>();
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => subscribe((all) => setOrder(all[orderId])), [orderId]);

  if (!order) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-10 text-center text-muted-foreground">
        Order not found.
      </div>
    );
  }

  const cancelled = order.status === "CANCELLED";
  const canCancel = order.status !== "CANCELLED" && order.status !== "DELIVERED";
  const isActivelyDelivering =
    order.status === "DELIVERING" && order.delivery?.status === "DELIVERING";
  const currentIdx = STATUS_FLOW.indexOf(order.status);
  const progress = cancelled ? 0 : Math.max(0, (currentIdx / (STATUS_FLOW.length - 1)) * 100);
  const currentStatusStyle = STATUS_STYLES[order.status];

  const handleCancelOrder = async () => {
    if (!canCancel || isCancelling) {
      return;
    }

    const confirmed = window.confirm("Cancel this order?");
    if (!confirmed) {
      return;
    }

    try {
      setIsCancelling(true);
      await cancelOrder(orderId);
      toast.success("Order cancelled");
    } catch {
      toast.error("Unable to cancel order right now");
    } finally {
      setIsCancelling(false);
    }
  };

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
          {isActivelyDelivering && order.delivery && (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl bg-foreground/10 px-4 py-3 backdrop-blur">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-foreground/70">
                  Expected Delivery
                </p>
                <p className="mt-1 text-sm font-bold text-foreground">
                  {new Date(order.delivery.estimatedDeliveryAt).toLocaleString("vi-VN", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              <div className="rounded-xl bg-foreground/10 px-4 py-3 backdrop-blur">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-foreground/70">
                  Delivery Status
                </p>
                <p className="mt-1 text-sm font-bold text-foreground">
                  {DELIVERY_STATUS_LABEL[order.delivery.status]}
                </p>
              </div>
            </div>
          )}
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
                  <p className="text-sm opacity-90">This order was cancelled before completion.</p>
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
                    className={`mb-5 flex items-center gap-3 rounded-xl p-3 ${currentStatusStyle.badge}`}
                  >
                    <span
                      className={`flex h-9 w-9 items-center justify-center rounded-full ${currentStatusStyle.icon}`}
                    >
                      {(() => {
                        const Icon = ICONS[order.status] || CreditCard;
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
                        className={`flex flex-col items-center gap-2 rounded-xl border p-3 text-center text-xs transition ${
                          reached ? STATUS_STYLES[s].reachedStep : "border-border bg-background"
                        }`}
                      >
                        <span
                          className={`flex h-9 w-9 items-center justify-center rounded-full ${
                            reached ? STATUS_STYLES[s].icon : "bg-muted text-muted-foreground"
                          } ${active ? "animate-pulse" : ""}`}
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

      {canCancel && (
        <div className="flex justify-end">
          <button
            onClick={handleCancelOrder}
            disabled={isCancelling}
            className="inline-flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-2 text-sm font-semibold text-destructive transition hover:bg-destructive/15 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <XCircle className="h-4 w-4" />
            {isCancelling ? "Cancelling..." : "Cancel order"}
          </button>
        </div>
      )}

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
