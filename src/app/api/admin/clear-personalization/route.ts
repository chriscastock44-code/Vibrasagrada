import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { db, ready } from "@/lib/db";

/**
 * Acción de una sola vez: las piezas de Vibra Sagrada son 1 de 1 y no se
 * personalizan, así que esto vacía el campo personalizationFields de TODOS
 * los productos existentes. No afecta productos nuevos que se creen
 * después con sus propios campos si algún día se necesita.
 */
export async function POST() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  await ready;
  const result = await db.execute(
    "UPDATE products SET personalizationFields = '[]', updatedAt = datetime('now')"
  );

  return NextResponse.json({ ok: true, updated: result.rowsAffected });
}
