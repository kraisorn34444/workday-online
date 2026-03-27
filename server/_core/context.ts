import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import { COOKIE_NAME } from "@shared/const";
import { db } from "../db"; 
// ✅ แก้ไข Path ตรงนี้ให้ถอยหลังออกไป 2 ชั้นเพื่อหาโฟลเดอร์ drizzle
import { users } from "../../drizzle/schema"; 
import { eq } from "drizzle-orm";
import type { InferSelectModel } from "drizzle-orm";

export type User = InferSelectModel<typeof users>;

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  const { req, res } = opts;
  let user: User | null = null;

  try {
    const userId = req.cookies[COOKIE_NAME];

    if (userId) {
      // ค้นหา User ใน Neon Database
      const [foundUser] = await db
        .select()
        .from(users)
        .where(eq(users.id, Number(userId)));
      
      if (foundUser) {
        user = foundUser;
      }
    }
  } catch (error) {
    user = null;
  }

  return { req, res, user };
}