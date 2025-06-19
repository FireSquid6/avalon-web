import Cookies from "js-cookie";
import { treaty } from "./treaty";
import { getAuthState } from "./hooks";

export async function createUser(username: string, email: string, password: string): Promise<Error | "OK"> {
  const { error } = await treaty.users.post({
    username,
    password,
    email,
  })

  if (error !== null) {
    return new Error(`Error creating user: ${error.status} - ${error.value}`);
  }

  return "OK"
}

export async function login(email: string, password: string): Promise<Error | "OK"> {
  console.log(document.cookie);
  const { error, data } = await treaty.sessions.post({ email, password });

  if (error !== null) {
    return new Error(`Error logging in: ${error.status} - ${error.value}`);
  }

  console.log(data);
  console.log(document.cookie);

  return "OK"

}

export async function logout(): Promise<Error | "OK"> {
  const state = getAuthState();

  // we're already logged out (this is necessary to ensure idempotency)
  if (state.type === "unauthenticated") {
    return "OK";
  }

  const { error } = await treaty.signout.post();

  if (error !== null) {
    return new Error(`Error signing out: ${error.status} - ${error.value}`);
  }

  Cookies.remove("username");
  Cookies.remove("auth");

  return "OK";
}

export function getAuthToken(): string | undefined {
  return Cookies.get("auth");
}
