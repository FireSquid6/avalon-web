import { atom, useAtom } from "jotai";
export const errorAtom = atom<Error | null>(null);


export function usePushError() {
  const [_, setError] = useAtom(errorAtom);

  return (err: Error) => {
    console.error(err);
    setError(err);

  }
}
