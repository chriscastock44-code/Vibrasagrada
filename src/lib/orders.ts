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

export function setOrderStripeSession(orderId: number, sessionId: string): void {
  db.prepare("UPDATE orders SET stripeSessionId = ? WHERE id = ?").run(sessionId, orderId);
}

export function markOrderPaid(sessionId: string): void {
  db.prepare("UPDATE orders SET status = 'paid' WHERE stripeSessionId = ?").run(sessionId);
}
