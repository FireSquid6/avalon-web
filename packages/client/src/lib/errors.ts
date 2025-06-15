import { useNavigate } from "@tanstack/react-router"


export function usePushError() {
  const navigate = useNavigate();

  return (err: Error, redirectTo?: string) => {
    // TODO - display the error better
    console.error(err);

    if (redirectTo) {
      navigate({
        to: redirectTo,
      });
    }
  }
}

