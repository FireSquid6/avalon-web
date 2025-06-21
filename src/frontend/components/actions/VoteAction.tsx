import { useState } from "react";
import type { VoteAction } from "@/engine/actions";
import { Modal } from "../Modal";

interface VoteActionProps {
  onAction: (action: VoteAction) => void;
  disabled?: boolean;
}

export function VoteActionComponent({ onAction, disabled = false }: VoteActionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleVote = (vote: "Approve" | "Reject") => {
    onAction({ kind: "vote", vote });
    setIsModalOpen(false);
  };

  return (
    <>
      <button
        className="btn btn-primary"
        onClick={() => setIsModalOpen(true)}
        disabled={disabled}
      >
        Vote
      </button>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Cast Your Vote"
        position="center"
      >
        <div className="flex flex-col gap-4">
          <p className="text-center">How do you vote on this quest team?</p>
          <div className="flex gap-4 justify-center">
            <button
              className="btn btn-success"
              onClick={() => handleVote("Approve")}
            >
              Approve
            </button>
            <button
              className="btn btn-error"
              onClick={() => handleVote("Reject")}
            >
              Reject
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
