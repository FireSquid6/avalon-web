import { useAtom } from "jotai";
import { useEffect } from "react";
import { errorAtom } from "../lib/errors";

export function ErrorToast() {
  const [error, setError] = useAtom(errorAtom);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [error, setError]);

  if (!error) return null;

  return (
    <div className="toast toast-bottom toast-center z-50">
      <div className="alert alert-error">
        <div className="flex-1">
          <div className="flex flex-col">
            <span className="font-semibold">Error</span>
            <span className="text-sm">{error.message}</span>
          </div>
        </div>
        <button 
          className="btn btn-sm btn-circle btn-ghost"
          onClick={() => setError(null)}
        >
          ✕
        </button>
      </div>
    </div>
  );
}
