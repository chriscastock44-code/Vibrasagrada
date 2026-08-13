"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function AdminNav() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <header className="border-b-2 border-brand-black bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link href="/admin" className="flex items-center gap-2">
          <Image
            src="/brand/icon.png"
            alt=""
            width={32}
            height={22}
            className="h-6 w-auto"
          />
          <span className="font-heading font-extrabold tracking-tight">
            vibra sagrada · admin
          </span>
        </Link>
        <nav className="flex items-center gap-6 font-body text-sm font-medium">
          <Link href="/admin/productos/nuevo" className="hover:text-brand-navy">
            + Nuevo producto
          </Link>
          <Link href="/admin/instagram" className="hover:text-brand-navy">
            Instagram
          </Link>
          <Link href="/admin/disenos-personalizados" className="hover:text-brand-navy">
            Diseños personalizados
          </Link>
          <Link href="/admin/barks-and-paws" className="hover:text-brand-navy">
            Barks &amp; Paws
          </Link>
          <Link href="/admin/catalogo" className="hover:text-brand-navy">
            Catálogo
          </Link>
          <Link href="/tienda" target="_blank" className="hover:text-brand-navy">
            Ver tienda ↗
          </Link>
          <button onClick={handleLogout} className="hover:text-brand-pink">
            Cerrar sesión
          </button>
        </nav>
      </div>
    </header>
  );
}
