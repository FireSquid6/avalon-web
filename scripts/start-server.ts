#!/usr/bin/env bun

import path from "path";
import fs from "fs";
import { startServer } from "server";
import { getConfigFromPartial } from "server/config";

const storeDir = path.resolve(import.meta.dir, "..", "development-server-store");

console.log(storeDir);
if (!fs.existsSync(storeDir)) {
  fs.mkdirSync(storeDir, { recursive: true });
}

const config = getConfigFromPartial({
  databasePath: path.join(storeDir, "db.sqlite"),
  dbType: "local",
  port: 4320,
});
startServer(config);
