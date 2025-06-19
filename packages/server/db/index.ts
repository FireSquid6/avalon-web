import type { Config } from "../config";
import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";
import path from "path";
import { createClient } from "@libsql/client";

export function getDb(config: Config) {
  const sqlite = config.dbType === "local" ? createClient({
    url: `file:${config.databasePath}`,
  }) : createClient({
    url: config.databasePath,
    authToken: config.databaseToken,
  })

  const db = drizzle(sqlite);
  migrate(db, {
    migrationsFolder: path.resolve(import.meta.dir, "..", "drizzle"),
  });

  return db;
}

export type Db = ReturnType<typeof getDb>;
