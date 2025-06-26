import { client } from "./game";
import { treaty } from "./treaty";

export async function createUser(username: string, email: string, password: string): Promise<Error | "OK"> {
  const { error } = await treaty.api.users.post({
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
  const { error } = await treaty.api.sessions.post({ email, password });

  if (error !== null) {
    return new Error(`Error logging in: ${error.status} - ${error.value}`);
  }

  console.log("Calling reconnect function");
  client.reconnect();

  return "OK"

}

export async function logout(): Promise<Error | "OK"> {
  const { error } = await treaty.api.signout.post();

  if (error !== null) {
    return new Error(`Error signing out: ${error.status} - ${error.value}`);
  }

  console.log("Calling reconnect function");
  client.reconnect();
  return "OK";
}

