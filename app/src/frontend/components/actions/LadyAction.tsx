import { useState } from "react";
import type { LadyAction } from "@/engine/actions";
import type { Player } from "@/engine";
import { Modal } from "../Modal";

interface LadyActionProps {
  onAction: (action: LadyAction) => void;
  players: Player[];
  disabled?: boolean;
}

export function LadyActionComponent({ onAction, players, disabled = false }: LadyActionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleLady = (playerId: string) => {
    onAction({ kind: "lady", playerId });
    setIsModalOpen(false);
  };

  return (
    <>
      <button
        className="btn btn-primary"
        onClick={() => setIsModalOpen(true)}
        disabled={disabled}
      >
        Use Lady of the Lake
      </button>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Lady of the Lake"
        position="center"
      >
        <div className="flex flex-col gap-4">
          <p className="text-center">Choose a player to investigate with the Lady of the Lake</p>
          
          <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
            {players.map(player => (
              <button
                key={player.id}
                className="btn btn-outline"
                onClick={() => handleLady(player.id)}
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
