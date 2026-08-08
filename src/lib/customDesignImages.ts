import { db, ready } from "./db";
import type { CustomDesignImage } from "./types";

interface CustomDesignImageRow {
  id: number;
  imageUrl: string;
  sortOrder: number;
  createdAt: string;
}

function rowToImage(row: CustomDesignImageRow): CustomDesignImage {
  return {
    id: Number(row.id),
    imageUrl: String(row.imageUrl),
    sortOrder: Number(row.sortOrder),
    createdAt: String(row.createdAt),
  };
}

export async function getAllCustomDesignImages(): Promise<CustomDesignImage[]> {
  await ready;
  const result = await db.execute(
    "SELECT * FROM custom_design_images ORDER BY sortOrder ASC, createdAt DESC"
  );
  return (result.rows as unknown as CustomDesignImageRow[]).map(rowToImage);
}

export async function createCustomDesignImage(input: {
  imageUrl: string;
  sortOrder?: number;
}): Promise<CustomDesignImage> {
  await ready;
  const result = await db.execute({
    sql: `
      INSERT INTO custom_design_images (imageUrl, sortOrder)
      VALUES (@imageUrl, @sortOrder)
    `,
    args: {
      imageUrl: input.imageUrl,
      sortOrder: input.sortOrder ?? 0,
    },
  });
  const row = await db.execute({
    sql: "SELECT * FROM custom_design_images WHERE id = ?",
    args: [Number(result.lastInsertRowid)],
  });
  return rowToImage(row.rows[0] as unknown as CustomDesignImageRow);
}

export async function deleteCustomDesignImage(id: number): Promise<void> {
  await ready;
  await db.execute({ sql: "DELETE FROM custom_design_images WHERE id = ?", args: [id] });
}
