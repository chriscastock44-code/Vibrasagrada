import { NextRequest, NextResponse } from "next/server";
import { createPreferenceWithDiagnostics } from "@/lib/mercadopago";
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
  // prices sent from the client. Products are looked up once here and reused
  // below when building the Mercado Pago items, instead of querying again.
  let verifiedTotalCents = 0;
  const currency = items[0]?.currency || "MXN";
  const productsById = new Map<number, Awaited<ReturnType<typeof getProductById>>>();

  for (const item of items) {
    const product = await getProductById(item.productId);
    if (!product || !product.active) {
      return NextResponse.json(
        { error: `El producto "${item.name}" ya no está disponible.` },
        { status: 400 }
      );
    }
    productsById.set(item.productId, product);
    verifiedTotalCents += product.priceCents * item.quantity;
  }

  const orderId = await createOrder({
    items,
    customerEmail,
    totalCents: verifiedTotalCents,
    currency,
  });

  if (!process.env.MERCADOPAGO_ACCESS_TOKEN) {
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
    const result = await createPreferenceWithDiagnostics({
      items: items.map((item) => {
        const product = productsById.get(item.productId)!;
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
    });

    if (!result.ok) {
      // TEMPORAL — mientras se resuelve el ticket WCS-45163 con soporte de
      // Mercado Pago, exponemos el x-request-id y el detalle del error en
      // la respuesta para poder capturarlos desde la pestaña Network del
      // navegador sin necesitar acceso a los logs del servidor en
      // Hostinger. Quitar este detalle extra una vez resuelto el ticket.
      console.error("Error al crear la preferencia de Mercado Pago:", {
        status: result.status,
        xRequestId: result.xRequestId,
        body: result.body,
      });
      return NextResponse.json(
        {
          error: "No se pudo iniciar el pago con Mercado Pago.",
          mercadoPagoDebug: {
            status: result.status,
            xRequestId: result.xRequestId,
            detail: result.body,
          },
        },
        { status: 502 }
      );
    }

    await setOrderPreferenceId(orderId, result.id);

    return NextResponse.json({ url: result.initPoint });
  } catch (err) {
    console.error("Error al crear la preferencia de Mercado Pago:", err);
    return NextResponse.json(
      { error: "No se pudo iniciar el pago con Mercado Pago." },
      { status: 502 }
    );
  }
}
