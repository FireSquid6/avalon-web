import { GameState, Knowledge } from ".";
import { GameAction } from "./actions";

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

export interface ProcessInputs<T extends GameAction> {
  state: GameState,
  knowledge: Record<string, Knowledge[]>,
  action: T,
  actorId: string,
}

export function processAction<T extends GameAction>(inputs: ProcessInputs<T>): ProcessResult {
  try {
    const mutableInputs: ProcessInputs<T> = {
      state: structuredClone(inputs.state),
      knowledge: structuredClone(inputs.knowledge),
      actorId: inputs.actorId,
      action: inputs.action,
    }

    // do stuff to the state

    return new ActionResult(mutableInputs.state, mutableInputs.knowledge);
  } catch (e) {
    if (e instanceof ProcessError) {
      return e;
    }
    return new ProcessError("server", e);
  }
}
