import { NextRequest, NextResponse } from "next/server";

/**
 * TEMPORARY diagnostic endpoint — DELETE once los pagos reales estén
 * confirmados funcionando.
 *
 * Nunca expone el access token completo, solo si está presente y su forma
 * (largo, prefijo). Sirve para confirmar rápido si Hostinger guardó la
 * variable de entorno MERCADOPAGO_ACCESS_TOKEN, sin tener que pegar el
 * token real en el chat ni arriesgarlo.
 *
 * Uso: GET /api/admin/debug-mercadopago?key=vibra-debug
 */
export async function GET(request: NextRequest) {
  const key = request.nextUrl.searchParams.get("key");
  if (key !== "vibra-debug") {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  const token = process.env.MERCADOPAGO_ACCESS_TOKEN;

  if (!token) {
    return NextResponse.json({
      tokenPresent: false,
      message: "MERCADOPAGO_ACCESS_TOKEN no está definida en producción.",
      serverUptimeSeconds: Math.round(process.uptime()),
    });
  }

  return NextResponse.json({
    tokenPresent: true,
    tokenLength: token.length,
    // Los access tokens de Mercado Pago empiezan con "APP_USR-" (producción)
    // o "TEST-" (prueba) — este prefijo no es secreto, es lo que confirma
    // si quedó guardado el de producción o el de prueba.
    tokenPrefix: token.slice(0, 8),
    looksLikeProductionToken: token.startsWith("APP_USR-"),
    looksLikeTestToken: token.startsWith("TEST-"),
    containsWhitespace: /\s/.test(token),
    serverUptimeSeconds: Math.round(process.uptime()),
    serverBootedAt: new Date(Date.now() - process.uptime() * 1000).toISOString(),
  });
}
