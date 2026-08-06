import { NextRequest, NextResponse } from "next/server";
import { getAllInstagramPosts, createInstagramPost } from "@/lib/instagramPosts";
import { isAdminAuthenticated } from "@/lib/auth";

export async function GET() {
  const posts = await getAllInstagramPosts();
  return NextResponse.json({ posts });
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
    const post = await createInstagramPost({
      imageUrl: body.imageUrl,
      link: body.link,
      sortOrder: body.sortOrder,
    });
    return NextResponse.json({ post }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error desconocido";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
