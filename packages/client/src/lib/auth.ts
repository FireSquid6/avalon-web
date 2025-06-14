import { treaty } from "./treaty";

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
