import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, Flame, Sparkles, Tag, Truck, Zap } from "lucide-react";
import { toast } from "sonner";
import { cart } from "@/lib/cart";
import { CATEGORIES, MENU } from "@/lib/menu";

function getPricing(price: number) {
  const compareAt = Math.ceil((price * 1.35) / 5) * 5;

  return {
    current: `${price}k`,
    compareAt: `${compareAt}k`,
  };
}

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Chau Ngoc Thao Fast Food - Crave it. Get it. Fast." },
      {
        name: "description",
        content: "Traditional food ordered fast with real-time order tracking.",
      },
      { property: "og:title", content: "Chau Ngoc Thao Fast Food" },
      {
        property: "og:description",
        content: "Traditional food ordered fast with real-time order tracking.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const trending = MENU.filter((m) => m.trending);

  return (
    <main>
      <section className="relative overflow-hidden bg-gradient-soft">
        <div className="absolute -right-32 -top-40 h-[480px] w-[480px] rounded-full bg-gradient-sun opacity-50 blur-3xl" />
        <div className="absolute -left-20 bottom-0 h-[300px] w-[300px] rounded-full bg-primary/30 opacity-50 blur-3xl" />
        <div className="relative mx-auto grid min-h-[calc(100svh-4rem)] max-w-6xl items-center gap-8 px-5 py-8 md:py-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10 lg:py-10">
          <div>
            <motion.span
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-background/80 px-3 py-1 text-xs font-bold uppercase tracking-wider text-muted-foreground backdrop-blur"
            >
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Authentic / Bold / Traditional
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="mt-4 text-4xl font-black leading-[0.98] tracking-tight sm:text-5xl md:text-6xl lg:text-[5.25rem]"
            >
              <span className="bg-gradient-sun bg-clip-text text-transparent">
                Traditional Taste
              </span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mt-4 max-w-xl text-base leading-8 text-muted-foreground md:text-lg"
            >
              Chau Ngoc Thao specializes in premium salt-baked chicken, traditional mixed salads,
              and authentic Vietnamese snacks delivered fresh with real-time order tracking.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="mt-6 flex flex-wrap gap-3"
            >
              <Link
                to="/menu"
                className="inline-flex items-center gap-2 rounded-2xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-glow transition hover:brightness-95"
              >
                Order Now <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/track"
                className="inline-flex items-center gap-2 rounded-2xl border border-border bg-background px-6 py-3 text-sm font-bold transition hover:bg-accent"
              >
                Track My Order
              </Link>
            </motion.div>

            <div className="mt-6 grid grid-cols-3 gap-3 text-sm">
              {[
                { icon: Zap, label: "20 min", sub: "Avg. delivery" },
                { icon: Flame, label: "100+", sub: "Daily orders" },
                { icon: Truck, label: "Free", sub: "Over 300k" },
              ].map((s) => (
                <div
                  key={s.label}
                  className="rounded-2xl border border-border bg-card p-3 shadow-card md:p-3.5"
                >
                  <s.icon className="h-4 w-4 text-primary md:h-5 md:w-5" />
                  <p className="mt-1 text-sm font-extrabold md:text-base">{s.label}</p>
                  <p className="text-xs text-muted-foreground">{s.sub}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[440px] lg:max-w-[500px]">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="relative overflow-hidden rounded-[2.5rem] border-4 border-white shadow-card"
            >
              <div className="absolute -inset-6 bg-gradient-sun opacity-20 blur-2xl" />

              <img
                src="https://aicdn.picsart.com/5b225474-2096-4ebd-97a8-463618589918.jpg"
                alt="Chau Ngoc Thao signature food"
                className="relative aspect-[5/4] w-full object-cover transition duration-500 hover:scale-105"
              />
            </motion.div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pt-16">
        <div className="mb-6">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Categories</p>
          <h2 className="mt-1 text-3xl font-extrabold md:text-4xl">Pick your craving</h2>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
          {CATEGORIES.map((c) => (
            <Link
              key={c.id}
              to="/menu"
              search={{ category: c.id }}
              className="group flex flex-col items-center justify-center gap-3 rounded-3xl border border-border bg-card p-6 text-center shadow-card transition-all hover:-translate-y-1 hover:border-primary hover:shadow-glow"
            >
              <span className="text-4xl transition duration-300 group-hover:scale-110">
                {c.emoji}
              </span>
              <p className="text-sm font-bold leading-tight">{c.label}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-16">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
              Trending now
            </p>
            <h2 className="mt-1 text-3xl font-extrabold md:text-4xl">Most-loved this week</h2>
          </div>
          <Link
            to="/menu"
            className="hidden text-sm font-bold text-foreground hover:underline md:inline"
          >
            See full menu
          </Link>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {trending.map((m, i) => {
            const pricing = getPricing(m.price);

            return (
              <motion.article
                key={m.id}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-card transition hover:-translate-y-1 hover:shadow-glow"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={m.image}
                    alt={m.name}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                  <div className="absolute left-3 top-3">
                    <span className="inline-flex items-center gap-1 rounded-full border border-white/35 bg-foreground/88 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-background backdrop-blur">
                      <Tag className="h-3.5 w-3.5" />
                      Special
                    </span>
                  </div>
                </div>
                <div className="flex flex-1 flex-col p-4 pb-3">
                  <div className="flex min-h-[114px] flex-1 flex-col">
                    <h3 className="text-base font-bold">{m.name}</h3>
                    <p className="mt-0.5 line-clamp-2 min-h-8 text-sm leading-7 text-muted-foreground">
                      {m.description}
                    </p>
                    <div className="mt-1.5 min-h-[58px] rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/12 via-background to-background px-2 py-1.5">
                      <p className="text-[8px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                        Featured Price
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
                  </div>
                  <button
                    onClick={() => {
                      cart.add(m);
                      toast.success(`${m.name} added`, { duration: 1500 });
                    }}
                    className="mt-2 w-full rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-card transition hover:brightness-95"
                  >
                    Add to Cart
                  </button>
                </div>
              </motion.article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
