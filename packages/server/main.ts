import { startServer } from "server";
import { getConfigFromPartial, getPartialFromEnv } from "./config";

const partial = getPartialFromEnv();
const config = getConfigFromPartial(partial);
console.log("Connecting to database:", config.databasePath);

startServer(config);
