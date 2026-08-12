import { db, ready } from "./db";
import type { BpUpcomingItem } from "./types";

interface BpUpcomingItemRow {
  id: number;
  imageUrl: string;
  title: string;
  description: string;
  sortOrder: number;
  createdAt: string;
}

function rowToItem(row: BpUpcomingItemRow): BpUpcomingItem {
  return {
    id: Number(row.id),
    imageUrl: String(row.imageUrl),
    title: String(row.title),
    description: String(row.description),
    sortOrder: Number(row.sortOrder),
    createdAt: String(row.createdAt),
  };
}

export async function getAllBpUpcomingItems(): Promise<BpUpcomingItem[]> {
  await ready;
  const result = await db.execute(
    "SELECT * FROM bp_upcoming_items ORDER BY sortOrder ASC, createdAt DESC"
  );
  return (result.rows as unknown as BpUpcomingItemRow[]).map(rowToItem);
}

export async function createBpUpcomingItem(input: {
  imageUrl: string;
  title: string;
  description: string;
  sortOrder?: number;
}): Promise<BpUpcomingItem> {
  await ready;
  const result = await db.execute({
    sql: `
      INSERT INTO bp_upcoming_items (imageUrl, title, description, sortOrder)
      VALUES (@imageUrl, @title, @description, @sortOrder)
    `,
    args: {
      imageUrl: input.imageUrl,
      title: input.title,
      description: input.description,
      sortOrder: input.sortOrder ?? 0,
    },
  });
  const row = await db.execute({
    sql: "SELECT * FROM bp_upcoming_items WHERE id = ?",
    args: [Number(result.lastInsertRowid)],
  });
  return rowToItem(row.rows[0] as unknown as BpUpcomingItemRow);
}

export async function updateBpUpcomingItem(
  id: number,
  input: { imageUrl?: string; title?: string; description?: string }
): Promise<void> {
  await ready;
  const fields: string[] = [];
  const args: Record<string, string | number> = { id };
  if (input.imageUrl !== undefined) {
    fields.push("imageUrl = @imageUrl");
    args.imageUrl = input.imageUrl;
  }
  if (input.title !== undefined) {
    fields.push("title = @title");
    args.title = input.title;
  }
  if (input.description !== undefined) {
    fields.push("description = @description");
    args.description = input.description;
  }
  if (fields.length === 0) return;
  await db.execute({
    sql: `UPDATE bp_upcoming_items SET ${fields.join(", ")} WHERE id = @id`,
    args,
  });
}

export async function deleteBpUpcomingItem(id: number): Promise<void> {
  await ready;
  await db.execute({ sql: "DELETE FROM bp_upcoming_items WHERE id = ?", args: [id] });
}

// Guarda el orden manual (arrastrar y soltar) de las tarjetas de "Lo que
// viene" en /admin/barks-and-paws. Recibe la lista completa de ids en el
// orden final deseado.
export async function reorderBpUpcomingItems(orderedIds: number[]): Promise<void> {
  await ready;
  if (orderedIds.length === 0) return;
  await db.batch(
    orderedIds.map((id, index) => ({
      sql: "UPDATE bp_upcoming_items SET sortOrder = ? WHERE id = ?",
      args: [index, id],
    })),
    "write"
  );
}
