import { Link } from "@tanstack/react-router";
import { ShoppingBag } from "lucide-react";
import { useCart, cartTotals } from "@/lib/cart";

export function SiteHeader() {
  const cart = useCart();
  const { count } = cartTotals(cart);

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Link to="/" className="flex items-center gap-3">
          <span className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full">
            <img
              src="/logo.png"
              alt="Chau Ngoc Thao logo"
              className="h-full w-full scale-[2.6] object-contain"
            />
          </span>
          <div className="leading-tight">
            <p className="text-bubble-food font-brand text-xl font-extrabold uppercase tracking-[0.03em] sm:text-2xl leading-normal py-1">
              Châu Ngọc Thảo
            </p>
            <p className="text-sm font-semibold -mt-2.5 opacity-90">Salt-Baked Chicken</p>
          </div>
        </Link>
        <nav className="hidden items-center gap-7 text-sm font-medium md:flex">
          <Link
            to="/"
            activeOptions={{ exact: true }}
            activeProps={{ className: "text-foreground" }}
            className="text-muted-foreground hover:text-foreground"
          >
            Home
          </Link>
          <Link
            to="/menu"
            activeProps={{ className: "text-foreground" }}
            className="text-muted-foreground hover:text-foreground"
          >
            Menu
          </Link>
          <Link
            to="/track"
            activeProps={{ className: "text-foreground" }}
            className="text-muted-foreground hover:text-foreground"
          >
            Track Order
          </Link>
        </nav>
        <Link
          to="/checkout"
          className="relative inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-card transition hover:brightness-95"
        >
          <ShoppingBag className="h-4 w-4" />
          Cart
          {count > 0 && (
            <span className="ml-1 rounded-full bg-foreground px-2 py-0.5 text-[11px] font-bold text-background">
              {count}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}
