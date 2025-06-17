import { useContext, createContext } from "react";
import type { GameData } from "../lib/game";
import type { GameState, Knowledge } from "engine";
import type { GameAction } from "engine/actions";

const gameContext = createContext<GameContext | null>(null);

export interface GameContext {
  state: GameState;
  knowledge: Knowledge[];
  viewingUser: string;
  act: (action: GameAction) => void;
}


export function useGameContext(): GameData {
  const data = useContext(gameContext);

  if (data === null) {
    throw new Error("Tried to use null game data");
  }

  return data;
}


export function GameContextProvider(props: { data: GameContext, children: React.ReactNode}) {
  return (
    <gameContext.Provider value={props.data}>
      {props.children}
    </gameContext.Provider>
  )

}
