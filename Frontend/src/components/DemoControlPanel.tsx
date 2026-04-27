import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, ChevronUp, CreditCard, Settings2, Truck, XCircle } from "lucide-react";
import { toast } from "sonner";
import { manualAdvance, subscribe } from "@/services/order/order.api";
import { manualPayment } from "@/services/payment/payment.api";
import { STATUS_FLOW, STATUS_LABEL, type Order, type OrderStatus } from "@/shared/order.types";

export function DemoControlPanel({ orderId }: { orderId: string }) {
  const [order, setOrder] = useState<Order | undefined>();
  const [open, setOpen] = useState(true);

  useEffect(() => subscribe((all) => setOrder(all[orderId])), [orderId]);

  if (!order) return null;

  const isCancelled = order.status === "CANCELLED";
  const currentIdx = STATUS_FLOW.indexOf(order.status);
  const nextStatus = STATUS_FLOW[currentIdx + 1];

  const advance = (s: OrderStatus, label: string) => {
    manualAdvance(orderId, s);
    toast(`[Demo] → ${label}`);
  };

  return (
    <motion.div
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed bottom-4 left-1/2 z-40 w-[min(96vw,720px)] -translate-x-1/2"
    >
      <div className="overflow-hidden rounded-2xl border border-foreground/10 bg-foreground text-background shadow-glow">
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
        >
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Settings2 className="h-4 w-4" />
            </span>
            <div>
              <p className="text-[11px] uppercase tracking-wider text-background/60">
                Demo Control Panel
              </p>
              <p className="text-sm font-bold">
                {order.id} · <span className="text-primary">{STATUS_LABEL[order.status]}</span>
              </p>
            </div>
          </div>
          <ChevronUp className={`h-4 w-4 transition-transform ${open ? "" : "rotate-180"}`} />
        </button>

        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="space-y-4 border-t border-background/10 p-4">
                {/* Payment service */}
                <Section title="Payment Service" disabled={order.status !== "PENDING_PAYMENT"}>
                  <PanelButton
                    icon={CheckCircle2}
                    onClick={() => manualPayment(orderId, "SUCCESS", order.paymentMethod)}
                    disabled={order.status !== "PENDING_PAYMENT"}
                    tone="success"
                  >
                    Simulate Success
                  </PanelButton>
                  <PanelButton
                    icon={XCircle}
                    onClick={() => manualPayment(orderId, "FAILED", order.paymentMethod)}
                    disabled={order.status !== "PENDING_PAYMENT"}
                    tone="danger"
                  >
                    Simulate Failure
                  </PanelButton>
                </Section>

                {/* Delivery service */}
                <Section
                  title="Delivery Service"
                  disabled={isCancelled || order.status === "PENDING_PAYMENT"}
                >
                  <PanelButton
                    icon={CreditCard}
                    onClick={() => advance("CONFIRMED", "CONFIRMED")}
                    disabled={!canAdvanceTo(currentIdx, "CONFIRMED")}
                  >
                    Confirmed
                  </PanelButton>
                  <PanelButton
                    icon={Truck}
                    onClick={() => advance("DELIVERING", "DELIVERING")}
                    disabled={!canAdvanceTo(currentIdx, "DELIVERING")}
                  >
                    Delivering
                  </PanelButton>
                  <PanelButton
                    icon={CheckCircle2}
                    onClick={() => advance("DELIVERED", "DELIVERED")}
                    disabled={!canAdvanceTo(currentIdx, "DELIVERED")}
                    tone="success"
                  >
                    Delivered
                  </PanelButton>
                </Section>

                {nextStatus && !isCancelled && order.status !== "PENDING_PAYMENT" && (
                  <p className="text-[11px] text-background/60">
                    Tip: next auto-step would be{" "}
                    <span className="font-semibold text-primary">{STATUS_LABEL[nextStatus]}</span>
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function canAdvanceTo(currentIdx: number, target: OrderStatus) {
  const targetIdx = STATUS_FLOW.indexOf(target);
  return targetIdx !== -1 && targetIdx > currentIdx;
}

function Section({
  title,
  disabled,
  children,
}: {
  title: string;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={disabled ? "opacity-60" : ""}>
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-background/60">
        {title}
      </p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function PanelButton({
  icon: Icon,
  children,
  onClick,
  disabled,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  tone?: "success" | "danger";
}) {
  const toneCls =
    tone === "success"
      ? "border-success/40 bg-success/15 text-success hover:bg-success/25"
      : tone === "danger"
        ? "border-destructive/40 bg-destructive/15 text-destructive hover:bg-destructive/25"
        : "border-background/15 bg-background/5 text-background hover:bg-background/10";
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 ${toneCls}`}
    >
      <Icon className="h-3.5 w-3.5" />
      {children}
    </button>
  );
}
