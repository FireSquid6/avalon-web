import { getConfigFromPartial, getPartialFromEnv } from "@/backend/config";

import { getDb } from "@/backend/db";
import { resetTable } from "@/backend/db/schema";
const config = getConfigFromPartial(getPartialFromEnv());

const db = getDb(config);

const results = await db
  .select()
  .from(resetTable);


console.log(results);
