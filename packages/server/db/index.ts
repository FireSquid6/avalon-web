import type { Config } from "../config";
import { Database } from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";

export function getDb(config: Config) {
  const sqlite = new Database(config.databasePath);
  const db = drizzle(sqlite);

  return db;
}

export type Db = ReturnType<typeof getDb>;
