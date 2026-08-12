import { NextRequest, NextResponse } from "next/server";
import { deleteBpProductPhoto } from "@/lib/bpProductPhotos";
import { isAdminAuthenticated } from "@/lib/auth";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  await deleteBpProductPhoto(Number(id));
  return NextResponse.json({ ok: true });
}
