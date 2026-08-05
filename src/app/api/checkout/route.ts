import { NextRequest, NextResponse } from "next/server";
import { getPreferenceClient } from "@/lib/mercadopago";
import { getProductById } from "@/lib/products";
import { createOrder, setOrderPreferenceId } from "@/lib/orders";
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

  const preferenceClient = getPreferenceClient();
  if (!preferenceClient) {
    // Payment gateway not configured yet — let the frontend show setup
    // instructions instead of a hard failure.
    return NextResponse.json(
      { error: "La pasarela de pago no está configurada todavía." },
      { status: 501 }
    );
  }

  const origin = request.nextUrl.origin;
  const isHttps = origin.startsWith("https://");

  try {
    const preference = await preferenceClient.create({
      body: {
        items: items.map((item) => {
          const product = getProductById(item.productId)!;
          const personalizationSummary = Object.entries(item.personalization || {})
            .map(([k, v]) => `${k}: ${v.startsWith("data:") ? "(archivo adjunto)" : v}`)
            .join(" · ");
          return {
            id: String(product.id),
            title: product.name,
            description: personalizationSummary || undefined,
            quantity: item.quantity,
            currency_id: product.currency,
            unit_price: product.priceCents / 100,
          };
        }),
        payer: customerEmail ? { email: customerEmail } : undefined,
        external_reference: String(orderId),
        back_urls: {
          success: `${origin}/tienda/checkout/gracias`,
          pending: `${origin}/tienda/checkout`,
          failure: `${origin}/tienda/checkout`,
        },
        // auto_return only works with https back_urls — Mercado Pago
        // rejects the preference otherwise, which matters for local dev.
        ...(isHttps ? { auto_return: "approved" as const } : {}),
        notification_url: `${origin}/api/mercadopago/webhook`,
      },
    });

    setOrderPreferenceId(orderId, preference.id!);

    return NextResponse.json({ url: preference.init_point });
  } catch (err) {
    console.error("Error al crear la preferencia de Mercado Pago:", err);
    return NextResponse.json(
      { error: "No se pudo iniciar el pago con Mercado Pago." },
      { status: 502 }
    );
  }
}
