"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ClearPersonalizationButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    if (
      !confirm(
        "¿Quitar los campos de personalización de TODOS los productos? Esto no se puede deshacer."
      )
    )
      return;

    setLoading(true);
    try {
      await fetch("/api/admin/clear-personalization", { method: "POST" });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="font-body text-sm font-semibold underline hover:text-brand-navy disabled:opacity-50"
    >
      {loading ? "Quitando…" : "Quitar personalización de todos los productos"}
    </button>
  );
}
