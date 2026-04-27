import { createFileRoute } from "@tanstack/react-router";
import { MenuGrid } from "@/components/MenuGrid";
import { QuickCart } from "@/components/QuickCart";
import type { Category } from "@/lib/menu";

type MenuSearch = {
  category?: Category | "all";
};

export const Route = createFileRoute("/menu")({
  validateSearch: (search: Record<string, unknown>): MenuSearch => {
    return {
      category: (search.category as Category) || "all",
    };
  },
  head: () => ({
    meta: [
      { title: "Menu - Chau Ngoc Thao" },
      { name: "description", content: "Premium salt-baked chicken and traditional snacks." },
    ],
  }),
  component: MenuPage,
});

function MenuPage() {
  const { category } = Route.useSearch();

  return (
    <main className="mx-auto max-w-7xl px-5 pb-10 pt-6">
      <header className="mb-5">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Full Menu</p>
        <h1 className="mt-1 text-2xl font-extrabold md:text-3xl">
          Traditional flavors, served fast
        </h1>
        <p className="mt-1 max-w-xl text-sm text-muted-foreground">
          Select a category, review the prices, and build your meal.
        </p>
      </header>

      <div className="flex flex-col gap-8 lg:flex-row">
        <div className="min-w-0 flex-1">
          <MenuGrid initialCategory={category} />
        </div>

        <aside className="hidden w-full lg:block lg:w-[320px]">
          <QuickCart />
        </aside>
      </div>
    </main>
  );
}
