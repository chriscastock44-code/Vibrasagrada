import { NextRequest, NextResponse } from "next/server";
import { verifyAdminPassword, createAdminSession, setAdminSessionCookie } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const { password } = await request.json();

  if (!password) {
    return NextResponse.json({ error: "Falta la contraseña" }, { status: 400 });
  }

  let valid: boolean;
  try {
    valid = await verifyAdminPassword(password);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error de configuración";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  if (!valid) {
    return NextResponse.json({ error: "Contraseña incorrecta" }, { status: 401 });
  }

  const token = await createAdminSession();
  await setAdminSessionCookie(token);

  return NextResponse.json({ ok: true });
}
