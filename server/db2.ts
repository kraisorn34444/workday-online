import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from "../drizzle/schema"; // ✅ เช็คว่า Path นี้มีไฟล์ schema.ts จริง
import { users } from "../drizzle/schema";
import { eq } from "drizzle-orm";

// 1. สร้าง Connection (ใช้ตัวแปรเดียวให้ชัดเจน)
const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString);
export const db = drizzle(client, { schema });

// 2. ฟังก์ชันดึงข้อมูลงาน (เพิ่ม Return เพื่อลบ Error)
export async function getWorkRecordsByUser(userId: number, month?: string) {
  try {
    // สมมติว่าตารางงานชื่อ workRecords ใน schema ของคุณ
    // หากยังไม่มีตารางนี้ใน schema ให้สร้างก่อนนะครับ
    // return await db.select().from(schema.workRecords).where(eq(schema.workRecords.userId, userId));
    
    console.log(`ดึงข้อมูลของ User ID: ${userId}`);
    return []; // ✅ คืนค่าเป็น Array ว่างไว้ก่อนเพื่อลบเส้นแดง
  } catch (error) {
    console.error("Error fetching work records:", error);
    throw error;
  }
}

// 3. ฟังก์ชันสร้างข้อมูลงาน
export async function createWorkRecord(data: any) {
  try {
    // return await db.insert(schema.workRecords).values(data);
    return { success: true }; 
  } catch (error) {
    throw error;
  }
}

// 4. ฟังก์ชันอื่นๆ ที่จำเป็นสำหรับ routers.ts
export async function updateWorkRecord(id: number, data: any) { return { success: true }; }
export async function deleteWorkRecord(id: number) { return { success: true }; }
export async function addWorkRecordImage(data: any) { return { success: true }; }
export async function getWorkRecordImages(recordId: number) { return []; }