import type { Config } from "../config";
import { drizzle } from "drizzle-orm/libsql";
import path from "path";
import fs from "fs";
import { createClient } from "@libsql/client";

export function getDb(config: Config) {
  // ensure that the database path exists
  if (config.dbType === "local") {
    fs.mkdirSync(path.dirname(config.databasePath), { recursive: true });
  }

  const sqlite = config.dbType === "local" ? createClient({
    url: `file:${config.databasePath}`,
  }) : createClient({
    url: config.databasePath,
    authToken: config.databaseToken,
  })

  const db = drizzle({ client: sqlite });
  return db;
}

export type Db = ReturnType<typeof getDb>;
