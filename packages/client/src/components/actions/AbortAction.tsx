import type { AbortGameAction } from "engine/actions";

interface AbortGameProps {
  onAction: (action: AbortGameAction) => void;
  disabled?: boolean;
}

export function AbortGame({ onAction, disabled = false }: AbortGameProps) {
  const handleStart = () => {
    onAction({ kind: "abort" });
  };

  return (
    <button
      className="btn btn-error"
      onClick={handleStart}
      disabled={disabled}
    >
      Abort Game
    </button>
  );
}
