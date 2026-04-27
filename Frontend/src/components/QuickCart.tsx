/* File: src/components/QuickCart.tsx */
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { cart, cartTotals, useCart } from "@/lib/cart";

export function QuickCart() {
  const cartState = useCart();
  const { lines, count, total } = cartTotals(cartState);
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Floating button (mobile) */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full bg-foreground px-5 py-3 text-sm font-bold text-background shadow-glow lg:hidden"
      >
        <ShoppingBag className="h-4 w-4" />
        Cart
        {count > 0 && (
          <span className="rounded-full bg-primary px-2 py-0.5 text-[11px] text-primary-foreground">
            {count}
          </span>
        )}
      </button>

      {/* Desktop sticky panel */}
      <aside className="sticky top-20 hidden h-[calc(100vh-6rem)] w-[340px] shrink-0 lg:block">
        <CartPanel />
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-foreground/40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 260 }}
              className="absolute right-0 top-0 h-full w-full max-w-sm bg-background p-4 shadow-glow"
            >
              <button
                onClick={() => setOpen(false)}
                className="mb-2 flex h-9 w-9 items-center justify-center rounded-full hover:bg-accent"
              >
                <X className="h-4 w-4" />
              </button>
              <CartPanel onCheckout={() => setOpen(false)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );

  function CartPanel({ onCheckout }: { onCheckout?: () => void } = {}) {
    return (
      <div className="flex h-full flex-col rounded-2xl border border-border bg-card shadow-card">
        <header className="flex items-center justify-between border-b border-border p-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Quick Cart
            </p>
            <h3 className="text-lg font-bold">
              {count} {count === 1 ? "item" : "items"}
            </h3>
          </div>
          {count > 0 && (
            <button
              onClick={() => cart.clear()}
              className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
              aria-label="Clear"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </header>

        <div className="flex-1 overflow-y-auto p-3">
          {lines.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-2 px-4 text-center text-sm text-muted-foreground">
              <ShoppingBag className="h-8 w-8" />
              Your cart is empty.
              <p className="text-xs">Tap "Add to Cart" on any item.</p>
            </div>
          ) : (
            <ul className="space-y-2">
              <AnimatePresence initial={false}>
                {lines.map((l) => (
                  <motion.li
                    key={l.item.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: 30 }}
                    className="flex items-center gap-3 rounded-xl border border-border/60 bg-background p-2"
                  >
                    <img
                      src={l.item.image}
                      alt={l.item.name}
                      className="h-12 w-12 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <p className="line-clamp-1 text-sm font-semibold">{l.item.name}</p>
                      {/* 1. Sửa giá tiền món ăn lẻ ở đây */}
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
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          )}
        </div>

        <footer className="space-y-3 border-t border-border p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            {/* 2. Sửa tổng tiền ở đây */}
            <span className="text-base font-bold">{total}k</span>
          </div>
          <Link
            to="/checkout"
            onClick={onCheckout}
            className={`flex w-full items-center justify-center rounded-xl px-4 py-3 text-sm font-bold transition ${
              count === 0
                ? "pointer-events-none bg-muted text-muted-foreground"
                : "bg-primary text-primary-foreground shadow-glow hover:brightness-95"
            }`}
          >
            Checkout →
          </Link>
        </footer>
      </div>
    );
  }
}
