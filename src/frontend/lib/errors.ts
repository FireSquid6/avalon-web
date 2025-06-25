import { atom, useAtom } from "jotai";

export const errorAtom = atom<Error | null>(null);
export const toastAtom = atom<string | null>(null);


export function usePushError() {
  const [_, setError] = useAtom(errorAtom);

  return (err: Error) => {
    console.error(err);
    setError(err);

  }
}

export function usePushMessage() {
  const [_, setMessage] = useAtom(toastAtom);

  return (s: string) => {
    setMessage(s);
  }
}
