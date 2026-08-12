import { NextRequest, NextResponse } from "next/server";
import { getAllBpProductPhotos, createBpProductPhoto } from "@/lib/bpProductPhotos";
import { isAdminAuthenticated } from "@/lib/auth";

export async function GET() {
  const photos = await getAllBpProductPhotos();
  return NextResponse.json({ photos });
}

export async function POST(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await request.json();
  if (!body.imageUrl) {
    return NextResponse.json({ error: "Falta la imagen" }, { status: 400 });
  }

  try {
    const photo = await createBpProductPhoto({
      imageUrl: body.imageUrl,
      caption: body.caption || "",
      sortOrder: body.sortOrder,
    });
    return NextResponse.json({ photo }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error desconocido";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
