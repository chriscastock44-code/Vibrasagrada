import { NextRequest, NextResponse } from "next/server";
import {
  getProductById,
  updateProduct,
  deleteProduct,
  setProductCatalogVisibility,
  friendlyDbError,
} from "@/lib/products";
import { isAdminAuthenticated } from "@/lib/auth";
import type { ProductInput } from "@/lib/types";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const product = await getProductById(Number(id));
  if (!product) {
    return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
  }
  return NextResponse.json({ product });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const body = (await request.json()) as ProductInput;

  try {
    const updated = await updateProduct(Number(id), body);
    if (!updated) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
    }
    return NextResponse.json({ product: updated });
  } catch (err) {
    return NextResponse.json({ error: friendlyDbError(err) }, { status: 400 });
  }
}

// Solo para el checkbox de /admin/catalogo — a propósito no reutiliza PUT
// (que exige el ProductInput completo) para no tener que mandar todo el
// producto solo para prender/apagar esta casilla.
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const body = (await request.json()) as { showInCatalog?: boolean };
  if (typeof body.showInCatalog !== "boolean") {
    return NextResponse.json({ error: "showInCatalog es requerido" }, { status: 400 });
  }

  await setProductCatalogVisibility(Number(id), body.showInCatalog);
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  await deleteProduct(Number(id));
  return NextResponse.json({ ok: true });
}
