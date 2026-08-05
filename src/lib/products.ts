import { db, ready } from "./db";
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
    id: Number(row.id),
    slug: String(row.slug),
    name: String(row.name),
    description: String(row.description),
    priceCents: Number(row.priceCents),
    currency: String(row.currency),
    images: JSON.parse(String(row.images ?? "[]")),
    personalizationFields: JSON.parse(String(row.personalizationFields ?? "[]")),
    stock: Number(row.stock),
    active: !!Number(row.active),
    createdAt: String(row.createdAt),
    updatedAt: String(row.updatedAt),
  };
}

export async function getAllProducts({ onlyActive = false } = {}): Promise<Product[]> {
  await ready;
  const result = await db.execute(
    onlyActive
      ? "SELECT * FROM products WHERE active = 1 ORDER BY createdAt DESC"
      : "SELECT * FROM products ORDER BY createdAt DESC"
  );
  return (result.rows as unknown as ProductRow[]).map(rowToProduct);
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  await ready;
  const result = await db.execute({
    sql: "SELECT * FROM products WHERE slug = ?",
    args: [slug],
  });
  const row = result.rows[0] as unknown as ProductRow | undefined;
  return row ? rowToProduct(row) : undefined;
}

export async function getProductById(id: number): Promise<Product | undefined> {
  await ready;
  const result = await db.execute({
    sql: "SELECT * FROM products WHERE id = ?",
    args: [id],
  });
  const row = result.rows[0] as unknown as ProductRow | undefined;
  return row ? rowToProduct(row) : undefined;
}

export async function createProduct(input: ProductInput): Promise<Product> {
  await ready;
  const result = await db.execute({
    sql: `
      INSERT INTO products (slug, name, description, priceCents, currency, images, personalizationFields, stock, active, updatedAt)
      VALUES (@slug, @name, @description, @priceCents, @currency, @images, @personalizationFields, @stock, @active, datetime('now'))
    `,
    args: {
      slug: input.slug,
      name: input.name,
      description: input.description,
      priceCents: input.priceCents,
      currency: input.currency || "MXN",
      images: JSON.stringify(input.images || []),
      personalizationFields: JSON.stringify(input.personalizationFields || []),
      stock: input.stock,
      active: input.active ? 1 : 0,
    },
  });
  const product = await getProductById(Number(result.lastInsertRowid));
  return product!;
}

export async function updateProduct(
  id: number,
  input: ProductInput
): Promise<Product | undefined> {
  await ready;
  await db.execute({
    sql: `
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
    `,
    args: {
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
    },
  });
  return getProductById(id);
}

export async function deleteProduct(id: number): Promise<void> {
  await ready;
  await db.execute({ sql: "DELETE FROM products WHERE id = ?", args: [id] });
}
