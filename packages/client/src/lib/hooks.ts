import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import type { GameInfo } from "engine";
import useSWR from "swr";
import { usePushError } from "./errors";
import { treaty } from "./treaty";

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

export function useAuth() {
  const [state, setState] = useState<AuthState>(getAuthState());

  useEffect(() => {
    setState(getAuthState());
    
  }, [])

  return state;

}



export function useAvailableGames(): GameInfo[] {
  const pushError = usePushError();
  const fetcher = async () => {
    const { data, error } = await treaty.opengames.get();

    if (error !== null){
      throw new Error(`Error fetching open games: ${error.status} - ${error.result}`)
    }

    return data as GameInfo[];
  }

  const { data, error } = useSWR("/opengames", fetcher);

  if (error) {
    pushError(error instanceof Error ? error : new Error(`Unkown error: ${error}`));
  }

  return data ?? [];
}
