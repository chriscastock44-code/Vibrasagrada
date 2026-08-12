import { NextRequest, NextResponse } from "next/server";
import { getAllBpUpcomingItems, createBpUpcomingItem } from "@/lib/bpUpcomingItems";
import { isAdminAuthenticated } from "@/lib/auth";

export async function GET() {
  const items = await getAllBpUpcomingItems();
  return NextResponse.json({ items });
}

export async function POST(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await request.json();
  if (!body.title) {
    return NextResponse.json({ error: "Falta el título" }, { status: 400 });
  }

  try {
    const item = await createBpUpcomingItem({
      imageUrl: body.imageUrl || "",
      title: body.title,
      description: body.description || "",
      sortOrder: body.sortOrder,
    });
    return NextResponse.json({ item }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error desconocido";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
