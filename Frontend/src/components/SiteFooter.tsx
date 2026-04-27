import { Link } from "@tanstack/react-router";
import { Clock3, MapPin, Phone } from "lucide-react";

const footerLinks = [
  { label: "Home", to: "/" },
  { label: "Menu", to: "/menu" },
  { label: "Track Order", to: "/track" },
  { label: "Checkout", to: "/checkout" },
];

export function SiteFooter() {
  return (
    <footer className="relative mt-20 overflow-hidden border-t border-border/70 bg-gradient-soft">
      {/* Background effects */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-sun opacity-70" />
      <div className="absolute -right-20 bottom-0 h-48 w-48 rounded-full bg-primary/20 blur-3xl" />
      <div className="absolute -left-16 top-10 h-40 w-40 rounded-full bg-primary/15 blur-3xl" />

      <div className="relative mx-auto grid max-w-6xl gap-10 px-5 py-14 md:grid-cols-[1.2fr_0.8fr_0.9fr]">
        {/* Brand */}
        <div className="max-w-md">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-sun shadow-glow">
              <img
                src="/logo.png"
                alt="Chau Ngoc Thao logo"
                className="h-full w-full scale-[2.6] object-contain"
              />
            </span>
            <div>
              <p className="font-brand text-base font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                Chau Ngoc Thao
              </p>
              <p className="text-lg font-extrabold text-foreground">Salt-Baked Chicken</p>
            </div>
          </div>

          <p className="mt-4 text-sm leading-7 text-muted-foreground">
            Fast, crave-worthy comfort food with smooth ordering, live delivery tracking, and a menu
            built for late-night cravings.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/menu"
              className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-card transition hover:brightness-95"
            >
              Order online
            </Link>
            <Link
              to="/track"
              className="inline-flex items-center justify-center rounded-full border border-border bg-background px-5 py-2.5 text-sm font-bold text-foreground transition hover:bg-accent"
            >
              Track delivery
            </Link>
          </div>
        </div>

        {/* Explore */}
        <div>
          <p className="text-sm font-extrabold uppercase tracking-[0.16em] text-foreground">
            Explore
          </p>
          <div className="mt-4 grid gap-3">
            {footerLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-sm text-muted-foreground transition hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Contact */}
        <div>
          <p className="text-sm font-extrabold uppercase tracking-[0.16em] text-foreground">
            Visit us
          </p>
          <div className="mt-4 space-y-4 text-sm text-muted-foreground">
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-4 w-4 text-primary" />
              <p>123 Nguyen Hue, District 1, Ho Chi Minh City</p>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="mt-0.5 h-4 w-4 text-primary" />
              <p>+84 28 1234 5678</p>
            </div>
            <div className="flex items-start gap-3">
              <Clock3 className="mt-0.5 h-4 w-4 text-primary" />
              <p>Open daily: 10:00 AM - 10:30 PM</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="relative border-t border-border/70">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-5 py-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Chau Ngoc Thao Vietnamese Kitchen. Fresh food, fast delivery.</p>
          <p>Online ordering • Real-time tracking • Pickup available</p>
        </div>
      </div>
    </footer>
  );
}
