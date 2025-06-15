import { useEffect, useState } from "react";
import Cookies from "js-cookie";

export interface AuthenticatedState {
  type: "authenticated";
  username: string;
}

export interface UnauthenticatedState {
  type: "unauthenticated";
}

export type AuthState = AuthenticatedState | UnauthenticatedState;

function getAuthState(): AuthState {
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


