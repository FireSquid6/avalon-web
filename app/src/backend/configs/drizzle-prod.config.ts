import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  out: "./drizzle/remote",
  schema: "./db/schema.ts",
  dialect: "turso",
  dbCredentials: {
    url: process.env.AVALON_DB_PATH!,
    authToken: process.env.AVALON_DB_TOKEN!,
  }
});
