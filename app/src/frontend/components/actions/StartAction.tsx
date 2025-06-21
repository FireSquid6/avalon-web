import type { StartAction } from "@/engine/actions";

interface StartActionProps {
  onAction: (action: StartAction) => void;
  disabled?: boolean;
}

export function StartActionComponent({ onAction, disabled = false }: StartActionProps) {
  const handleStart = () => {
    onAction({ kind: "start" });
  };

  return (
    <button
      className="btn btn-success"
      onClick={handleStart}
      disabled={disabled}
    >
      Start Game
    </button>
  );
}
