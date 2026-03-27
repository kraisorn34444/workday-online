import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";



/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Work Records Table
export const workRecords = mysqlTable("workRecords", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  date: varchar("date", { length: 10 }).notNull(), // YYYY-MM-DD
  month: varchar("month", { length: 10 }).notNull(), // ม.ค., ก.พ., มี.ค., etc.
  customerName: text("customerName"),
  customerPhone: varchar("customerPhone", { length: 20 }),
  product: text("product"),
  os: text("os"),
  serviceType: text("serviceType"),
  details: text("details"),
  notes: text("notes"),
  status: mysqlEnum("status", ["pending", "completed", "cancelled"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type WorkRecord = typeof workRecords.$inferSelect;
export type InsertWorkRecord = typeof workRecords.$inferInsert;

// Work Record Images Table
export const workRecordImages = mysqlTable("workRecordImages", {
  id: int("id").autoincrement().primaryKey(),
  recordId: int("recordId").notNull().references(() => workRecords.id, { onDelete: "cascade" }),
  filename: varchar("filename", { length: 255 }).notNull(),
  url: text("url").notNull(),
  uploadedAt: timestamp("uploadedAt").defaultNow().notNull(),
});

export type WorkRecordImage = typeof workRecordImages.$inferSelect;
export type InsertWorkRecordImage = typeof workRecordImages.$inferInsert;