import { useState } from "react";
import type { AssassinationAction } from "@/engine/actions";
import type { Player } from "@/engine";
import { Modal } from "../Modal";

interface AssassinateActionProps {
  onAction: (action: AssassinationAction) => void;
  players: Player[];
  disabled?: boolean;
}

export function AssassinateActionComponent({ onAction, players, disabled = false }: AssassinateActionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAssassinate = (playerId: string) => {
    onAction({ kind: "assassinate", playerId });
    setIsModalOpen(false);
  };

  return (
    <>
      <button
        className="btn btn-error"
        onClick={() => setIsModalOpen(true)}
        disabled={disabled}
      >
        Assassinate
      </button>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Assassinate Merlin"
        position="center"
      >
        <div className="flex flex-col gap-4">
          <p className="text-center text-error font-semibold">
            Choose who you believe is Merlin to win the game for Evil!
          </p>
          
          <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
            {players.map(player => (
              <button
                key={player.id}
                className="btn btn-error btn-outline"
                onClick={() => handleAssassinate(player.id)}
              >
                {player.displayName}
              </button>
            ))}
          </div>

          <button
            className="btn btn-outline"
            onClick={() => setIsModalOpen(false)}
          >
            Cancel
          </button>
        </div>
      </Modal>
    </>
  );
}
