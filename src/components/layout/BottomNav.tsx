
import { Link, useLocation } from "react-router-dom";

const NAV_ITEMS = [
  { href: "/", label: "Home", icon: "🏰" },
  { href: "/words", label: "Words", icon: "📖" },
  { href: "/review", label: "Review", icon: "✨" },
  { href: "/profile", label: "Me", icon: "🧙" },
];

export function BottomNav() {
  const { pathname } = useLocation();

  if (pathname.startsWith("/onboarding") || pathname.startsWith("/parent")) {
    return null;
  }

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t-2 border-gold/30 bg-parchment/95 backdrop-blur-sm"
      aria-label="Main navigation"
    >
      <div className="mx-auto flex max-w-lg justify-around px-2 py-2">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              to={item.href}
              className={`flex min-h-12 min-w-16 flex-col items-center justify-center rounded-xl px-3 py-1 text-sm font-medium transition-colors ${
                active
                  ? "bg-burgundy/10 text-burgundy"
                  : "text-ink-muted hover:bg-parchment-dark"
              }`}
              aria-current={active ? "page" : undefined}
            >
              <span className="text-xl" aria-hidden="true">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
