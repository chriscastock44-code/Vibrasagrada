import db from "./db";
import type { CartItem } from "./types";

export interface OrderInput {
  items: CartItem[];
  customerEmail?: string;
  totalCents: number;
  currency: string;
}

export function createOrder(input: OrderInput): number {
  const result = db
    .prepare(
      `INSERT INTO orders (items, customerEmail, totalCents, currency, status)
       VALUES (@items, @customerEmail, @totalCents, @currency, 'pending')`
    )
    .run({
      items: JSON.stringify(input.items),
      customerEmail: input.customerEmail || null,
      totalCents: input.totalCents,
      currency: input.currency,
    });
  return Number(result.lastInsertRowid);
}

export function setOrderPreferenceId(orderId: number, preferenceId: string): void {
  db.prepare("UPDATE orders SET mpPreferenceId = ? WHERE id = ?").run(preferenceId, orderId);
}

/**
 * Marks an order as paid once Mercado Pago confirms an "approved" payment
 * via webhook. `orderId` comes from the payment's `external_reference`,
 * which we set to our internal order id when creating the preference —
 * that's the trustworthy link back to our order, not the preference id.
 */
export function markOrderPaid(orderId: string | number, paymentId: string): void {
  db.prepare("UPDATE orders SET status = 'paid', mpPaymentId = ? WHERE id = ?").run(
    paymentId,
    Number(orderId)
  );
}
