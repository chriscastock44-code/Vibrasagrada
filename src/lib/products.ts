import db from "./db";
import type { Product, ProductInput } from "./types";

interface ProductRow {
  id: number;
  slug: string;
  name: string;
  description: string;
  priceCents: number;
  currency: string;
  images: string;
  personalizationFields: string;
  stock: number;
  active: number;
  createdAt: string;
  updatedAt: string;
}

function rowToProduct(row: ProductRow): Product {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    priceCents: row.priceCents,
    currency: row.currency,
    images: JSON.parse(row.images || "[]"),
    personalizationFields: JSON.parse(row.personalizationFields || "[]"),
    stock: row.stock,
    active: !!row.active,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export function getAllProducts({ onlyActive = false } = {}): Product[] {
  const rows = onlyActive
    ? (db
        .prepare("SELECT * FROM products WHERE active = 1 ORDER BY createdAt DESC")
        .all() as ProductRow[])
    : (db.prepare("SELECT * FROM products ORDER BY createdAt DESC").all() as ProductRow[]);
  return rows.map(rowToProduct);
}

export function getProductBySlug(slug: string): Product | undefined {
  const row = db.prepare("SELECT * FROM products WHERE slug = ?").get(slug) as
    | ProductRow
    | undefined;
  return row ? rowToProduct(row) : undefined;
}

export function getProductById(id: number): Product | undefined {
  const row = db.prepare("SELECT * FROM products WHERE id = ?").get(id) as
    | ProductRow
    | undefined;
  return row ? rowToProduct(row) : undefined;
}

export function createProduct(input: ProductInput): Product {
  const stmt = db.prepare(`
    INSERT INTO products (slug, name, description, priceCents, currency, images, personalizationFields, stock, active, updatedAt)
    VALUES (@slug, @name, @description, @priceCents, @currency, @images, @personalizationFields, @stock, @active, datetime('now'))
  `);
  const result = stmt.run({
    slug: input.slug,
    name: input.name,
    description: input.description,
    priceCents: input.priceCents,
    currency: input.currency || "MXN",
    images: JSON.stringify(input.images || []),
    personalizationFields: JSON.stringify(input.personalizationFields || []),
    stock: input.stock,
    active: input.active ? 1 : 0,
  });
  return getProductById(Number(result.lastInsertRowid))!;
}

export function updateProduct(id: number, input: ProductInput): Product | undefined {
  db.prepare(`
    UPDATE products SET
      slug = @slug,
      name = @name,
      description = @description,
      priceCents = @priceCents,
      currency = @currency,
      images = @images,
      personalizationFields = @personalizationFields,
      stock = @stock,
      active = @active,
      updatedAt = datetime('now')
    WHERE id = @id
  `).run({
    id,
    slug: input.slug,
    name: input.name,
    description: input.description,
    priceCents: input.priceCents,
    currency: input.currency || "MXN",
    images: JSON.stringify(input.images || []),
    personalizationFields: JSON.stringify(input.personalizationFields || []),
    stock: input.stock,
    active: input.active ? 1 : 0,
  });
  return getProductById(id);
}

export function deleteProduct(id: number): void {
  db.prepare("DELETE FROM products WHERE id = ?").run(id);
}
