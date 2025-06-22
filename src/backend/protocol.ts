import { z } from "zod"
import { type GameState, gameStateSchema, type Knowledge, knowledgeSchema } from "@/engine";
import type { Message } from "./db/schema";

export const messageSchema = z.object({
  gameId: z.string(),
  action: z.enum(["subscribe", "unsubscribe"]),
});
export type SocketMessage = z.infer<typeof messageSchema>;

export function makeMessage(msg: SocketMessage): string {
  return JSON.stringify(msg);
}

export const stateResponseSchema = z.object({
  type: z.literal("state"),
  state: gameStateSchema,
  knowledge: z.array(knowledgeSchema),
});

export const chatResponseSchema = z.object({
  type: z.literal("chat"),
  message: z.object({
    id: z.string(),
    sent: z.number(),
    content: z.string(),
    userId: z.string(),
    gameId: z.string(),
  })
})


export const responseSchema = z.discriminatedUnion("type", [
  stateResponseSchema,
  chatResponseSchema,
]);

export type SocketResponse = z.infer<typeof responseSchema>;

export function stateResponse(state: GameState, knowledge: Knowledge[]) {
  const res: SocketResponse = {
    type: "state",
    knowledge,
    state,
  }

  return JSON.stringify(res);
}
export function chatResponse(message: Message) {
  const res: SocketResponse = {
    type: "chat",
    message: {
      id: message.id,
      userId: message.userId,
      gameId: message.gameId,
      content: message.content,
      sent: message.sent.valueOf(),
    }
  }

  return JSON.stringify(res);
}
