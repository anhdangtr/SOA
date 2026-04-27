import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, MapPinned, ShoppingBag, TicketPercent } from "lucide-react";
import { toast } from "sonner";
import {
  cart,
  cartTotals,
  cartTotalsFromLines,
  formatPrice,
  reviewCartSelectedLines,
  reviewCartSelection,
  useCart,
} from "@/lib/cart";
import { createOrder } from "@/services/order/order.api";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout - Chau Ngoc Thao" },
      { name: "description", content: "Complete delivery details and choose how to place the order." },
    ],
  }),
  component: CheckoutPage,
});

const SHIPPING_FEE = 25;

const PROVINCES = [
  "An Giang",
  "Ba Ria - Vung Tau",
  "Bac Giang",
  "Bac Kan",
  "Bac Lieu",
  "Bac Ninh",
  "Ben Tre",
  "Binh Duong",
  "Binh Dinh",
  "Binh Phuoc",
  "Binh Thuan",
  "Ca Mau",
  "Can Tho",
  "Cao Bang",
  "Da Nang",
  "Dak Lak",
  "Dak Nong",
  "Dien Bien",
  "Dong Nai",
  "Dong Thap",
  "Gia Lai",
  "Ha Giang",
  "Ha Nam",
  "Ha Noi",
  "Ha Tinh",
  "Hai Duong",
  "Hai Phong",
  "Hau Giang",
  "Hoa Binh",
  "Hung Yen",
  "Khanh Hoa",
  "Kien Giang",
  "Kon Tum",
  "Lai Chau",
  "Lam Dong",
  "Lang Son",
  "Lao Cai",
  "Long An",
  "Nam Dinh",
  "Nghe An",
  "Ninh Binh",
  "Ninh Thuan",
  "Phu Tho",
  "Phu Yen",
  "Quang Binh",
  "Quang Nam",
  "Quang Ngai",
  "Quang Ninh",
  "Quang Tri",
  "Soc Trang",
  "Son La",
  "Tay Ninh",
  "Thai Binh",
  "Thai Nguyen",
  "Thanh Hoa",
  "Thua Thien Hue",
  "Tien Giang",
  "Ho Chi Minh City",
  "Tra Vinh",
  "Tuyen Quang",
  "Vinh Long",
  "Vinh Phuc",
  "Yen Bai",
];

const PROMO_RULES: Record<string, { label: string; discount: number }> = {
  WELCOME10: { label: "Welcome discount", discount: 10 },
  SUNNY15: { label: "Sunshine combo", discount: 15 },
  SHIPFREE: { label: "Free shipping", discount: SHIPPING_FEE },
};

