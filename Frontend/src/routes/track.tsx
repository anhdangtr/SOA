import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { subscribe } from "@/services/order/order.api";
import { type Order, STATUS_LABEL } from "@/shared/order.types";

export const Route = createFileRoute("/track")({
  head: () => ({
    meta: [
      { title: "Track My Order - Chau Ngoc Thao" },
      { name: "description", content: "Find your order and follow its journey." },
    ],
  }),
  component: TrackPage,
});

function TrackPage() {
  const [orderId, setOrderId] = useState("");
  const [allOrders, setAllOrders] = useState<Record<string, Order>>({});
  const navigate = useNavigate();

  useEffect(() => subscribe(setAllOrders), []);

  const recent = Object.values(allOrders)
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 5);

  return (
    <main className="mx-auto max-w-3xl px-5 py-16">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
        Order tracking
      </p>
      <h1 className="mt-1 text-4xl font-bold">Track my order</h1>
      <p className="mt-2 text-muted-foreground">
        Enter your Order ID, or pick a recent order below.
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (orderId.trim()) {
            navigate({ to: "/order/$orderId", params: { orderId: orderId.trim() } });
          }
        }}
        className="mt-8 flex gap-2"
      >
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={orderId}
            onChange={(e) => setOrderId(e.target.value.toUpperCase())}
            placeholder="ORD-XXXXXX"
            className="w-full rounded-full border border-input bg-background py-3 pl-11 pr-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <button className="rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-glow">
          Track
        </button>
      </form>

      {recent.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Recent orders
          </h2>
          <ul className="space-y-2">
            {recent.map((o) => (
              <li key={o.id}>
                <button
                  onClick={() => navigate({ to: "/order/$orderId", params: { orderId: o.id } })}
                  className="flex w-full items-center justify-between rounded-2xl border border-border bg-card p-4 text-left shadow-card transition hover:border-primary"
                >
                  <div>
                    <p className="font-semibold">{o.id}</p>
                    <p className="text-xs text-muted-foreground">
                      {o.lines.reduce((n, l) => n + l.qty, 0)} items - {o.total}k
                    </p>
                  </div>
                  <span className="rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-foreground">
                    {STATUS_LABEL[o.status]}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
