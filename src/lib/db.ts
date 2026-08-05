import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const dataDir = path.join(process.cwd(), "data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, "vibra-sagrada.db");

// Reuse a single connection across hot reloads in dev.
declare global {
   
  var __vibraDb: Database.Database | undefined;
}

export const db = global.__vibraDb ?? new Database(dbPath);
if (process.env.NODE_ENV !== "production") {
  global.__vibraDb = db;
}

db.pragma("journal_mode = WAL");

db.exec(`
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
`);

export default db;
