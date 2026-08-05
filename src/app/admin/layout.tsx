import type { Metadata } from "next";
import type { ReactNode } from "react";
import "@fontsource/baloo-2/700.css";
import "@fontsource/baloo-2/800.css";
import "@fontsource/poppins/400.css";
import "@fontsource/poppins/500.css";
import "@fontsource/poppins/600.css";
import "../globals.css";

export const metadata: Metadata = {
  title: "Admin — Vibra Sagrada",
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full bg-brand-cream font-body">{children}</body>
    </html>
  );
}
