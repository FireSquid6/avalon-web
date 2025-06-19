import path from "path"
import { startServer } from "server";
import { getConfigFromFile } from "./config";

const configFilepath = process.env.CONFIG_FILE_PATH ?? path.join(import.meta.dir, "default-avalon-config.yaml");

console.log("Loading config from", configFilepath);
const config = getConfigFromFile(configFilepath);
console.log("Connecting to database:", config.databasePath);

startServer(config);
