import { COOKIE_NAME } from "@shared/const";
import { z } from "zod";
import { TRPCError } from "@trpc/server"; // เพิ่มตัวนี้
import { eq } from "drizzle-orm"; // เพิ่มตัวนี้สำหรับ Query
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { db } from "./db"; // ตรวจสอบ Path ให้ตรงกับไฟล์ db.ts
import { users } from "./schema"; // ตรวจสอบ Path ให้ตรงกับไฟล์ schema.ts
import {
  createWorkRecord,
  getWorkRecordsByUser,
  updateWorkRecord,
  deleteWorkRecord,
  addWorkRecordImage,
  getWorkRecordImages,
} from "./db2";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    // --- เพิ่มส่วน Login ตรงนี้ ---
    login: publicProcedure
      .input(z.object({
        username: z.string(),
        password: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { username, password } = input;

        // ค้นหา User จากฐานข้อมูล Neon
        const [user] = await db.select().from(users).where(eq(users.username, username));

        if (!user || user.password !== password) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง',
          });
        }

        // สร้าง Session/Cookie เพื่อให้ระบบจำว่า Login แล้ว
        const cookieOptions = getSessionCookieOptions(ctx.req);
        // หมายเหตุ: ตรงนี้ต้องใช้ระบบสร้าง Token/Session ของคุณ 
        // ตัวอย่างแบบง่าย: ctx.res.cookie(COOKIE_NAME, user.id.toString(), cookieOptions);

        return { success: true, user };
      }),
    // ----------------------------

    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  workRecords: router({
    // ... ส่วนของ workRecords (คงเดิมตามที่คุณส่งมา)
    list: protectedProcedure
      .input(z.object({ month: z.string().optional() }))
      .query(async ({ ctx, input }) => {
        return await getWorkRecordsByUser(ctx.user.id, input.month);
      }),
    // ... (โค้ดที่เหลือเหมือนเดิม)
  }),
});

export type AppRouter = typeof appRouter;