import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ShoppingCart, Tag } from "lucide-react";
import { toast } from "sonner";
import { cart } from "@/lib/cart";
import { CATEGORIES, MENU, type Category } from "@/lib/menu";

function getPricing(price: number) {
  const compareAt = Math.ceil((price * 1.35) / 5) * 5;

  return {
    current: `${price}k`,
    compareAt: `${compareAt}k`,
  };
}

export function MenuGrid({
  showFilter = true,
  initialCategory = "all",
}: {
  showFilter?: boolean;
  initialCategory?: Category | "all";
}) {
  const [active, setActive] = useState<Category | "all">(initialCategory);

  useEffect(() => {
    setActive(initialCategory);
  }, [initialCategory]);

  const items = active === "all" ? MENU : MENU.filter((m) => m.category === active);

  return (
    <div>
      {showFilter && (
        <div className="mb-4 flex flex-wrap gap-2 pb-1">
          <FilterChip active={active === "all"} onClick={() => setActive("all")}>
            All
          </FilterChip>
          {CATEGORIES.map((c) => (
            <FilterChip key={c.id} active={active === c.id} onClick={() => setActive(c.id)}>
              {c.emoji} {c.label}
            </FilterChip>
          ))}
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {items.map((m) => {
            const pricing = getPricing(m.price);

            return (
              <motion.article
                key={m.id}
                layout
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border/70 bg-card shadow-card transition hover:-translate-y-1 hover:shadow-glow"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={m.image}
                    alt={m.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                  <div className="absolute left-3 top-3">
                    <span className="inline-flex items-center gap-1 rounded-full border border-white/35 bg-foreground/88 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-background backdrop-blur">
                      <Tag className="h-3.5 w-3.5" />
                      Deal
                    </span>
                  </div>
                </div>

                <div className="flex flex-1 flex-col p-4 pb-3">
                  <div className="flex min-h-[114px] flex-1 flex-col">
                    <h3 className="line-clamp-1 text-base font-bold leading-[1.25]">{m.name}</h3>
                    <p className="mt-0.5 line-clamp-2 min-h-8 text-sm leading-7 text-muted-foreground">
                      {m.description}
                    </p>

                    <div className="mt-1.5 min-h-[58px] rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/12 via-background to-background px-2 py-1.5 shadow-sm">
                      <div className="flex items-end justify-between gap-3">
                        <div>
                          <p className="text-[8px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                            Promotional Price
                          </p>
                          <div className="mt-1 flex items-end gap-2">
                            <span className="text-[1.65rem] font-black leading-none text-primary">
                              {pricing.current}
                            </span>
                            <span className="pb-0.5 text-[0.9rem] font-semibold text-muted-foreground line-through">
                              {pricing.compareAt}
                            </span>
                          </div>
                        </div>
                        <span className="rounded-full bg-primary px-2 py-1 text-[8px] font-bold uppercase tracking-[0.12em] text-primary-foreground">
                          Save
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      cart.add(m);
                      toast.success(`${m.name} added`, { duration: 1500 });
                    }}
                    className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-card transition hover:brightness-95 active:scale-[0.98]"
                  >
                    <ShoppingCart className="h-4 w-4" /> Add to Cart
                  </button>
                </div>
              </motion.article>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition-all duration-300 ${
        active
          ? "scale-105 border-primary bg-primary text-primary-foreground shadow-glow"
          : "border-border bg-background text-foreground hover:bg-accent"
      }`}
    >
      {children}
    </button>
  );
}
