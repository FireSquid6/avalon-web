import { usersTable, sessionsTable, profilesTable, resetTable } from "./schema";
import type { User, Session, ResetToken } from "./schema";
import type { Db } from "./index";
import { eq, or } from "drizzle-orm";
import { randomUUIDv7 } from "bun";


export function validateUsername(username: string): string | null {
  if (typeof username !== 'string') return "Username must be a string";
  if (username.length < 3) return "Username must be at least 3 characters";
  if (username.length > 20) return "Username must be no more than 20 characters";
  if (!/^[a-zA-Z0-9_-]+$/.test(username)) return "Username can only contain letters, numbers, underscores, and hyphens";
  return null;
}

export function validateEmail(email: string): string | null {
  if (typeof email !== 'string') return "Email must be a string";
  if (email.length > 254) return "Email must be no more than 254 characters";
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return "Email format is invalid";
  return null;
}

export function validatePassword(password: string): string | null {
  if (typeof password !== 'string') return "Password must be a string";
  if (password.length < 8) return "Password must be at least 8 characters";
  if (password.length > 128) return "Password must be no more than 128 characters";
  if (!/[A-Z]/.test(password)) return "Password must contain at least one uppercase letter";
  if (!/[a-z]/.test(password)) return "Password must contain at least one lowercase letter";
  if (!/\d/.test(password)) return "Password must contain at least one number";
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return "Password must contain at least one special character";
  return null;
}

export async function getSessionWithToken(db: Db, token: string): Promise<{ user: User, session: Session } | null> {
  const sessions = await db
    .select()
    .from(sessionsTable)
    .where(eq(sessionsTable.token, token))
    .leftJoin(usersTable, eq(sessionsTable.username, usersTable.username))

  if (sessions.length > 1) {
    throw new Error("Got more than one session with the same token")
  }
  const session = sessions[0];

  if (!session) {
    return null;
  }

  if (session.users === null) {
    return null;
  }

  // idk why it's plural from the response
  return {
    session: session.sessions,
    user: session.users,
  }

}

export async function userExists(db: Db, username: string, email: string): Promise<boolean> {
  const users = await db
    .select()
    .from(usersTable)
    .where(or(eq(usersTable.username, username), eq(usersTable.email, email)));

  return users.length > 0;
}

export async function createUser(db: Db, username: string, email: string, hashedPassword: string, autoVerify: boolean = false): Promise<User> {
  const newUser = await db
    .insert(usersTable)
    .values({
      username,
      email,
      hashedPassword,
      verified: autoVerify,
    })
    .returning();

  await db
    .insert(profilesTable)
    .values({
      username,
      centerString: null,
      bio: null
    });

  return newUser[0]!;
}

export async function createSession(db: Db, email: string, password: string): Promise<{ user: User, session: Session } | null> {
  const user = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email))
    .limit(1);

  if (user.length === 0) {
    return null;
  }

  const isValidPassword = await Bun.password.verify(password, user[0]!.hashedPassword);
  if (!isValidPassword) {
    return null;
  }

  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

  const newSession = await db
    .insert(sessionsTable)
    .values({
      token,
      expiresAt,
      username: user[0]!.username
    })
    .returning();

  return {
    user: user[0]!,
    session: newSession[0]!,
  };
}



export async function deleteSesssion(db: Db, sessionToken: string) {
  await db
    .delete(sessionsTable)
    .where(eq(sessionsTable.token, sessionToken));
}

export async function createResetToken(db: Db, email: string): Promise<string | null> {
  const users = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email))

  if (users.length !== 1) {
    return null;
  }

  const user = users[0];


  const existing = await db
    .select()
    .from(resetTable)
    .where(eq(resetTable.username, user.username))

  if (existing.length > 0) {
    return null;
  }

  const token = randomResetToken();
  const expires = Date.now() + 3600 * 1000 * 2;

  await db
    .insert(resetTable)
    .values({
      id: randomUUIDv7(),
      username: user.username,
      expiresAt: new Date(expires),
      key: token,
    });

  return token;
}

export async function validateResetToken(db: Db, token: string): Promise<string | null> {
  const tokens = await db
    .select()
    .from(resetTable)
    .where(eq(resetTable.key, token))

  console.log(token);
  console.log(tokens);

  if (tokens.length !== 1) {
    return null
  }
  const user = tokens[0].username;
  const expires = tokens[0].expiresAt;

  if (expires.valueOf() < Date.now()) {
    return null;
  }

  await db
    .delete(resetTable)
    .where(eq(resetTable.key, token))

  return user;
}
export async function resetPassword(db: Db, username: string, hashedPassword: string) {
  await db
    .update(usersTable)
    .set({ hashedPassword: hashedPassword })
    .where(eq(usersTable.username, username))

  // if we reset a password, it's probably prudent to invalidate all
  // sessions.
  await db
    .delete(sessionsTable)
    .where(eq(sessionsTable.username, username))
}


function randomResetToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}



