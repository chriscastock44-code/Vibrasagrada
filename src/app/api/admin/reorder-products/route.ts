import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { reorderProducts } from "@/lib/products";

// Guarda el orden manual (arrastrar y soltar) de los productos en /admin.
// Recibe la lista completa de ids en el orden final deseado.
export async function POST(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = (await request.json()) as { ids?: number[] };
  if (!Array.isArray(body.ids) || body.ids.some((id) => typeof id !== "number")) {
    return NextResponse.json({ error: "Se esperaba una lista de ids." }, { status: 400 });
  }

  await reorderProducts(body.ids);
  return NextResponse.json({ ok: true });
}
