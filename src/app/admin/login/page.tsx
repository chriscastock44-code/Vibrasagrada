"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "No se pudo iniciar sesión.");
        return;
      }

      router.push("/admin");
      router.refresh();
    } catch {
      setError("Ocurrió un error de red.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-6">
      <Image
        src="/brand/icon.png"
        alt=""
        width={72}
        height={50}
        className="h-10 w-auto"
      />
      <h1 className="mt-4 font-heading text-xl font-extrabold">Acceso administrador</h1>
      <p className="mt-1 font-body text-sm text-black/60">Vibra Sagrada</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div>
          <label className="mb-1 block font-body text-sm font-semibold">Contraseña</label>
          <input
            type="password"
            required
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border-2 border-brand-black bg-white px-3 py-2 font-body text-sm focus:outline-none focus:ring-2 focus:ring-brand-yellow"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="btn-pop btn-pop-primary w-full py-3 text-sm disabled:opacity-50"
        >
          {loading ? "Ingresando…" : "Ingresar"}
        </button>
      </form>
    </div>
  );
}
