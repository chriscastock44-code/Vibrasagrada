import { NextResponse } from "next/server";

/**
 * Entrega la configuración pública de Cloudinary (cloud name + upload
 * preset) al navegador en tiempo real, en vez de depender de que el proceso
 * de build de Hostinger tenga acceso a variables NEXT_PUBLIC_* (no lo
 * tiene — esas se "hornean" en el bundle durante `next build`, y el panel
 * de variables de entorno de Hostinger solo las inyecta en tiempo de
 * ejecución). Leer esto vía process.env aquí sí funciona en tiempo real,
 * igual que ADMIN_PASSWORD_HASH y las variables de Turso.
 *
 * Ninguno de estos dos valores es secreto: Cloudinary está diseñado para
 * que el "cloud name" y un "unsigned upload preset" sean públicos.
 */
export async function GET() {
  return NextResponse.json({
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || null,
    uploadPreset: process.env.CLOUDINARY_UPLOAD_PRESET || null,
  });
}
