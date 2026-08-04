"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AdminNav() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <header className="border-b border-black/10">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link href="/admin" className="font-semibold tracking-wide">
          Vobra Sagrada · Admin
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          <Link href="/admin/productos/nuevo" className="hover:opacity-70">
            + Nuevo producto
          </Link>
          <Link href="/tienda" target="_blank" className="hover:opacity-70">
            Ver tienda ↗
          </Link>
          <button onClick={handleLogout} className="hover:opacity-70">
            Cerrar sesión
          </button>
        </nav>
      </div>
    </header>
  );
}
