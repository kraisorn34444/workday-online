import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const"; // เพิ่ม ONE_YEAR_MS มาช่วยตั้งค่าเวลา Cookie
import { z } from "zod";
import { TRPCError } from "@trpc/server"; 
import { eq } from "drizzle-orm"; 
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { db } from "./db"; 
import { users } from "../drizzle/schema"; 


export const appRouter = router({
  system: systemRouter,
  auth: router({
    // --- ส่วน Login ที่แก้ไขให้ใช้งานได้จริง ---
    login: publicProcedure
      .input(z.object({
        username: z.string(),
        password: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { username, password } = input;

        // 1. ค้นหา User จากฐานข้อมูล Neon
        const [user] = await db.select().from(users).where(eq(users.username, username));

        // 2. ตรวจสอบว่ามี User หรือรหัสผ่านถูกต้องหรือไม่
        if (!user || user.password !== password) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง',
          });
        }

        // 3. ✅ ส่วนสำคัญ: สร้าง Cookie เพื่อให้เบราว์เซอร์จำสถานะการ Login
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, user.id.toString(), {
          ...cookieOptions,
          maxAge: ONE_YEAR_MS, // ตั้งค่าให้ Cookie อยู่ได้นาน 1 ปีตามค่ามาตรฐานของโปรเจคคุณ
        });

        return { success: true, user };
      }),
    // ---------------------------------------

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
    list: protectedProcedure
      .input(z.object({ month: z.string().optional() }))
      .query(async ({ ctx, input }) => {
        return await getWorkRecordsByUser(ctx.user.id, input.month);
      }),
    create: adminProcedure
      .input(
        z.object({
          date: z.string(),
          month: z.string(),
          customerName: z.string().optional(),
          customerPhone: z.string().optional(),
          product: z.string().optional(),
          os: z.string().optional(),
          serviceType: z.string().optional(),
          details: z.string().optional(),
          notes: z.string().optional(),
          status: z.enum(["pending", "completed", "cancelled"]),
        })
      )
      .mutation(async ({ ctx, input }) => {
        return await createWorkRecord({
          userId: ctx.user.id,
          ...input,
        });
      }),
    update: adminProcedure
      .input(
        z.object({
          id: z.number(),
          date: z.string().optional(),
          month: z.string().optional(),
          customerName: z.string().optional(),
          customerPhone: z.string().optional(),
          product: z.string().optional(),
          os: z.string().optional(),
          serviceType: z.string().optional(),
          details: z.string().optional(),
          notes: z.string().optional(),
          status: z.enum(["pending", "completed", "cancelled"]).optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return await updateWorkRecord(id, data);
      }),
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return await deleteWorkRecord(input.id);
      }),
    addImage: adminProcedure
      .input(
        z.object({
          recordId: z.number(),
          filename: z.string(),
          url: z.string(),
        })
      )
      .mutation(async ({ input }) => {
        return await addWorkRecordImage(input);
      }),
    getImages: protectedProcedure
      .input(z.object({ recordId: z.number() }))
      .query(async ({ input }) => {
        return await getWorkRecordImages(input.recordId);
      }),
  }),
});

export type AppRouter = typeof appRouter;