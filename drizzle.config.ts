import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './drizzle.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL || '',
  },
});
