import type { ReactNode } from "react";
import "@fontsource/baloo-2/600.css";
import "@fontsource/baloo-2/700.css";
import "@fontsource/baloo-2/800.css";
import "@fontsource/poppins/400.css";
import "@fontsource/poppins/500.css";
import "@fontsource/poppins/600.css";
import "@fontsource/poppins/700.css";
import "../globals.css";
import { CartProvider } from "@/components/CartContext";
import Header from "@/components/Header";
import BpFooter from "@/components/BpFooter";

// Layout raíz propio (con su <html>/<body>), fuera del grupo de rutas
// (site) — igual que /admin tiene el suyo — para poder darle a esta landing
// su propio footer (BpFooter) en vez del Footer de Vibra Sagrada (que trae
// el carrusel "Síguenos en Instagram" de Vibra Sagrada, que aquí no
// corresponde). El Header sí se reutiliza tal cual del resto del sitio, y
// por eso sigue haciendo falta el CartProvider (el Header lee el conteo del
// carrito para el link "Carrito").
export default function BarksAndPawsLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <CartProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <BpFooter />
        </CartProvider>
      </body>
    </html>
  );
}
