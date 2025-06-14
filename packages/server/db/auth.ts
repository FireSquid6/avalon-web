import { usersTable, sessionsTable } from "./schema";
import type { User, Session } from "./schema";
import type { Db } from "./index";
import { eq } from "drizzle-orm";

export async function getSessionWithToken(db: Db, token: string): Promise<{ user: User, session: Session } | null> {
  const sessions = await db
    .select()
    .from(sessionsTable)
    .leftJoin(usersTable, eq(sessionsTable.username, usersTable.username))

  const session = sessions[0];

  if (!session) {
    return null;
  }

  if (session.users === null) {
    return null;
  }

  // idk why it's plural from the response
  // it is what it is
  return {
    session: session.sessions,
    user: session.users,
  }

}
