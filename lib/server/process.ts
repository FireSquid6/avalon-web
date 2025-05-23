import { GameState, Knowledge } from "../game";
import { GameAction } from "../messages";

export class ProcessError {
  reason: string | Error;
  type: "client" | "server";

  constructor(type: "client" | "server", reason: unknown) {
    this.type = type;
    if (reason instanceof Error) {
      this.reason = reason;
    } else if (typeof reason === "string") {
      this.reason = reason;
    } else {
      this.reason = `Unknown Error: ${reason}`;
    }
  }
}

export class ActionResult {
  newState: GameState;
  newKnowledge: Record<string, Knowledge[]>;

  constructor(state: GameState, knowledge?: Record<string, Knowledge[]>) {
    this.newState = state;

    if (knowledge !== undefined) {
      this.newKnowledge = knowledge;
    } else {
      this.newKnowledge = {};
    }
  }
}

export type ProcessResult = 
  | ProcessError
  | ActionResult

export function processAction(state: GameState, action: GameAction, actorId: string): ProcessResult {
  try {
    return new ActionResult(state);
  } catch (e) {
    return new ProcessError("server", e);
  }
}
