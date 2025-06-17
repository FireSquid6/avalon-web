import { useNavigate } from "@tanstack/react-router"
import { atom, useAtom } from "jotai";

export const errorAtom = atom<Error | null>(null);


export function usePushError() {
  const navigate = useNavigate();
  const [_, setError] = useAtom(errorAtom);

  return (err: Error, redirectTo?: string) => {
    // TODO - display the error better
    console.error(err);
    setError(err);

    if (redirectTo) {
      navigate({
        to: redirectTo,
      });
    }
  }
}
