import { db, ready } from "./db";
import type { CartItem } from "./types";

export interface OrderInput {
  items: CartItem[];
  customerEmail?: string;
  totalCents: number;
  currency: string;
}

export async function createOrder(input: OrderInput): Promise<number> {
  await ready;
  const result = await db.execute({
    sql: `INSERT INTO orders (items, customerEmail, totalCents, currency, status)
          VALUES (@items, @customerEmail, @totalCents, @currency, 'pending')`,
    args: {
      items: JSON.stringify(input.items),
      customerEmail: input.customerEmail || null,
      totalCents: input.totalCents,
      currency: input.currency,
    },
  });
  return Number(result.lastInsertRowid);
}

export async function setOrderPreferenceId(
  orderId: number,
  preferenceId: string
): Promise<void> {
  await ready;
  await db.execute({
    sql: "UPDATE orders SET mpPreferenceId = ? WHERE id = ?",
    args: [preferenceId, orderId],
  });
}

/**
 * Marks an order as paid once Mercado Pago confirms an "approved" payment
 * via webhook. `orderId` comes from the payment's `external_reference`,
 * which we set to our internal order id when creating the preference —
 * that's the trustworthy link back to our order, not the preference id.
 */
export async function markOrderPaid(
  orderId: string | number,
  paymentId: string
): Promise<void> {
  await ready;
  await db.execute({
    sql: "UPDATE orders SET status = 'paid', mpPaymentId = ? WHERE id = ?",
    args: [paymentId, Number(orderId)],
  });
}
