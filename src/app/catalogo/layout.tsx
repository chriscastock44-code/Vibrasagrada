import type { Metadata } from "next";
import type { ReactNode } from "react";
import "@fontsource/baloo-2/600.css";
import "@fontsource/baloo-2/700.css";
import "@fontsource/baloo-2/800.css";
import "@fontsource/poppins/400.css";
import "@fontsource/poppins/500.css";
import "@fontsource/poppins/600.css";
import "@fontsource/poppins/700.css";
import "../globals.css";

// Catálogo privado: no aparece en ningún menú ni link del sitio, y
// robots.index=false lo mantiene fuera de buscadores — la única forma de
// llegar es teniendo el link directo. Por eso vive en su propio layout
// raíz (como /admin), sin el Header/Footer de la tienda: no tiene sentido
// mostrar "Tienda"/"Carrito" ni el carrusel de Instagram en un documento
// que es solo para ver, no para comprar.
export const metadata: Metadata = {
  title: "Catálogo — Vibra Sagrada",
  robots: { index: false, follow: false },
};

export default function CatalogoRootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full bg-brand-cream font-body">{children}</body>
    </html>
  );
}
