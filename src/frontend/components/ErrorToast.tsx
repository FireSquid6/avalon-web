import { useAtom } from "jotai";
import { useEffect } from "react";
import { errorAtom, toastAtom } from "../lib/errors";

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

export function MessageToast() {
  const [message, setMessage] = useAtom(toastAtom);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message, setMessage]);

  if (!message) return null;
  return (
    <div className="toast toast-bottom toast-center z-50">
      <div className="alert alert-success">
        <div className="flex-1">
          <div className="flex flex-col">
            <span className="text-sm">{message}</span>
          </div>
        </div>
        <button
          className="btn btn-sm btn-circle btn-ghost"
          onClick={() => setMessage(null)}
        >
          ✕
        </button>
      </div>
    </div>
  );
}
