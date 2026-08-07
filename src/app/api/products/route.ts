import { NextRequest, NextResponse } from "next/server";
import { getAllProducts, createProduct, friendlyDbError } from "@/lib/products";
import { isAdminAuthenticated } from "@/lib/auth";
import type { ProductInput } from "@/lib/types";

export async function GET(request: NextRequest) {
  const onlyActive = request.nextUrl.searchParams.get("all") !== "1";
  const products = await getAllProducts({ onlyActive });
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
    const product = await createProduct(body);
    return NextResponse.json({ product }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: friendlyDbError(err) }, { status: 400 });
  }
}
