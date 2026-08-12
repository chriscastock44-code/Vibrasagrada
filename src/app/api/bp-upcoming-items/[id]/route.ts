import { NextRequest, NextResponse } from "next/server";
import { updateBpUpcomingItem, deleteBpUpcomingItem } from "@/lib/bpUpcomingItems";
import { isAdminAuthenticated } from "@/lib/auth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();

  try {
    await updateBpUpcomingItem(Number(id), {
      imageUrl: body.imageUrl,
      title: body.title,
      description: body.description,
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error desconocido";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  await deleteBpUpcomingItem(Number(id));
  return NextResponse.json({ ok: true });
}
