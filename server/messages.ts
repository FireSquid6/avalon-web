import { z } from "zod"
import { GameState, gameStateSchema, Knowledge, knowledgeSchema } from "../../engine";

export const messageSchema = z.object({
  playerId: z.string(),
  gameId: z.string(),
  action: z.enum(["subscribe", "unsubscribe"]),
});
export type SocketMessage = z.infer<typeof messageSchema>;

export function makeMessage(msg: SocketMessage): string {
  return JSON.stringify(msg);
}

export const infoResponseSchema = z.object({
  type: z.literal("info"),
  result: z.enum(["success", "failure"]),
  message: z.string(),
});

export const stateResponseSchema = z.object({
  type: z.literal("state"),
  state: gameStateSchema,
  knowledge: z.array(knowledgeSchema),
});


export const responseSchema = z.discriminatedUnion("type", [
  stateResponseSchema,
  infoResponseSchema,
]);

export type SocketResponse = z.infer<typeof responseSchema>;

export function socketFailure(message: string): string {
  const res: SocketResponse = {
    type: "info",
    result: "failure",
    message,
  }

  return JSON.stringify(res);
}

export function socketInfo(message: string): string {
  const res: SocketResponse = {
    type: "info",
    result: "success",
    message,
  }

  return JSON.stringify(res);
}

export function stateResponse(state: GameState, knowledge: Knowledge[]) {
  const res: SocketResponse = {
    type: "state",
    knowledge,
    state,
  }

  return JSON.stringify(res);
}
