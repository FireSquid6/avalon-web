import { getBlankState, insertPlayer } from "@/engine/logic";
import { GameContextProvider } from "../GameContext";
import { GameRender } from "../game/index";
import type { GameState } from "@/engine";
import { useEffect, useState } from "react";
import type { GameAction } from "@/engine/actions";
import { processAction, ProcessError } from "@/engine/process";
import { viewStateAs } from "@/engine/view";

function getInitialState(players: string[]): GameState {
  const state = getBlankState("id", players[0]!, ["Percival and Morgana", "Mordred", "Quickshot Assassin"], 8);

  for (const p of players) {
    insertPlayer(state, {
      id: p,
      displayName: p,
    });
  }
  return state;
}

export interface ScriptedAction {
  actorId: string;
  action: GameAction;
}

export type ScriptedActionGenerator = {
  delay: number;
  generator: (state: GameState) => ScriptedAction[] | ScriptedAction;
}

export function Demo({ actions, players }: { actions: ScriptedActionGenerator[], players: string[] }) {
  const [state, setState] = useState(getInitialState(players));
  const [actionIndex, setActionIndex] = useState<number>(0);

  const applyActions = (actions: ScriptedAction[]) => {
    let newState = state;
    for (const { action, actorId } of actions) {
      const result = processAction({
        state: newState,
        action,
        actorId,
      });

      if (result instanceof ProcessError) {
        console.log(result.reason);
        return;
      }
      newState = result;
    }
    setState(newState);
  }

  useEffect(() => {
    const script = actions[actionIndex].generator(state);
    setTimeout(() => {
      applyActions(Array.isArray(script) ? script : [script]);

      if (actionIndex < actions.length - 1) {
        setActionIndex(actionIndex + 1);
      }
    }, actions[actionIndex].delay);
  }, [actionIndex])

  const view = viewStateAs(state, "anonymous");

  return (
    <GameContextProvider data={{
      knowledge: [],
      state: view,
      viewingUser: "anonymous",
      act: () => { },
      chat: () => { },
      messages: [],
    }}>
      <GameRender displayOnly={true} />
    </GameContextProvider>
  )
}

