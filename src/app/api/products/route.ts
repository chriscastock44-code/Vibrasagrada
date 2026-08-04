import { NextRequest, NextResponse } from "next/server";
import { getAllProducts, createProduct } from "@/lib/products";
import { isAdminAuthenticated } from "@/lib/auth";
import type { ProductInput } from "@/lib/types";

export async function GET(request: NextRequest) {
  const onlyActive = request.nextUrl.searchParams.get("all") !== "1";
  const products = getAllProducts({ onlyActive });
  return NextResponse.json({ products });
}

export async function POST(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = (await request.json()) as ProductInput;

  if (!body.slug || !body.name || body.priceCents == null) {
    return NextResponse.json(
      { error: "Faltan campos requeridos: slug, name, priceCents" },
      { status: 400 }
    );
  }

  try {
    const product = createProduct(body);
    return NextResponse.json({ product }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error desconocido";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
