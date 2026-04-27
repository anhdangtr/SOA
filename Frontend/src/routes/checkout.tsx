import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  CreditCard,
  Loader2,
  Minus,
  Plus,
  ShoppingBag,
  Smartphone,
  Wallet,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { cart, cartTotals, useCart } from "@/lib/cart";
import { triggerDelivery } from "@/services/delivery/delivery.api";
import { createOrder } from "@/services/order/order.api";
import { processPayment } from "@/services/payment/payment.api";
import type { PaymentMethod } from "@/shared/order.types";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout - Chau Ngoc Thao" },
      { name: "description", content: "Review your cart, choose payment, and place your order." },
    ],
  }),
  component: CheckoutPage,
});

const METHODS: {
  id: PaymentMethod;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  sub: string;
}[] = [
  { id: "card", label: "Credit Card", icon: CreditCard, sub: "Visa / Master / JCB" },
  { id: "ewallet", label: "E-Wallet", icon: Smartphone, sub: "MoMo / ZaloPay / ApplePay" },
  { id: "cod", label: "Cash on Delivery", icon: Wallet, sub: "Pay courier on arrival" },
];

function CheckoutPage() {
  const cartState = useCart();
  const { lines, count, total } = cartTotals(cartState);
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [method, setMethod] = useState<PaymentMethod>("card");
  const [processing, setProcessing] = useState(false);

  if (count === 0 && !processing) {
    return (
      <main className="mx-auto max-w-3xl px-5 py-20 text-center">
        <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground" />
        <h1 className="mt-4 text-3xl font-extrabold">Your cart is empty</h1>
        <p className="mt-2 text-muted-foreground">Add some items before checking out.</p>
        <button
          onClick={() => navigate({ to: "/menu" })}
          className="mt-6 rounded-2xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-glow"
        >
          Browse menu
        </button>
      </main>
    );
  }

  const handlePayment = async (outcome: "SUCCESS" | "FAILED") => {
    if (!name || !phone || !address) {
      toast.error("Please fill in delivery details first.");
      return;
    }

    try {
      setProcessing(true);
      const order = await createOrder({
        customer: { name, phone, address },
        lines,
        paymentMethod: method,
      });

      const payment = await processPayment(order.id, outcome, method);
      cart.clear();

      if (payment.status === "SUCCESS") {
        await triggerDelivery(order.id, address);
        toast.success("Payment successful. Preparing your order.");
      } else {
        toast.error("Payment failed. Order cancelled.");
      }

      navigate({ to: "/order/$orderId", params: { orderId: order.id } });
    } catch (error) {
      console.error(error);
      toast.error("Unable to complete checkout right now.");
      setProcessing(false);
    }
  };

  if (processing) {
    return (
      <main className="mx-auto mt-32 flex max-w-md flex-col items-center gap-4 px-5 text-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-lg font-bold">Contacting Payment Service...</p>
        <p className="text-sm text-muted-foreground">Hang tight, we are confirming your order.</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-5 py-10">
      <header className="mb-8">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Checkout</p>
        <h1 className="mt-1 text-4xl font-extrabold">Almost there</h1>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <Card title="Delivery Details" step="1">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Full name" value={name} onChange={setName} placeholder="Nguyen Van A" />
              <Field label="Phone" value={phone} onChange={setPhone} placeholder="+84 ..." />
              <div className="sm:col-span-2">
                <Field
                  label="Delivery address"
                  value={address}
                  onChange={setAddress}
                  placeholder="123 Le Loi, Q.1, HCMC"
                />
              </div>
            </div>
          </Card>

          <Card title="Payment Method" step="2">
            <div className="grid gap-3 sm:grid-cols-3">
              {METHODS.map((m) => {
                const active = method === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => setMethod(m.id)}
                    className={`flex min-h-40 flex-col items-start gap-2 rounded-xl border-2 p-4 text-left transition ${
                      active
                        ? "border-primary bg-primary/10"
                        : "border-border bg-background hover:border-primary/40"
                    }`}
                  >
                    <m.icon className="h-5 w-5 text-primary" />
                    <p className="text-sm font-bold">{m.label}</p>
                    <p className="text-xs text-muted-foreground">{m.sub}</p>
                  </button>
                );
              })}
            </div>
          </Card>

          <Card title="Payment Simulation" step="3">
            <p className="mb-4 text-sm text-muted-foreground">
              Trigger the Payment Service response to demo the microservice flow.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <button
                onClick={() => handlePayment("SUCCESS")}
                className="group flex min-h-40 flex-col items-start gap-2 rounded-xl border-2 border-success/40 bg-success/10 p-5 text-left transition hover:border-success"
              >
                <CheckCircle2 className="h-6 w-6 text-success" />
                <p className="font-bold">Place Order - Success</p>
                <p className="text-xs text-muted-foreground">Triggers Order to Delivery flow.</p>
              </button>
              <button
                onClick={() => handlePayment("FAILED")}
                className="group flex min-h-40 flex-col items-start gap-2 rounded-xl border-2 border-destructive/40 bg-destructive/10 p-5 text-left transition hover:border-destructive"
              >
                <XCircle className="h-6 w-6 text-destructive" />
                <p className="font-bold">Place Order - Failure</p>
                <p className="text-xs text-muted-foreground">Cancels order. No delivery.</p>
              </button>
            </div>
          </Card>
        </motion.section>

        <aside className="h-fit lg:sticky lg:top-20">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
            <h3 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
              Your order
            </h3>
            <ul className="mt-4 max-h-[280px] space-y-3 overflow-y-auto pr-1">
              {lines.map((l) => (
                <li key={l.item.id} className="flex items-center gap-3">
                  <img
                    src={l.item.image}
                    alt={l.item.name}
                    className="h-12 w-12 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <p className="line-clamp-1 text-sm font-semibold">{l.item.name}</p>
                    <p className="text-xs text-muted-foreground">{l.item.price}k</p>
                  </div>
                  <div className="flex items-center gap-1 rounded-full border border-border bg-background p-0.5">
                    <button
                      onClick={() => cart.remove(l.item.id)}
                      className="flex h-6 w-6 items-center justify-center rounded-full hover:bg-accent"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-5 text-center text-xs font-bold">{l.qty}</span>
                    <button
                      onClick={() => cart.add(l.item)}
                      className="flex h-6 w-6 items-center justify-center rounded-full hover:bg-accent"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
              <Row label="Subtotal" value={`${total}k`} />
              <Row label="Delivery" value="Free" />
              <Row label="Total" value={`${total}k`} bold />
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}

function Card({
  title,
  step,
  children,
}: {
  title: string;
  step: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-card p-6 shadow-card">
      <header className="mb-4 flex items-center gap-3">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
          {step}
        </span>
        <h2 className="text-lg font-bold">{title}</h2>
      </header>
      {children}
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1 w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
      />
    </label>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={`flex items-center justify-between ${bold ? "text-base font-extrabold" : ""}`}>
      <span className={bold ? "" : "text-muted-foreground"}>{label}</span>
      <span>{value}</span>
    </div>
  );
}
