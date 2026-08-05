// Seed script: adds sample products so the store isn't empty on first run.
// Run with: npm run seed
import { createClient } from "@libsql/client";
import path from "path";
import fs from "fs";

const dataDir = path.join(process.cwd(), "data");
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

// Same fallback as src/lib/db.ts: uses Turso if TURSO_DATABASE_URL is set,
// otherwise a local file so this works out of the box in development.
const url =
  process.env.TURSO_DATABASE_URL || `file:${path.join(dataDir, "vibra-sagrada.db")}`;
const authToken = process.env.TURSO_AUTH_TOKEN;
const db = createClient({ url, authToken });

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
`);

const existing = await db.execute("SELECT COUNT(*) as c FROM products");
if (Number(existing.rows[0].c) > 0) {
  console.log(
    `Ya hay ${existing.rows[0].c} producto(s) en la base de datos. No se agregó nada nuevo.`
  );
  process.exit(0);
}

const sampleProducts = [
  {
    slug: "tote-bag-con-tu-historia",
    name: "Tote bag con tu historia",
    description:
      "Tote bag de algodón, estampada a mano a partir de una historia, frase o recuerdo tuyo. Diseño autoral, pieza única.",
    priceCents: 45900,
    currency: "MXN",
    images: [],
    personalizationFields: [
      {
        id: "texto_estampado",
        type: "text",
        label: "Texto o frase a estampar",
        required: true,
        maxLength: 40,
        helpText: "Máximo 40 caracteres. Ej. una frase, fecha o palabra con significado.",
      },
      {
        id: "color_tote",
        type: "select",
        label: "Color de la tote",
        required: true,
        options: ["Crudo", "Negro"],
      },
      {
        id: "historia",
        type: "textarea",
        label: "Cuéntanos la historia detrás (opcional)",
        required: false,
        helpText: "Nos ayuda a diseñar una pieza que sí tenga sentido para ti.",
      },
    ],
    stock: 25,
    active: 1,
  },
  {
    slug: "playera-pieza-unica",
    name: "Playera pieza única",
    description:
      "Playera de algodón con estampado autoral, diseñada a partir de tu historia o idea. Hecha a pedido, no en serie.",
    priceCents: 55900,
    currency: "MXN",
    images: [],
    personalizationFields: [
      {
        id: "texto_estampado",
        type: "text",
        label: "Texto o frase a estampar",
        required: true,
        maxLength: 40,
        helpText: "Máximo 40 caracteres.",
      },
      {
        id: "color_prenda",
        type: "select",
        label: "Color de playera",
        required: true,
        options: ["Crudo", "Negro", "Azul marino"],
      },
      {
        id: "talla",
        type: "select",
        label: "Talla",
        required: true,
        options: ["CH", "M", "G", "EG"],
      },
    ],
    stock: 40,
    active: 1,
  },
  {
    slug: "tote-bag-edicion-lunar",
    name: "Tote bag edición lunar",
    description:
      "Tote bag con patrón lunar ilustrado a mano, inspirado en los símbolos de la marca. Diseño listo, sin personalización de texto.",
    priceCents: 42900,
    currency: "MXN",
    images: [],
    personalizationFields: [
      {
        id: "color_tote",
        type: "select",
        label: "Color de la tote",
        required: true,
        options: ["Crudo", "Negro"],
      },
    ],
    stock: 999,
    active: 1,
  },
];

const insertSql = `
  INSERT INTO products (slug, name, description, priceCents, currency, images, personalizationFields, stock, active, updatedAt)
  VALUES (@slug, @name, @description, @priceCents, @currency, @images, @personalizationFields, @stock, @active, datetime('now'))
`;

for (const p of sampleProducts) {
  await db.execute({
    sql: insertSql,
    args: {
      ...p,
      images: JSON.stringify(p.images),
      personalizationFields: JSON.stringify(p.personalizationFields),
    },
  });
}

console.log(`Se agregaron ${sampleProducts.length} productos de ejemplo.`);
