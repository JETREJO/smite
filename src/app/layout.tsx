import type { Metadata } from "next";
import { Montserrat, Roboto } from "next/font/google";
import Script from "next/script";

import { AppHeader } from "@/components/layout/AppHeader";
import { AppToaster } from "@/components/ui/AppToaster";
import { TAILWIND_CDN_URL, TAILWIND_THEME } from "@/config/tailwind-theme";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
});

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "SMITE 2 Builds",
  description: "Base de datos de dioses, items y builds de SMITE 2.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${montserrat.variable} ${roboto.variable} bg-canvas`}>
      <head>
        <style type="text/tailwindcss">{TAILWIND_THEME}</style>
      </head>
      <body className="min-h-screen bg-canvas font-sans text-fg antialiased">
        <AppHeader />
        <main className="mx-auto max-w-5xl px-4 py-10">{children}</main>
        <AppToaster />
        <Script src={TAILWIND_CDN_URL} strategy="beforeInteractive" />
      </body>
    </html>
  );
}
