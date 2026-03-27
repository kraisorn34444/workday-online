import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users } from "../drizzle/schema222";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Work Records queries
import { and, desc } from "drizzle-orm";
import { workRecords, workRecordImages, InsertWorkRecord, InsertWorkRecordImage } from "../drizzle/schema222";

export async function createWorkRecord(record: InsertWorkRecord) {
  const db = await getDb();
  if (!db) return null;
  try {
    const result = await db.insert(workRecords).values(record);
    const id = result[0].insertId as number;
    const created = await db.select().from(workRecords).where(eq(workRecords.id, id)).limit(1);
    return created.length > 0 ? created[0] : null;
  } catch (error) {
    console.error("[Database] Failed to create work record:", error);
    return null;
  }
}

export async function getWorkRecordsByUser(userId: number, month?: string) {
  const db = await getDb();
  if (!db) return [];
  try {
    const conditions = [eq(workRecords.userId, userId)];
    if (month) conditions.push(eq(workRecords.month, month));
    return await db.select().from(workRecords).where(and(...conditions)).orderBy(desc(workRecords.date));
  } catch (error) {
    console.error("[Database] Failed to get work records:", error);
    return [];
  }
}

export async function updateWorkRecord(id: number, record: Partial<InsertWorkRecord>) {
  const db = await getDb();
  if (!db) return null;
  try {
    await db.update(workRecords).set({ ...record, updatedAt: new Date() }).where(eq(workRecords.id, id));
    const updated = await db.select().from(workRecords).where(eq(workRecords.id, id)).limit(1);
    return updated.length > 0 ? updated[0] : null;
  } catch (error) {
    console.error("[Database] Failed to update work record:", error);
    return null;
  }
}

export async function deleteWorkRecord(id: number) {
  const db = await getDb();
  if (!db) return false;
  try {
    await db.delete(workRecords).where(eq(workRecords.id, id));
    return true;
  } catch (error) {
    console.error("[Database] Failed to delete work record:", error);
    return false;
  }
}

export async function addWorkRecordImage(image: InsertWorkRecordImage) {
  const db = await getDb();
  if (!db) return false;
  try {
    await db.insert(workRecordImages).values(image);
    return true;
  } catch (error) {
    console.error("[Database] Failed to add work record image:", error);
    return false;
  }
}

export async function getWorkRecordImages(recordId: number) {
  const db = await getDb();
  if (!db) return [];
  try {
    return await db.select().from(workRecordImages).where(eq(workRecordImages.recordId, recordId)).orderBy(desc(workRecordImages.uploadedAt));
  } catch (error) {
    console.error("[Database] Failed to get work record images:", error);
    return [];
  }
}
