import { Outlet } from "react-router-dom";
import { BottomNav } from "@/components/layout/BottomNav";

export function Layout() {
  return (
    <>
      <main className="mx-auto min-h-screen max-w-2xl px-4 py-6">
        <Outlet />
      </main>
      <BottomNav />
      <footer className="pb-24 text-center text-xs text-ink-muted">
        <p>SpellRead is an independent educational tool. Bring your own book.</p>
        <p className="mt-1">
          Harry Potter names are trademarks of Warner Bros. and J.K. Rowling.
          Not affiliated or endorsed.
        </p>
      </footer>
    </>
  );
}
