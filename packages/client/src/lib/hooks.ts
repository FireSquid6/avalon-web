import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import type { GameInfo } from "engine";
import useSWR from "swr";
import { usePushError } from "./errors";
import { treaty } from "./treaty";
import { client, type GameData } from "./game";
import type { GameAction } from "engine/actions";
import type { Message } from "server/db/schema";
import { useRouter } from "@tanstack/react-router";

export interface AuthenticatedState {
  type: "authenticated";
  username: string;
}

export interface UnauthenticatedState {
  type: "unauthenticated";
}

export type AuthState = AuthenticatedState | UnauthenticatedState;

export function getAuthState(): AuthState {
  const authenticated = Cookies.get("auth") !== undefined;
  const username = Cookies.get("username")

  return (authenticated && username !== undefined) ? {
    type: "authenticated",
    username: username,
  } : {
    type: "unauthenticated",
  }
}

// we have to manually use "mutate" after we mutate the auth
// status to let it know that something changed. This is kinda
// terrible but not that big of a deal.
export function useAuth() {
  const [state, setState] = useState<AuthState>(getAuthState());
  const router = useRouter();

  const fn = () => {
    const state = getAuthState();
    setState(state);
  }


  useEffect(() => {
    fn();
    const unsubscribe = router.subscribe("onBeforeLoad", () => {
      fn();
    });

    return unsubscribe;
  }, [router])

  const mutate = () => {
    fn();
  }

  return { state, mutate };

}

export function useAvailableGames(): GameInfo[] {
  const pushError = usePushError();
  const fetcher = async () => {
    const { data, error } = await treaty.opengames.get();

    if (error !== null) {
      throw new Error(`Error fetching open games: ${error.status} - ${error.value}`)
    }

    return data as GameInfo[];
  }

  const { data, error } = useSWR("/opengames", fetcher);

  if (error) {
    pushError(error instanceof Error ? error : new Error(`Unkown error: ${error}`));
  }

  return data ?? [];
}


export function useJoinedGames(): GameInfo[] {
  const pushError = usePushError();
  const fetcher = async () => {
    const { data, error } = await treaty.joinedgames.get();

    if (error !== null) {
      throw new Error(`Error fetching joined games: ${error.status} - ${error.value}`)
    }

    return data as GameInfo[];
  }

  const { data, error } = useSWR("/joinedgames", fetcher);

  if (error) {
    pushError(error instanceof Error ? error : new Error(`Unkown error: ${error}`));
  }

  return data ?? [];
}


interface GameSubscriptionResponse {
  data: GameData;
  connected: boolean;
  act: (action: GameAction) => void;
  chat: (content: string) => void;
  messages: Message[];

}

export function useGameSubscription(gameId: string): GameSubscriptionResponse {
  const [data, setData] = useState<GameData>(client.peekStateOrBlank(gameId));
  const [connected, setConnected] = useState<boolean>(client.peekConnected());
  const [messages, setMessages] = useState<Message[]>(client.peekChat(gameId));
  const pushError = usePushError();

  useEffect(() => {
    client.subscribeToGame(gameId);

    const unlisten = client.listen((e) => {
      switch (e.type) {
        case "active":
          setConnected(e.active);
          break;
        case "error":
          pushError(e.error);
          break;
        case "state": 
          setData(e.data);
          break;
        case "chat":
          setMessages(e.chats);
          break;
      }

    })
    return unlisten;
  }, [])

  const act = (action: GameAction) => {
    client.act(gameId, action);
  }

  const chat = async (content: string) => {
    await treaty.games({ id: gameId }).chat.post({
      message: content,
    });
  }

  return {
    data,
    connected,
    messages,
    act,
    chat,
  }

}

export interface ScreenSize {
  width: number;
  height: number;
}

export function useScreenSize(): ScreenSize {
  const [screenSize, setScreenSize] = useState<ScreenSize>({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  useEffect(() => {
    const handleResize = () => {
      setScreenSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    
    // Call handler right away so state gets updated with initial window size
    handleResize();

    // Remove event listener on cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return screenSize;
}

