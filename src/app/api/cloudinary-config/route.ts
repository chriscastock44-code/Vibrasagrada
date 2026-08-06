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
 * que el "cloud name" y un "unsigned upload preset" sean públicos (van en
 * la URL de cada subida, cualquiera los puede ver).
 *
 * Por eso, y porque el panel de variables de entorno de Hostinger ha
 * resultado poco confiable para agregar variables nuevas, estos valores
 * también quedan como respaldo fijo aquí mismo. Si más adelante sí quedan
 * bien guardados en Hostinger como CLOUDINARY_CLOUD_NAME /
 * CLOUDINARY_UPLOAD_PRESET, esos tendrán prioridad automáticamente.
 */
const FALLBACK_CLOUD_NAME = "npru394v";
const FALLBACK_UPLOAD_PRESET = "npru394v";

export async function GET() {
  return NextResponse.json({
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || FALLBACK_CLOUD_NAME,
    uploadPreset: process.env.CLOUDINARY_UPLOAD_PRESET || FALLBACK_UPLOAD_PRESET,
  });
}
