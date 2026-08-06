import { db, ready } from "./db";
import type { InstagramPost } from "./types";

interface InstagramPostRow {
  id: number;
  imageUrl: string;
  link: string;
  sortOrder: number;
  createdAt: string;
}

function rowToPost(row: InstagramPostRow): InstagramPost {
  return {
    id: Number(row.id),
    imageUrl: String(row.imageUrl),
    link: String(row.link ?? ""),
    sortOrder: Number(row.sortOrder),
    createdAt: String(row.createdAt),
  };
}

export async function getAllInstagramPosts(): Promise<InstagramPost[]> {
  await ready;
  const result = await db.execute(
    "SELECT * FROM instagram_posts ORDER BY sortOrder ASC, createdAt DESC"
  );
  return (result.rows as unknown as InstagramPostRow[]).map(rowToPost);
}

export async function createInstagramPost(input: {
  imageUrl: string;
  link?: string;
  sortOrder?: number;
}): Promise<InstagramPost> {
  await ready;
  const result = await db.execute({
    sql: `
      INSERT INTO instagram_posts (imageUrl, link, sortOrder)
      VALUES (@imageUrl, @link, @sortOrder)
    `,
    args: {
      imageUrl: input.imageUrl,
      link: input.link || "",
      sortOrder: input.sortOrder ?? 0,
    },
  });
  const row = await db.execute({
    sql: "SELECT * FROM instagram_posts WHERE id = ?",
    args: [Number(result.lastInsertRowid)],
  });
  return rowToPost(row.rows[0] as unknown as InstagramPostRow);
}

export async function deleteInstagramPost(id: number): Promise<void> {
  await ready;
  await db.execute({ sql: "DELETE FROM instagram_posts WHERE id = ?", args: [id] });
}
