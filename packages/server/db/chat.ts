import { randomUUIDv7 } from "bun";
import type { Db } from "./index";
import { chatMessages, type Message } from "./schema";
import { eq, desc } from "drizzle-orm";


export async function createMessage(db: Db, gameId: string, username: string, content: string): Promise<Message> {
  const id = randomUUIDv7();
  const message: Message = {
    id,
    gameId,
    userId: username,
    sent: new Date(),
    content,
  }
  
  await db
    .insert(chatMessages)
    .values(message);

  return message;
}


export async function lastNMessages(db: Db, gameId: string, n: number = 250) {
  return await db
    .select()
    .from(chatMessages)
    .where(eq(chatMessages.gameId, gameId))
    .orderBy(desc(chatMessages.sent))
    .limit(n)
}
