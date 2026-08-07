import { db, ready } from "./db";
import type { Product, ProductCategory, ProductInput } from "./types";

// Traduce errores crudos de SQLite/libSQL (poco entendibles para alguien
// que no programa) a mensajes en español que sí dicen qué hacer.
export function friendlyDbError(err: unknown): string {
  const message = err instanceof Error ? err.message : String(err);
  if (/UNIQUE constraint failed: products\.slug/i.test(message)) {
    return "Ya existe un producto con esa URL (slug). Cambia el nombre o la URL e intenta de nuevo.";
  }
  return "No se pudo guardar el producto. Intenta de nuevo.";
}

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
  featured: number;
  category: string;
  sortOrder: number;
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
    featured: !!Number(row.featured),
    category: (row.category as ProductCategory) || "tote",
    sortOrder: Number(row.sortOrder),
    createdAt: String(row.createdAt),
    updatedAt: String(row.updatedAt),
  };
}

export async function getAllProducts({ onlyActive = false } = {}): Promise<Product[]> {
  await ready;
  const result = await db.execute(
    onlyActive
      ? "SELECT * FROM products WHERE active = 1 ORDER BY sortOrder ASC, createdAt DESC"
      : "SELECT * FROM products ORDER BY sortOrder ASC, createdAt DESC"
  );
  return (result.rows as unknown as ProductRow[]).map(rowToProduct);
}

// Guarda el nuevo orden manual (arrastrar y soltar) de un jalón. orderedIds
// es la lista completa de ids en el orden que se quiere mostrar.
export async function reorderProducts(orderedIds: number[]): Promise<void> {
  await ready;
  if (orderedIds.length === 0) return;
  await db.batch(
    orderedIds.map((id, index) => ({
      sql: "UPDATE products SET sortOrder = ? WHERE id = ?",
      args: [index, id],
    })),
    "write"
  );
}

// Productos elegidos a mano desde /admin para la sección "Destacados" del
// home — en vez de mostrar automáticamente los últimos creados.
export async function getFeaturedProducts(): Promise<Product[]> {
  await ready;
  const result = await db.execute(
    "SELECT * FROM products WHERE active = 1 AND featured = 1 ORDER BY updatedAt DESC"
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
  // Los productos nuevos se agregan al final del orden manual, no al
  // principio (que es lo que pasaría si se quedaran con sortOrder 0).
  const maxOrderResult = await db.execute(
    "SELECT COALESCE(MAX(sortOrder), 0) + 1 AS nextOrder FROM products"
  );
  const nextOrder = Number(maxOrderResult.rows[0]?.nextOrder ?? 1);

  const result = await db.execute({
    sql: `
      INSERT INTO products (slug, name, description, priceCents, currency, images, personalizationFields, stock, active, featured, category, sortOrder, updatedAt)
      VALUES (@slug, @name, @description, @priceCents, @currency, @images, @personalizationFields, @stock, @active, @featured, @category, @sortOrder, datetime('now'))
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
      featured: input.featured ? 1 : 0,
      category: input.category || "tote",
      sortOrder: nextOrder,
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
        featured = @featured,
        category = @category,
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
      featured: input.featured ? 1 : 0,
      category: input.category || "tote",
    },
  });
  return getProductById(id);
}

export async function deleteProduct(id: number): Promise<void> {
  await ready;
  await db.execute({ sql: "DELETE FROM products WHERE id = ?", args: [id] });
}
