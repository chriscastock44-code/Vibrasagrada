"use client";

import { useRouter } from "next/navigation";

export default function DeleteProductButton({ productId }: { productId: number }) {
  const router = useRouter();

  async function handleDelete() {
    if (!confirm("¿Eliminar este producto? Esta acción no se puede deshacer.")) return;
    await fetch(`/api/products/${productId}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <button
      onClick={handleDelete}
      className="ml-4 text-sm text-red-600 hover:underline"
    >
      Eliminar
    </button>
  );
}
