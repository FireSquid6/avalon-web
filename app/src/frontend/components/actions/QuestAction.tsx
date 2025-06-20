import { useState } from "react";
import type { QuestAction } from "engine/actions";
import { Modal } from "../Modal";

interface QuestActionProps {
  onAction: (action: QuestAction) => void;
  disabled?: boolean;
}

export function QuestActionComponent({ onAction, disabled = false }: QuestActionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleQuest = (action: "Fail" | "Succeed") => {
    onAction({ kind: "quest", action });
    setIsModalOpen(false);
  };

  return (
    <>
      <button
        className="btn btn-primary"
        onClick={() => setIsModalOpen(true)}
        disabled={disabled}
      >
        Quest Action
      </button>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Choose Quest Action"
        position="center"
      >
        <div className="flex flex-col gap-4">
          <p className="text-center">How do you want to contribute to this quest?</p>
          <div className="flex gap-4 justify-center">
            <button
              className="btn btn-success"
              onClick={() => handleQuest("Succeed")}
            >
              Succeed
            </button>
            <button
              className="btn btn-error"
              onClick={() => handleQuest("Fail")}
            >
              Fail
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
