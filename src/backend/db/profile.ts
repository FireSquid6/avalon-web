import type { Db } from "./index";
import type { Profile } from "./schema"; 
import { profilesTable } from "./schema";
import { eq } from "drizzle-orm";

export async function getProfile(db: Db, username: string): Promise<Profile | null> {
  const profiles = await db
    .select()
    .from(profilesTable)
    .where(eq(profilesTable.username, username))
    .limit(1);

  return profiles.length > 0 ? profiles[0]! : null;
}

