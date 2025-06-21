import type { ServerWebSocket } from "bun";
import type { Config } from "./config";
import { GameObserver } from "./game";
import type { Session, User } from "./db/schema";
import { messageSchema, socketFailure, socketInfo } from "./protocol";
import { makeListener } from "./game";
import type { GameListener } from "./game";

export interface SocketContext {
  config: Config;
  observer: GameObserver;
}

export interface WsData {
  user: User;
  session: Session;
  id: string;
}


export async function handleMessage(ctx: SocketContext, ws: ServerWebSocket<WsData>, rawMessage: string) {
  try {
    const { user } = ws.data;
    const observer = ctx.observer;

    const message = messageSchema.parse(JSON.parse(rawMessage));
    console.log("Recieved", message);

    const state = await observer.peek(message.gameId);

    if (state === undefined) {
      ws.send(socketFailure(`Game ${message.gameId} not found`));
      return;
    }


    if (message.action === "subscribe") {
      const listener: GameListener = makeListener(user, ws);
      observer.subscribe(message.gameId, ws.data.id, listener);

      ws.send(socketInfo(`Subscribed to ${message.gameId}`))
    } else if (message.action === "unsubscribe") {
      observer.unsubscribe(user.username, message.gameId);

      ws.send(socketInfo(`Unsubscribed from ${message.gameId}`))
    }
  } catch (e) {
    console.log("Unexpected error:", e);
  }

}


export async function handleClose(ctx: SocketContext, ws: ServerWebSocket<WsData>) {
  console.log("Closed connection:", ws.data.id);
  const observer = ctx.observer;
  observer.unsubscribeListener(ws.data.id);
}
