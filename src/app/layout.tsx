import type { Metadata } from "next";
import { Lexend, Crimson_Pro } from "next/font/google";
import { AppProvider } from "@/context/AppContext";
import { BottomNav } from "@/components/layout/BottomNav";
import "./globals.css";

const lexend = Lexend({
  variable: "--font-lexend",
  subsets: ["latin"],
});

const crimson = Crimson_Pro({
  variable: "--font-crimson",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

export const metadata: Metadata = {
  title: "SpellRead — Master Every Chapter",
  description:
    "A reading companion for Harry Potter. Preview vocabulary, read your own book, and ace chapter quizzes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${lexend.variable} ${crimson.variable} h-full`}>
      <body className="min-h-full pb-20 antialiased">
        <AppProvider>
          <main className="mx-auto min-h-screen max-w-2xl px-4 py-6">{children}</main>
          <BottomNav />
        </AppProvider>
        <footer className="pb-24 text-center text-xs text-ink-muted">
          <p>
            SpellRead is an independent educational tool. Bring your own book.
          </p>
          <p className="mt-1">
            Harry Potter names are trademarks of Warner Bros. and J.K. Rowling.
            Not affiliated or endorsed.
          </p>
        </footer>
      </body>
    </html>
  );
}
