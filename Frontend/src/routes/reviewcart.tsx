import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Check,
  Minus,
  Plus,
  ShoppingBag,
  Square,
  TicketPercent,
  Trash2,
} from "lucide-react";
import {
  cart,
  cartTotals,
  cartTotalsFromLines,
  formatPrice,
  reviewCartSelectedLines,
  reviewCartSelection,
  useCart,
  useReviewCartSelection,
} from "@/lib/cart";

export const Route = createFileRoute("/reviewcart")({
  head: () => ({
    meta: [
      { title: "Review Cart - Chau Ngoc Thao" },
      { name: "description", content: "Review cart items and choose which products to buy now." },
    ],
  }),
  component: ReviewCartPage,
});

const REVIEW_CART_SHIPPING_FEE = 25;

function ReviewCartPage() {
  const reviewCartState = useCart();
  const reviewCartSelectedIds = useReviewCartSelection();
  const reviewCartNavigate = useNavigate();
  const { lines: reviewCartLines, count: reviewCartCount } = cartTotals(reviewCartState);
  const reviewCartSelected = reviewCartSelectedLines(reviewCartState);
  const {
    count: reviewCartSelectedCount,
    total: reviewCartSelectedTotal,
  } = cartTotalsFromLines(reviewCartSelected);
  const reviewCartGrandTotal = reviewCartSelectedTotal + REVIEW_CART_SHIPPING_FEE;
  const reviewCartAllSelected =
    reviewCartLines.length > 0 && reviewCartSelectedIds.length === reviewCartLines.length;

  if (reviewCartCount === 0) {
    return (
      <main className="mx-auto max-w-3xl px-5 py-20 text-center">
        <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground" />
        <h1 className="mt-4 text-3xl font-extrabold">Your review cart is empty</h1>
        <p className="mt-2 text-muted-foreground">
          Add products to the cart first, then come back here to choose what you want to buy now.
        </p>
        <button
          onClick={() => reviewCartNavigate({ to: "/menu" })}
          className="mt-6 rounded-2xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-glow"
        >
          Browse menu
        </button>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-5 py-10 pb-16">
      <header className="mb-8">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">review Cart</p>
        <h1 className="mt-1 text-4xl font-extrabold">Choose items for checkout</h1>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
          Select the products you want to purchase now. Anything not selected will stay in the cart.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-border bg-card shadow-card"
        >
          <div className="border-b border-border bg-gradient-soft p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
                  ReviewCart Items
                </p>
                <h2 className="mt-1 text-2xl font-extrabold">
                  {reviewCartCount} {reviewCartCount === 1 ? "item" : "items"} in your cart
                </h2>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() =>
                    reviewCartAllSelected
                      ? reviewCartSelection.clear()
                      : reviewCartSelection.selectAll()
                  }
                  className="rounded-full border border-border bg-background px-4 py-2 text-sm font-semibold transition hover:bg-accent"
                >
                  {reviewCartAllSelected ? "Clear selection" : "Select all"}
                </button>
                <button
                  type="button"
                  onClick={() => cart.clear()}
                  className="rounded-full border border-destructive/30 bg-destructive/10 px-4 py-2 text-sm font-semibold text-destructive transition hover:bg-destructive/15"
                >
                  Clear cart
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-3 p-4">
            {reviewCartLines.map((reviewCartLine) => {
              const reviewCartChecked = reviewCartSelection.has(reviewCartLine.item.id);

              return (
                <div
                  key={reviewCartLine.item.id}
                  className={`flex flex-col gap-4 rounded-2xl border p-4 transition sm:flex-row sm:items-center ${
                    reviewCartChecked
                      ? "border-primary/30 bg-primary/10"
                      : "border-border bg-background"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => reviewCartSelection.toggle(reviewCartLine.item.id)}
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-2 transition ${
                      reviewCartChecked
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-card text-muted-foreground"
                    }`}
                    aria-label={`Select ${reviewCartLine.item.name}`}
                  >
                    {reviewCartChecked ? <Check className="h-5 w-5" /> : <Square className="h-5 w-5" />}
                  </button>

                  <img
                    src={reviewCartLine.item.image}
                    alt={reviewCartLine.item.name}
                    className="h-20 w-20 rounded-2xl object-cover"
                  />

                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-1 text-base font-bold">{reviewCartLine.item.name}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{reviewCartLine.item.description}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      <span className="rounded-full bg-primary/15 px-3 py-1 text-sm font-semibold text-primary">
                        {formatPrice(reviewCartLine.item.price)}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        Line total: {formatPrice(reviewCartLine.qty * reviewCartLine.item.price)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end">
                    <div className="flex items-center gap-1 rounded-full border border-border bg-card p-0.5">
                      <button
                        type="button"
                        onClick={() => cart.remove(reviewCartLine.item.id)}
                        className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-accent"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-8 text-center text-sm font-bold">{reviewCartLine.qty}</span>
                      <button
                        type="button"
                        onClick={() => cart.add(reviewCartLine.item)}
                        className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-accent"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => cart.removeMany([reviewCartLine.item.id])}
                      className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                      Remove
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.section>

        <motion.aside
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="h-fit rounded-3xl border border-border bg-card shadow-card lg:sticky lg:top-20"
        >
          <div className="bg-gradient-sun p-6">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-foreground/60">
              Ready to buy now
            </p>
            <h2 className="mt-2 text-3xl font-extrabold text-foreground">Summary</h2>
          </div>

          <div className="space-y-5 p-6">
            <div className="rounded-2xl border border-border bg-background p-4">
              <div className="flex items-center gap-2">
                <TicketPercent className="h-4 w-4 text-primary" />
                <p className="text-sm font-bold">Selected products</p>
              </div>
              <div className="mt-4 space-y-3 text-sm">
                <ReviewCartRow
                  label="Selected items"
                  value={`${reviewCartSelectedCount} ${
                    reviewCartSelectedCount === 1 ? "product" : "products"
                  }`}
                />
                <ReviewCartRow label="Selected subtotal" value={formatPrice(reviewCartSelectedTotal)} />
                <ReviewCartRow label="Shipping fee" value={formatPrice(REVIEW_CART_SHIPPING_FEE)} />
                <ReviewCartRow label="Estimated total" value={formatPrice(reviewCartGrandTotal)} bold />
              </div>
            </div>

            <button
              type="button"
              onClick={() => reviewCartNavigate({ to: "/checkout" })}
              disabled={reviewCartSelectedIds.length === 0}
              className={`w-full rounded-2xl px-4 py-3 text-sm font-bold transition ${
                reviewCartSelectedIds.length === 0
                  ? "cursor-not-allowed bg-muted text-muted-foreground"
                  : "bg-primary text-primary-foreground shadow-glow hover:brightness-95 active:scale-[0.98]"
              }`}
            >
              Buy now
            </button>

            <button
              type="button"
              onClick={() => reviewCartNavigate({ to: "/menu" })}
              className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm font-bold transition hover:bg-accent"
            >
              Continue shopping
            </button>
          </div>
        </motion.aside>
      </div>
    </main>
  );
}

function ReviewCartRow({
  label,
  value,
  bold,
}: {
  label: string;
  value: string;
  bold?: boolean;
}) {
  return (
    <div className={`flex items-center justify-between gap-3 ${bold ? "text-base font-bold" : ""}`}>
      <span className={bold ? "" : "text-muted-foreground"}>{label}</span>
      <span className="text-right">{value}</span>
    </div>
  );
}
