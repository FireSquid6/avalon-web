import type { LeaveGameAction } from "@/engine/actions";
import { useNavigate } from "@tanstack/react-router";

interface LeaveGameProps {
  onAction: (action: LeaveGameAction) => void;
  disabled?: boolean;
}

export function LeaveGameActionComponent({ onAction, disabled = false }: LeaveGameProps) {
  const navigate = useNavigate();
  const handleStart = () => {
    onAction({ kind: "leave" });
    navigate({
      to: "/play",
    });
  };

  return (
    <button
      className="btn btn-error"
      onClick={handleStart}
      disabled={disabled}
    >
      Leave Game
    </button>
  );
}
