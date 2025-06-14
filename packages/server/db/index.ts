import type { Config } from "../config";
import { Database } from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { migrate } from "drizzle-orm/bun-sqlite/migrator";

export function getDb(config: Config) {
  const sqlite = new Database(config.databasePath);
  const db = drizzle(sqlite);
  migrate(db, {
    migrationsFolder: "drizzle",
  });

  return db;
}

export type Db = ReturnType<typeof getDb>;
