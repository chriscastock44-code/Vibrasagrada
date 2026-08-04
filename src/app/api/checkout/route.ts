import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { getProductById } from "@/lib/products";
import { createOrder, setOrderStripeSession } from "@/lib/orders";
import type { CartItem } from "@/lib/types";

export async function POST(request: NextRequest) {
  const { items, customerEmail } = (await request.json()) as {
    items: CartItem[];
    customerEmail?: string;
  };

  if (!items || items.length === 0) {
    return NextResponse.json({ error: "El carrito está vacío" }, { status: 400 });
  }

  // Re-validate every item and its price against the database — never trust
  // prices sent from the client.
  let verifiedTotalCents = 0;
  const currency = items[0]?.currency || "MXN";

  for (const item of items) {
    const product = getProductById(item.productId);
    if (!product || !product.active) {
      return NextResponse.json(
        { error: `El producto "${item.name}" ya no está disponible.` },
        { status: 400 }
      );
    }
    verifiedTotalCents += product.priceCents * item.quantity;
  }

  const orderId = createOrder({
    items,
    customerEmail,
    totalCents: verifiedTotalCents,
    currency,
  });

  const stripe = getStripe();
  if (!stripe) {
    // Payment gateway not configured yet — let the frontend show setup
    // instructions instead of a hard failure.
    return NextResponse.json(
      { error: "La pasarela de pago no está configurada todavía." },
      { status: 501 }
    );
  }

  const origin = request.nextUrl.origin;

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: customerEmail || undefined,
    line_items: items.map((item) => {
      const product = getProductById(item.productId)!;
      const personalizationSummary = Object.entries(item.personalization || {})
        .map(([k, v]) => `${k}: ${v.startsWith("data:") ? "(archivo adjunto)" : v}`)
        .join(" · ");
      return {
        quantity: item.quantity,
        price_data: {
          currency: product.currency.toLowerCase(),
          unit_amount: product.priceCents,
          product_data: {
            name: product.name,
            description: personalizationSummary || undefined,
          },
        },
      };
    }),
    success_url: `${origin}/tienda/checkout/gracias`,
    cancel_url: `${origin}/tienda/checkout`,
    metadata: { orderId: String(orderId) },
  });

  setOrderStripeSession(orderId, session.id);

  return NextResponse.json({ url: session.url });
}
