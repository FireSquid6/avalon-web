import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  out: "../../drizzle/local",
  schema: "./db/schema.ts",
  dialect: "turso",
  dbCredentials: {
    url: "../../../development-server-store/db.sqlite",
  }
});
