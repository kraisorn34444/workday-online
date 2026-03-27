import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './drizzle/schema.ts',
  out: './drizzle/migrations',
  dialect: 'postgresql', // ต้องเป็นตัวนี้เท่านั้น
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
