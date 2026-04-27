import { createFileRoute, Link } from "@tanstack/react-router";
import { OrderTracker } from "@/components/OrderTracker";
import { DemoControlPanel } from "@/components/DemoControlPanel";

export const Route = createFileRoute("/order/$orderId")({
  head: () => ({
    meta: [
      { title: "Track Order - Chau Ngoc Thao" },
      { name: "description", content: "Live order tracking from kitchen to door." },
    ],
  }),
  component: OrderPage,
});

function OrderPage() {
  const { orderId } = Route.useParams();

  return (
    <main className="mx-auto max-w-4xl px-5 py-10 pb-40">
      <div className="mb-8">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Live Tracking</p>
        <h1 className="mt-1 text-3xl font-extrabold">Your order</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Status updates stream in real time from the Order, Payment and Delivery services.
        </p>
      </div>

      <OrderTracker orderId={orderId} />

      <div className="mt-10 text-center">
        <Link to="/menu" className="text-sm font-bold text-foreground hover:underline">
          Back to menu
        </Link>
      </div>

      <DemoControlPanel orderId={orderId} />
    </main>
  );
}
