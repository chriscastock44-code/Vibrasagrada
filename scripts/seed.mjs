// Seed script: adds sample products so the store isn't empty on first run.
// Run with: npm run seed
import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const dataDir = path.join(process.cwd(), "data");
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
const db = new Database(path.join(dataDir, "vibra-sagrada.db"));

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
`);

const existing = db.prepare("SELECT COUNT(*) as c FROM products").get();
if (existing.c > 0) {
  console.log(`Ya hay ${existing.c} producto(s) en la base de datos. No se agregó nada nuevo.`);
  process.exit(0);
}

const sampleProducts = [
  {
    slug: "collar-alma-grabado",
    name: "Collar Alma — grabado personalizado",
    description:
      "Collar artesanal en plata, grabado a mano con el mensaje que elijas. Cada pieza cuenta una historia distinta.",
    priceCents: 89900,
    currency: "MXN",
    images: [],
    personalizationFields: [
      {
        id: "texto_grabado",
        type: "text",
        label: "Texto a grabar",
        required: true,
        maxLength: 25,
        helpText: "Máximo 25 caracteres. Ej. una fecha, iniciales o frase corta.",
      },
      {
        id: "acabado",
        type: "select",
        label: "Acabado",
        required: true,
        options: ["Plata brillante", "Plata envejecida"],
      },
    ],
    stock: 15,
    active: 1,
  },
  {
    slug: "taza-ceramica-nombre",
    name: "Taza de cerámica con nombre",
    description:
      "Taza artesanal de cerámica, pintada a mano con el nombre o mensaje de tu elección.",
    priceCents: 34900,
    currency: "MXN",
    images: [],
    personalizationFields: [
      {
        id: "nombre",
        type: "text",
        label: "Nombre o mensaje",
        required: true,
        maxLength: 20,
      },
      {
        id: "color",
        type: "select",
        label: "Color de base",
        required: true,
        options: ["Terracota", "Blanco hueso", "Azul añil"],
      },
    ],
    stock: 30,
    active: 1,
  },
  {
    slug: "retrato-personalizado",
    name: "Retrato ilustrado personalizado",
    description:
      "Ilustración digital personalizada a partir de una foto que nos envíes. Un regalo con alma para ocasiones especiales.",
    priceCents: 129900,
    currency: "MXN",
    images: [],
    personalizationFields: [
      {
        id: "foto_referencia",
        type: "image",
        label: "Sube tu foto de referencia",
        required: true,
      },
      {
        id: "instrucciones",
        type: "textarea",
        label: "Instrucciones especiales (opcional)",
        required: false,
      },
    ],
    stock: 999,
    active: 1,
  },
];

const insert = db.prepare(`
  INSERT INTO products (slug, name, description, priceCents, currency, images, personalizationFields, stock, active, updatedAt)
  VALUES (@slug, @name, @description, @priceCents, @currency, @images, @personalizationFields, @stock, @active, datetime('now'))
`);

for (const p of sampleProducts) {
  insert.run({
    ...p,
    images: JSON.stringify(p.images),
    personalizationFields: JSON.stringify(p.personalizationFields),
  });
}

console.log(`Se agregaron ${sampleProducts.length} productos de ejemplo.`);
