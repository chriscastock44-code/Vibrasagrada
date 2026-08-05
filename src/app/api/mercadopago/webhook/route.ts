import { NextRequest, NextResponse } from "next/server";
import { getPaymentClient } from "@/lib/mercadopago";
import { markOrderPaid } from "@/lib/orders";

/**
 * Mercado Pago notification webhook.
 *
 * Mercado Pago calls this endpoint (configured via `notification_url` when
 * creating the preference) whenever a payment's status changes. It sends
 * only an event id — we must fetch the real payment from the API to know
 * its status; never trust status values that might arrive in the body.
 *
 * For local development this URL isn't reachable from Mercado Pago's
 * servers (it's not public), so confirmation only works once deployed, or
 * via a tunnel like ngrok pointed at localhost. See README "Pagos".
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    const paymentId =
      body?.data?.id ||
      request.nextUrl.searchParams.get("data.id") ||
      request.nextUrl.searchParams.get("id");

    if (!paymentId) {
      return NextResponse.json({ received: true });
    }

    const paymentClient = getPaymentClient();
    if (!paymentClient) {
      return NextResponse.json({ received: true });
    }

    const payment = await paymentClient.get({ id: paymentId });

    if (payment.status === "approved" && payment.external_reference) {
      await markOrderPaid(payment.external_reference, String(payment.id));
    }
  } catch (err) {
    console.error("Error procesando webhook de Mercado Pago:", err);
    // Still return 200 so Mercado Pago doesn't hammer us with retries over
    // a bug on our side — errors are logged here for manual follow-up.
  }

  return NextResponse.json({ received: true });
}

// Mercado Pago may also ping this URL with a GET when validating the
// notification_url from the dashboard.
export async function GET() {
  return NextResponse.json({ ok: true });
}
