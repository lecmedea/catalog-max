import { Suspense } from "react";
import type { Metadata } from "next";
import localFont from "next/font/local";
import { Chicks } from "@/components/chicks";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { currentSession } from "@/lib/auth";
import "./globals.css";

const sourceSans = localFont({
  src: "./fonts/SourceSans3.ttf",
  weight: "200 900",
  display: "swap",
  variable: "--font-source-sans",
});

export const metadata: Metadata = {
  title: "Каталог каналов MAX",
  description: "Catalog MAX — библиотека каналов мессенджера MAX: поиск, категории и карточки после модерации.",
};

async function SessionHeader() {
  const session = await currentSession();
  return <Header profile={session?.profile ?? null} />;
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={sourceSans.variable}>
      <body style={{ fontFamily: "var(--font-source-sans), 'Source Sans 3', 'Source Sans Pro', sans-serif" }}>
        <Suspense fallback={null}><Chicks /></Suspense>
        <Suspense fallback={<Header profile={null} />}>
          <SessionHeader />
        </Suspense>
        <main className="shell">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
