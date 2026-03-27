import { COOKIE_NAME } from "@shared/const";
import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, protectedProcedure, publicProcedure, router } from "./_core/trpc";
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
