import { db, ready } from "./db";
import type { BpProductPhoto } from "./types";

interface BpProductPhotoRow {
  id: number;
  imageUrl: string;
  caption: string;
  sortOrder: number;
  createdAt: string;
}

function rowToPhoto(row: BpProductPhotoRow): BpProductPhoto {
  return {
    id: Number(row.id),
    imageUrl: String(row.imageUrl),
    caption: String(row.caption),
    sortOrder: Number(row.sortOrder),
    createdAt: String(row.createdAt),
  };
}

export async function getAllBpProductPhotos(): Promise<BpProductPhoto[]> {
  await ready;
  const result = await db.execute(
    "SELECT * FROM bp_product_photos ORDER BY sortOrder ASC, createdAt DESC"
  );
  return (result.rows as unknown as BpProductPhotoRow[]).map(rowToPhoto);
}

export async function createBpProductPhoto(input: {
  imageUrl: string;
  caption?: string;
  sortOrder?: number;
}): Promise<BpProductPhoto> {
  await ready;
  const result = await db.execute({
    sql: `
      INSERT INTO bp_product_photos (imageUrl, caption, sortOrder)
      VALUES (@imageUrl, @caption, @sortOrder)
    `,
    args: {
      imageUrl: input.imageUrl,
      caption: input.caption ?? "",
      sortOrder: input.sortOrder ?? 0,
    },
  });
  const row = await db.execute({
    sql: "SELECT * FROM bp_product_photos WHERE id = ?",
    args: [Number(result.lastInsertRowid)],
  });
  return rowToPhoto(row.rows[0] as unknown as BpProductPhotoRow);
}

export async function deleteBpProductPhoto(id: number): Promise<void> {
  await ready;
  await db.execute({ sql: "DELETE FROM bp_product_photos WHERE id = ?", args: [id] });
}

// Guarda el orden manual (arrastrar y soltar) de las fotos del carrusel de
// "Productos ya hechos" en /admin/barks-and-paws. Recibe la lista completa
// de ids en el orden final deseado.
export async function reorderBpProductPhotos(orderedIds: number[]): Promise<void> {
  await ready;
  if (orderedIds.length === 0) return;
  await db.batch(
    orderedIds.map((id, index) => ({
      sql: "UPDATE bp_product_photos SET sortOrder = ? WHERE id = ?",
      args: [index, id],
    })),
    "write"
  );
}
