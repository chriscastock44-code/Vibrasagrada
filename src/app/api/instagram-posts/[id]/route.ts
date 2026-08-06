import { NextRequest, NextResponse } from "next/server";
import { deleteInstagramPost } from "@/lib/instagramPosts";
import { isAdminAuthenticated } from "@/lib/auth";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  await deleteInstagramPost(Number(id));
  return NextResponse.json({ ok: true });
}
