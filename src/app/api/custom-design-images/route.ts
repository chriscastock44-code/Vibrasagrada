import { NextRequest, NextResponse } from "next/server";
import {
  getAllCustomDesignImages,
  createCustomDesignImage,
} from "@/lib/customDesignImages";
import { isAdminAuthenticated } from "@/lib/auth";

export async function GET() {
  const images = await getAllCustomDesignImages();
  return NextResponse.json({ images });
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
    const image = await createCustomDesignImage({
      imageUrl: body.imageUrl,
      sortOrder: body.sortOrder,
    });
    return NextResponse.json({ image }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error desconocido";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
