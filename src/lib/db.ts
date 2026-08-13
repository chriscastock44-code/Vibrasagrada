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

    CREATE TABLE IF NOT EXISTS custom_design_images (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      imageUrl TEXT NOT NULL,
      sortOrder INTEGER NOT NULL DEFAULT 0,
      createdAt TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Tarjetas de "Lo que viene" en la landing de Barks & Paws
    -- (/barks-and-paws) — a diferencia de custom_design_images, cada una
    -- lleva su propio texto (título + descripción) además de la foto.
    CREATE TABLE IF NOT EXISTS bp_upcoming_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      imageUrl TEXT NOT NULL DEFAULT '',
      title TEXT NOT NULL DEFAULT '',
      description TEXT NOT NULL DEFAULT '',
      sortOrder INTEGER NOT NULL DEFAULT 0,
      createdAt TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Carrusel de "Productos ya hechos" en la landing de Barks & Paws.
    CREATE TABLE IF NOT EXISTS bp_product_photos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      imageUrl TEXT NOT NULL,
      caption TEXT NOT NULL DEFAULT '',
      sortOrder INTEGER NOT NULL DEFAULT 0,
      createdAt TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
}

// Adds a column to an existing table if it isn't there yet. Safe to call
// every time the server starts: SQLite/libSQL has no "ADD COLUMN IF NOT
// EXISTS", so we just try it and swallow the "duplicate column" error on
// every run after the first. Returns true only the one time it actually
// creates the column, so callers can run a one-time backfill right after.
async function ensureColumn(
  table: string,
  column: string,
  definition: string
): Promise<boolean> {
  try {
    await db.execute(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
    return true;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (!/duplicate column name/i.test(message)) {
      throw err;
    }
    return false;
  }
}

async function migrate(): Promise<void> {
  // "Destacados" en el home ahora lo elige la marca desde /admin en vez de
  // mostrar automáticamente los últimos productos creados.
  await ensureColumn("products", "featured", "INTEGER NOT NULL DEFAULT 0");

  // Categoría para separar "Totes" y "Playeras" en /tienda.
  const categoryJustAdded = await ensureColumn(
    "products",
    "category",
    "TEXT NOT NULL DEFAULT 'tote'"
  );
  if (categoryJustAdded) {
    // Backfill de una sola vez a partir del nombre (todos los productos
    // existentes hasta ahora traen "tote" o "playera" en el nombre). Solo
    // corre justo cuando se crea la columna — después la categoría la
    // controla el admin a mano, esto no la vuelve a tocar.
    await db.execute(
      "UPDATE products SET category = 'playera' WHERE LOWER(name) LIKE '%playera%'"
    );
  }

  // Orden manual (arrastrar y soltar) de los productos en /admin y /tienda.
  const sortOrderJustAdded = await ensureColumn(
    "products",
    "sortOrder",
    "INTEGER NOT NULL DEFAULT 0"
  );
  if (sortOrderJustAdded) {
    // Arranca en el mismo orden en que se crearon (id ascendente), para no
    // dejar todos los productos empatados en 0 la primera vez.
    await db.execute("UPDATE products SET sortOrder = id");
  }

  // Visibilidad en /catalogo (independiente de "active"/"featured"): se
  // controla desde /admin/catalogo con un checkbox por producto. Default 1
  // para no cambiar el comportamiento actual del catálogo (que hoy muestra
  // todos los productos activos) — el catálogo público sigue exigiendo
  // active=1 además de showInCatalog=1, así que un producto oculto de la
  // tienda no aparece ahí aunque esta columna diga 1.
  await ensureColumn("products", "showInCatalog", "INTEGER NOT NULL DEFAULT 1");
}

// Every query in lib/products.ts and lib/orders.ts awaits this before
// touching the database, so the schema is guaranteed to exist first without
// every caller needing to know or care about setup.
export const ready: Promise<void> = (global.__vibraDbReady ?? initSchema()).then(migrate);
if (process.env.NODE_ENV !== "production") {
  global.__vibraDbReady = ready;
}

export default db;
