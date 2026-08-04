import Stripe from "stripe";

let stripeClient: Stripe | null = null;

/**
 * Lazily creates the Stripe client. Returns null if STRIPE_SECRET_KEY is not
 * configured yet, so the store can still run locally before real payment
 * keys are added (see README "Pagos").
 */
export function getStripe(): Stripe | null {
  if (stripeClient) return stripeClient;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  stripeClient = new Stripe(key);
  return stripeClient;
}
