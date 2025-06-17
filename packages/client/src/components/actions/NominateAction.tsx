import { useState } from "react";
import type { NominateAction } from "engine/actions";
import type { Player } from "engine";
import { Modal } from "../Modal";

interface NominateActionProps {
  onAction: (action: NominateAction) => void;
  players: Player[];
  requiredCount: number;
  disabled?: boolean;
}

export function NominateActionComponent({ 
  onAction, 
  players, 
  requiredCount, 
  disabled = false 
}: NominateActionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<string[]>([]);

  const handlePlayerToggle = (playerId: string) => {
    setSelectedPlayerIds(prev => {
      if (prev.includes(playerId)) {
        return prev.filter(id => id !== playerId);
      } else if (prev.length < requiredCount) {
        return [...prev, playerId];
      }
      return prev;
    });
  };

  const handleNominate = () => {
    if (selectedPlayerIds.length === requiredCount) {
      onAction({ kind: "nominate", playerIds: selectedPlayerIds });
      setSelectedPlayerIds([]);
      setIsModalOpen(false);
    }
  };

  const handleClose = () => {
    setSelectedPlayerIds([]);
    setIsModalOpen(false);
  };

  return (
    <>
      <button
        className="btn btn-primary"
        onClick={() => setIsModalOpen(true)}
        disabled={disabled}
      >
        Nominate Team
      </button>

      <Modal
        isOpen={isModalOpen}
        onClose={handleClose}
        title={`Nominate ${requiredCount} Players for Quest`}
        position="center"
      >
        <div className="flex flex-col gap-4">
          <p className="text-center">
            Select {requiredCount} players for the quest team 
            ({selectedPlayerIds.length}/{requiredCount} selected)
          </p>
          
          <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
            {players.map(player => (
              <button
                key={player.id}
                className={`btn ${
                  selectedPlayerIds.includes(player.id) 
                    ? 'btn-success' 
                    : 'btn-outline'
                }`}
                onClick={() => handlePlayerToggle(player.id)}
                disabled={
                  !selectedPlayerIds.includes(player.id) && 
                  selectedPlayerIds.length >= requiredCount
                }
              >
                {player.displayName}
              </button>
            ))}
          </div>

          <div className="flex gap-2 justify-center">
            <button
              className="btn btn-primary"
              onClick={handleNominate}
              disabled={selectedPlayerIds.length !== requiredCount}
            >
              Nominate Team
            </button>
            <button
              className="btn btn-outline"
              onClick={handleClose}
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
