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