function CheckoutPage() {
  const cartState = useCart();
  const reviewCartLines = reviewCartSelectedLines(cartState);
  const { count: cartCount } = cartTotals(cartState);
  const { lines, count, total } = cartTotalsFromLines(reviewCartLines);
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [province, setProvince] = useState(PROVINCES[57]);
  const [ward, setWard] = useState("");
  const [houseNumber, setHouseNumber] = useState("");
  const [note, setNote] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [processing, setProcessing] = useState(false);

  const wardOptions = buildWardOptions(province);
  const normalizedPromo = promoCode.trim().toUpperCase();
  const promoRule = PROMO_RULES[normalizedPromo];
  const discountAmount = promoRule?.discount ?? 0;
  const grandTotal = Math.max(0, total + SHIPPING_FEE - discountAmount);

  useEffect(() => {
    if (!wardOptions.includes(ward)) {
      setWard(wardOptions[0]);
    }
  }, [province, ward, wardOptions]);

  if (cartCount === 0 && !processing) {
    return (
      <main className="mx-auto max-w-3xl px-5 py-20 text-center">
        <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground" />
        <h1 className="mt-4 text-3xl font-extrabold">Your cart is empty</h1>
        <p className="mt-2 text-muted-foreground">Add a few favorites before checking out.</p>
        <button
          onClick={() => navigate({ to: "/menu" })}
          className="mt-6 rounded-2xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-glow"
        >
          Browse menu
        </button>
      </main>
    );
  }

  if (count === 0 && !processing) {
    return (
      <main className="mx-auto max-w-3xl px-5 py-20 text-center">
        <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground" />
        <h1 className="mt-4 text-3xl font-extrabold">No items selected yet</h1>
        <p className="mt-2 text-muted-foreground">
          Choose the products you want to place an order for in Review Cart before continuing.
        </p>
        <button
          onClick={() => navigate({ to: "/reviewcart" })}
          className="mt-6 rounded-2xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-glow"
        >
          Go to Review Cart
        </button>
      </main>
    );
  }

  const validateCheckout = () => {
    if (!fullName || !phone || !province || !ward || !houseNumber) {
      toast.error("Please complete all required customer details.");
      return false;
    }

    return true;
  };

  const handleContinue = async () => {
    if (!validateCheckout()) {
      return;
    }

    try {
      setProcessing(true);

      const order = await createOrder({
        customer: {
          name: fullName,
          phone,
          province,
          ward,
          houseNumber,
          note: note.trim() || undefined,
        },
        lines,
        paymentMethod: "pending",
        shippingFee: SHIPPING_FEE,
        promoCode: normalizedPromo || undefined,
        discountAmount,
      });

      cart.removeMany(reviewCartSelection.getSelectedIds());
      toast.success("Order created. Continue to the payment method page.");
      navigate({ to: "/payment/$orderId", params: { orderId: order.id } });
    } catch (error) {
      console.error(error);
      toast.error("Unable to create your order right now.");
      setProcessing(false);
    }
  };

  if (processing) {
    return (
      <main className="mx-auto mt-32 flex max-w-md flex-col items-center gap-4 px-5 text-center">
        <CheckCircle2 className="h-10 w-10 text-primary" />
        <p className="text-lg font-bold">Creating your order...</p>
        <p className="text-sm text-muted-foreground">
          We are saving your delivery details before moving to payment.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-5 py-10 pb-16">
      <header className="mb-8">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Checkout</p>
        <h1 className="mt-1 text-4xl font-extrabold">Confirm delivery and place the order</h1>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
          Complete delivery details and choose how to place the order.
        </p>
      </header>

      <div className="space-y-6">
        <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card
            badge="Part 1"
            title="Order summary"
            description="Review the selected products and final amount before placing the order."
          >
            <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
              <div className="space-y-3">
                {lines.map((line) => (
                  <div
                    key={line.item.id}
                    className="flex items-center gap-3 rounded-2xl border border-border bg-background p-3"
                  >
                    <img
                      src={line.item.image}
                      alt={line.item.name}
                      className="h-16 w-16 rounded-xl object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-1 text-sm font-bold">{line.item.name}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Quantity: {line.qty} · Unit price: {formatPrice(line.item.price)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                        Line total
                      </p>
                      <p className="text-sm font-bold">{formatPrice(line.qty * line.item.price)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="rounded-3xl bg-gradient-soft p-5">
                <div className="rounded-2xl border border-primary/20 bg-card p-5 shadow-card">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    <p className="text-sm font-bold">Checkout snapshot</p>
                  </div>
                  <div className="mt-5 space-y-3 text-sm">
                    <PriceRow label="Items" value={`${count} products`} />
                    <PriceRow label="Subtotal" value={formatPrice(total)} />
                    <PriceRow label="Shipping fee" value={formatPrice(SHIPPING_FEE)} />
                    <PriceRow
                      label="Promo discount"
                      value={discountAmount > 0 ? `- ${formatPrice(discountAmount)}` : formatPrice(0)}
                    />
                  </div>
                  <div className="mt-4 rounded-2xl bg-primary/15 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                          Total payment
                        </p>
                        <p className="mt-1 text-3xl font-extrabold">{formatPrice(grandTotal)}</p>
                      </div>
                      <ShoppingBag className="h-10 w-10 text-primary" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <Card
            badge="Part 2"
            title="Delivery details"
            description="Customer and delivery information are completed here before the order is created."
          >
            <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
              <div className="space-y-6">
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field
                    label="Full name"
                    value={fullName}
                    onChange={setFullName}
                    placeholder="Nguyen Van A"
                  />
                  <Field
                    label="Phone number"
                    value={phone}
                    onChange={setPhone}
                    placeholder="0901234567"
                  />
                  <SelectField
                    label="Province / City"
                    value={province}
                    options={PROVINCES}
                    onChange={(value) => setProvince(value)}
                  />
                  <SelectField
                    label="Ward / Commune"
                    value={ward}
                    options={wardOptions}
                    onChange={setWard}
                  />
                  <Field
                    label="House number"
                    value={houseNumber}
                    onChange={setHouseNumber}
                    placeholder="12B Le Loi Street"
                  />
                  <Field
                    label="Promo code"
                    value={promoCode}
                    onChange={setPromoCode}
                    placeholder="WELCOME10"
                  />
                </div>

                <div className="grid gap-3 sm:grid-cols-[1fr_260px]">
                  <TextAreaField
                    label="Additional request"
                    value={note}
                    onChange={setNote}
                    placeholder="Less spicy, call before arrival, leave at reception..."
                  />

                  <div className="rounded-2xl border border-dashed border-primary/20 bg-primary/10 p-4">
                    <div className="flex items-center gap-2">
                      <TicketPercent className="h-4 w-4 text-primary" />
                      <p className="text-sm font-bold">Demo promo codes</p>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      `WELCOME10` saves 10k, `SUNNY15` saves 15k, `SHIPFREE` removes the shipping fee.
                    </p>
                    <p className="mt-2 text-xs font-semibold text-foreground/70">
                      {promoRule
                        ? `${promoRule.label} applied: -${formatPrice(discountAmount)}`
                        : normalizedPromo
                          ? "This code is not available in the UI demo."
                          : "Enter a code to preview the discount instantly."}
                    </p>
                  </div>
                </div>
              </div>

              <aside className="h-fit rounded-3xl bg-gradient-soft p-5">
                <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
                  <div className="flex items-start gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-primary">
                      <MapPinned className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-sm font-bold">Delivery destination</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {[houseNumber, ward, province].filter(Boolean).join(", ") || "Choose an address"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 space-y-2 border-t border-border pt-4 text-sm">
                    <PriceRow label="Subtotal" value={formatPrice(total)} />
                    <PriceRow label="Shipping" value={formatPrice(SHIPPING_FEE)} />
                    <PriceRow
                      label="Discount"
                      value={discountAmount > 0 ? `- ${formatPrice(discountAmount)}` : formatPrice(0)}
                    />
                  </div>

                  <div className="mt-5 rounded-2xl bg-primary/10 p-4 text-sm">
                    <p className="font-bold">Please check the information</p>
                    <p className="mt-1 text-muted-foreground">
                      If correct, click Continue to place the order. You will have a chance to review the order summary again before confirming payment.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => navigate({ to: "/menu" })}
                    className="mt-4 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm font-bold transition hover:bg-accent"
                  >
                    Back to menu
                  </button>
                </div>
              </aside>
            </div>
          </Card>
        </motion.section>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleContinue}
            className="inline-flex items-center gap-2 rounded-2xl bg-primary px-8 py-3 text-sm font-bold text-primary-foreground shadow-glow transition hover:brightness-95 active:scale-[0.98]"
          >
            Continue
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </main>
  );
}

function buildWardOptions(province: string) {
  return [
    `${province} Central Ward`,
    `${province} Riverside Ward`,
    `${province} Market Quarter`,
    `${province} Garden Commune`,
  ];
}

function Card({
  badge,
  title,
  description,
  children,
}: {
  badge: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-3xl border border-border bg-card shadow-card">
      <div className="bg-gradient-sun p-6">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-foreground/60">{badge}</p>
        <h2 className="mt-2 text-3xl font-extrabold text-foreground">{title}</h2>
        <p className="mt-2 max-w-3xl text-sm text-foreground/80">{description}</p>
      </div>
      <div className="p-6">{children}</div>
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
  onChange: (value: string) => void;
  placeholder?: string;
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
        className="mt-1 w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
      />
    </label>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="mt-1 min-h-[114px] w-full rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
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
