import { useContext, createContext } from "react";
import type { GameState, Knowledge } from "engine";
import type { GameAction } from "engine/actions";
import type { Message } from "server/db/schema";

const gameContext = createContext<GameContext | null>(null);

export interface GameContext {
  state: GameState;
  knowledge: Knowledge[];
  viewingUser: string;
  act: (action: GameAction) => void;
  chat: (message: string) => void;
  messages: Message[];
}


export function useGameContext(): GameContext {
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
