import { MercadoPagoConfig, Preference, Payment } from "mercadopago";

let config: MercadoPagoConfig | null = null;

/**
 * Lazily creates the Mercado Pago SDK config. Returns null if
 * MERCADOPAGO_ACCESS_TOKEN is not configured yet, so the store can still run
 * locally before real payment credentials are added (see README "Pagos").
 */
function getConfig(): MercadoPagoConfig | null {
  if (config) return config;
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!accessToken) return null;
  config = new MercadoPagoConfig({ accessToken });
  return config;
}

export function getPreferenceClient(): Preference | null {
  const cfg = getConfig();
  if (!cfg) return null;
  return new Preference(cfg);
}

export function getPaymentClient(): Payment | null {
  const cfg = getConfig();
  if (!cfg) return null;
  return new Payment(cfg);
}

export type PreferenceDiagnosticsResult =
  | { ok: true; id: string; initPoint: string; xRequestId: string | null }
  | { ok: false; status: number; xRequestId: string | null; body: unknown };

/**
 * Crea una preferencia de Checkout Pro llamando directamente a la API REST
 * de Mercado Pago, en vez de usar `Preference.create()` del SDK.
 *
 * Motivo: cuando la API responde con error (por ejemplo el "At least one
 * policy returned UNAUTHORIZED" del ticket WCS-45163), el SDK oficial arma
 * su excepción solo a partir del body de la respuesta y descarta los
 * headers — así que el header `x-request-id`, que es justo lo que soporte
 * de Mercado Pago pide para investigar el error, se pierde y nunca llega a
 * nuestro catch. Haciendo el fetch nosotros mismos sí podemos leerlo, tanto
 * en éxito como en error, y devolverlo para poder mandárselo a soporte.
 */
export async function createPreferenceWithDiagnostics(
  body: Record<string, unknown>
): Promise<PreferenceDiagnosticsResult> {
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!accessToken) {
    throw new Error("MERCADOPAGO_ACCESS_TOKEN no está configurada.");
  }

  const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(body),
  });

  const xRequestId = response.headers.get("x-request-id");
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    return { ok: false, status: response.status, xRequestId, body: data };
  }

  return { ok: true, id: data.id, initPoint: data.init_point, xRequestId };
}
