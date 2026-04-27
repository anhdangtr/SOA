import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CreditCard, Loader2, QrCode, ShoppingBag, Truck, Wallet } from "lucide-react";
import { toast } from "sonner";
import { formatPrice } from "@/lib/cart";
import { getOrder, manualAdvance, updatePaymentMethod } from "@/services/order/order.api";
import { processPayment } from "@/services/payment/payment.api";
import type { Order, PaymentMethod } from "@/shared/order.types";

export const Route = createFileRoute("/payment/$orderId")({
  head: () => ({
    meta: [
      { title: "Payment - Chau Ngoc Thao" },
      { name: "description", content: "Complete payment for an order that has already been created." },
    ],
  }),
  component: PaymentPage,
});

const TRANSFER_ACCOUNT = {
  bank: "Vietcombank",
  accountNumber: "1029384756",
  accountName: "CHAU NGOC THAO FOOD",
};

function PaymentPage() {
  const { orderId } = Route.useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [method, setMethod] = useState<PaymentMethod | null>(null);
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");

  useEffect(() => {
    let active = true;

    void getOrder(orderId)
      .then((nextOrder) => {
        if (active) {
          setOrder(nextOrder);
        }
      })
      .catch((error) => {
        console.error(error);
        toast.error("Unable to load this order.");
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [orderId]);

  if (loading) {
    return (
      <main className="mx-auto mt-32 flex max-w-md flex-col items-center gap-4 px-5 text-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-lg font-bold">Loading payment details...</p>
      </main>
    );
  }

  if (!order) {
    return (
      <main className="mx-auto max-w-3xl px-5 py-20 text-center">
        <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground" />
        <h1 className="mt-4 text-3xl font-extrabold">Order not found</h1>
        <button
          onClick={() => navigate({ to: "/menu" })}
          className="mt-6 rounded-2xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-glow"
        >
          Back to menu
        </button>
      </main>
    );
  }

  const alreadyCompleted = order.status !== "PENDING_PAYMENT" || order.payment?.status === "SUCCESS";
  const activeMethod = method ?? (order.paymentMethod === "pending" ? null : order.paymentMethod);

  const handleCancel = () => {
    toast.message("Payment cancelled. Your order is still saved as pending.");
    navigate({ to: "/order/$orderId", params: { orderId: order.id } });
  };

  const handleSuccess = async () => {
    if (!activeMethod) {
      toast.error("Please choose a payment method.");
      return;
    }

    if (activeMethod === "card" && (!cardName || !cardNumber || !cardExpiry || !cardCvv)) {
      toast.error("Please complete your card information.");
      return;
    }

    try {
      setProcessing(true);
      await updatePaymentMethod(order.internalId, activeMethod);

      if (activeMethod === "cod") {
        await manualAdvance(order.internalId, "DELIVERING");
        toast.success("COD order confirmed. Your order is now shipping.");
        navigate({ to: "/order/$orderId", params: { orderId: order.id } });
        return;
      }

      await processPayment(order.internalId, "SUCCESS", activeMethod);
      await manualAdvance(order.internalId, "DELIVERING");
      toast.success("Payment successful. Your order is now shipping.");
      navigate({ to: "/order/$orderId", params: { orderId: order.id } });
    } catch (error) {
      console.error(error);
      toast.error("Unable to complete payment right now.");
      setProcessing(false);
    }
  };

  return (
    <main className="mx-auto max-w-6xl px-5 py-10 pb-16">
      <header className="mb-8">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Payment</p>
        <h1 className="mt-1 text-4xl font-extrabold">Choose payment method for order {order.id}</h1>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
          If you cancel here, the order remains saved in pending status.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] xl:grid-cols-[minmax(0,1fr)_340px]">
        <section className="overflow-hidden rounded-3xl border border-border bg-card shadow-card">
          <div className="bg-gradient-sun p-6">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-foreground/60">Order</p>
            <h2 className="mt-2 text-3xl font-extrabold text-foreground">Payment details</h2>
            <p className="mt-2 max-w-3xl text-sm text-foreground/80">
              The order has already been created. You are only confirming payment on this page.
            </p>
          </div>

          <div className="space-y-6 p-6">
            {!alreadyCompleted && (
              <div className="space-y-4 rounded-3xl border border-border bg-background p-5">
                <div className="flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-primary" />
                  <p className="text-lg font-bold">Payment method</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  {[
                    {
                      id: "card" as PaymentMethod,
                      label: "Card",
                      icon: CreditCard,
                      sub: "Fill in card details and process payment online.",
                    },
                    {
                      id: "transfer" as PaymentMethod,
                      label: "Transfer",
                      icon: QrCode,
                      sub: "Scan QR or transfer money to the specified account.",
                    },
                    {
                      id: "cod" as PaymentMethod,
                      label: "Cash on delivery",
                      icon: Truck,
                      sub: "Fill in the delivery details and confirm the order.",
                    },
                  ].map((item) => {
                    const active = activeMethod === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setMethod(item.id)}
                        disabled={processing}
                        className={`flex min-h-36 flex-col items-start gap-2 rounded-2xl border-2 p-4 text-left transition ${
                          active
                            ? "border-primary bg-primary/10"
                            : "border-border bg-card hover:border-primary/40"
                        } disabled:cursor-not-allowed disabled:opacity-60`}
                      >
                        <item.icon className="h-5 w-5 text-primary" />
                        <p className="text-sm font-bold">{item.label}</p>
                        <p className="text-xs text-muted-foreground">{item.sub}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {activeMethod === "card" && (
              <div className="space-y-4 rounded-3xl border border-border bg-background p-5">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-primary" />
                  <p className="text-lg font-bold">Card information</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field
                    label="Card holder"
                    value={cardName}
                    onChange={setCardName}
                    placeholder="NGUYEN VAN A"
                    disabled={alreadyCompleted || processing}
                  />
                  <Field
                    label="Card number"
                    value={cardNumber}
                    onChange={setCardNumber}
                    placeholder="4111 1111 1111 1111"
                    disabled={alreadyCompleted || processing}
                  />
                  <Field
                    label="Expiry date"
                    value={cardExpiry}
                    onChange={setCardExpiry}
                    placeholder="12/28"
                    disabled={alreadyCompleted || processing}
                  />
                  <Field
                    label="CVV"
                    value={cardCvv}
                    onChange={setCardCvv}
                    placeholder="123"
                    disabled={alreadyCompleted || processing}
                  />
                </div>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={processing}
                    className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm font-bold transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={alreadyCompleted ? () => navigate({ to: "/order/$orderId", params: { orderId: order.id } }) : handleSuccess}
                    disabled={processing}
                    className="w-full rounded-2xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground shadow-glow transition hover:brightness-95 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {processing ? "Processing..." : alreadyCompleted ? "View Order" : "Payment Successful"}
                  </button>
                </div>
              </div>
            )}

            {activeMethod === "transfer" && (
              <div className="space-y-4 rounded-3xl border border-border bg-background p-5">
                <div className="flex items-center gap-2">
                  <QrCode className="h-5 w-5 text-primary" />
                  <p className="text-lg font-bold">Transfer information</p>
                </div>
                <div className="grid gap-4 lg:grid-cols-[220px_1fr]">
                  <TransferQrCard />
                  <div className="rounded-2xl border border-border bg-card p-4">
                    <PriceRow label="Bank" value={TRANSFER_ACCOUNT.bank} />
                    <PriceRow label="Account number" value={TRANSFER_ACCOUNT.accountNumber} />
                    <PriceRow label="Account name" value={TRANSFER_ACCOUNT.accountName} />
                    <PriceRow label="Amount" value={formatPrice(order.total)} />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Just transfer the exact amount shown here, then confirm success.
                </p>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={processing}
                    className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm font-bold transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={alreadyCompleted ? () => navigate({ to: "/order/$orderId", params: { orderId: order.id } }) : handleSuccess}
                    disabled={processing}
                    className="w-full rounded-2xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground shadow-glow transition hover:brightness-95 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {processing ? "Processing..." : alreadyCompleted ? "View Order" : "Payment Successful"}
                  </button>
                </div>
              </div>
            )}

            {activeMethod === "cod" && (
              <div className="space-y-4 rounded-3xl border border-border bg-background p-5">
                <div className="flex items-center gap-2">
                  <Truck className="h-5 w-5 text-primary" />
                  <p className="text-lg font-bold">Cash on delivery</p>
                </div>
                <div className="rounded-2xl border border-border bg-card p-4 text-sm text-muted-foreground">You do not need online payment. Confirm Cash on Delivery (COD) here, and the order will be transferred to shipping immediately.
                  
                </div>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={processing}
                    className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm font-bold transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={alreadyCompleted ? () => navigate({ to: "/order/$orderId", params: { orderId: order.id } }) : handleSuccess}
                    disabled={processing}
                    className="w-full rounded-2xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground shadow-glow transition hover:brightness-95 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {processing ? "Processing..." : alreadyCompleted ? "View Order" : "Confirm COD"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

        <aside className="h-fit self-start rounded-3xl bg-gradient-soft p-4 lg:sticky lg:top-24">
          <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
            <div className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-primary" />
              <p className="text-sm font-bold">Payment snapshot</p>
            </div>

            <div className="mt-4 space-y-2.5 text-sm">
              <PriceRow label="Customer" value={order.customer.name} />
              <PriceRow label="Phone" value={order.customer.phone} />
              <PriceRow label="Method" value={formatMethod(activeMethod ?? order.paymentMethod)} />
              <PriceRow label="Subtotal" value={formatPrice(order.subtotal)} />
              <PriceRow label="Shipping fee" value={formatPrice(order.shippingFee)} />
              <PriceRow
                label="Discount"
                value={order.discountAmount > 0 ? `- ${formatPrice(order.discountAmount)}` : formatPrice(0)}
              />
            </div>

            <div className="mt-4 rounded-2xl bg-primary/15 p-3.5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Total payment
              </p>
              <p className="mt-1 text-2xl font-extrabold">{formatPrice(order.total)}</p>
            </div>

            <div className="mt-4 rounded-2xl bg-primary/10 p-3.5 text-sm">
              <p className="font-bold">Order status right now</p>
              <p className="mt-1 text-muted-foreground">
                {alreadyCompleted
                  ? "This order is no longer pending payment."
                  : "If you leave or press cancel here, the order will stay pending so it is still saved in the system."}
              </p>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}

function formatMethod(method: Order["paymentMethod"] | null) {
  switch (method) {
    case "card":
      return "Card";
    case "transfer":
      return "Transfer";
    case "cod":
      return "Cash on delivery";
    default:
      return "Not selected";
  }
}

function TransferQrCard() {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="grid grid-cols-7 gap-1 rounded-2xl bg-white p-3 shadow-card">
        {Array.from({ length: 49 }, (_, index) => {
          const filled = [0, 1, 5, 6, 7, 13, 35, 41, 42, 43, 47, 48].includes(index) || index % 3 === 0;

          return (
            <span
              key={index}
              className={`aspect-square rounded-[2px] ${filled ? "bg-black" : "bg-slate-100"}`}
            />
          );
        })}
      </div>
      <p className="mt-3 text-center text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        QR Payment Demo
      </p>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="mt-1 w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-60"
      />
    </label>
  );
}

function PriceRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-semibold">{value}</span>
    </div>
  );
}
