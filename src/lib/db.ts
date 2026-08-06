import { createClient, type Client } from "@libsql/client";
import path from "path";
import fs from "fs";

const dataDir = path.join(process.cwd(), "data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// In production, point TURSO_DATABASE_URL / TURSO_AUTH_TOKEN at a real Turso
// (libSQL) database — see README "Base de datos". This matters for two
// reasons: managed Node.js hosts like Hostinger's Web Apps can't compile
// native modules at install time (no Python/build tools in their build
// environment — this is why better-sqlite3 doesn't work there), and even
// where a native module could be installed, a SQLite file living on the
// app's own disk isn't guaranteed to survive a redeploy. Turso solves both:
// it's a real network database, and this client talks to it over plain
// HTTP, so no native binary is involved in production at all.
//
// Locally, with no TURSO_DATABASE_URL set, we fall back to a SQLite file on
// disk so `npm run dev` keeps working with zero setup, same as before.
const url =
  process.env.TURSO_DATABASE_URL || `file:${path.join(dataDir, "vibra-sagrada.db")}`;
const authToken = process.env.TURSO_AUTH_TOKEN;

// Reuse a single connection across hot reloads in dev.
declare global {

  var __vibraDb: Client | undefined;
  var __vibraDbReady: Promise<void> | undefined;
}

export const db: Client = global.__vibraDb ?? createClient({ url, authToken });
if (process.env.NODE_ENV !== "production") {
  global.__vibraDb = db;
}

async function initSchema(): Promise<void> {
  await db.executeMultiple(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      priceCents INTEGER NOT NULL DEFAULT 0,
      currency TEXT NOT NULL DEFAULT 'MXN',
      images TEXT NOT NULL DEFAULT '[]',
      personalizationFields TEXT NOT NULL DEFAULT '[]',
      stock INTEGER NOT NULL DEFAULT 0,
      active INTEGER NOT NULL DEFAULT 1,
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      items TEXT NOT NULL,
      customerEmail TEXT,
      totalCents INTEGER NOT NULL,
      currency TEXT NOT NULL DEFAULT 'MXN',
      status TEXT NOT NULL DEFAULT 'pending',
      mpPreferenceId TEXT,
      mpPaymentId TEXT,
      createdAt TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS instagram_posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      imageUrl TEXT NOT NULL,
      link TEXT NOT NULL DEFAULT '',
      sortOrder INTEGER NOT NULL DEFAULT 0,
      createdAt TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
}

// Every query in lib/products.ts and lib/orders.ts awaits this before
// touching the database, so the schema is guaranteed to exist first without
// every caller needing to know or care about setup.
export const ready: Promise<void> = global.__vibraDbReady ?? initSchema();
if (process.env.NODE_ENV !== "production") {
  global.__vibraDbReady = ready;
}

export default db;
