import { useState } from "react";
import type { Knowledge } from "@/engine";
import { getTeam } from "@/engine/logic";
import { Modal } from "../Modal";

interface KnowledgeModalProps {
  knowledge: Knowledge[];
  viewingUserId: string;
}

export function KnowledgeModal({ knowledge, viewingUserId }: KnowledgeModalProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredKnowledge = knowledge.filter(k => k.playerId !== viewingUserId);
  const selfKnowledge = knowledge.find(k => k.playerId === viewingUserId && k.info.type === "role");
  
  const getSelfRoleText = () => {
    if (!selfKnowledge || selfKnowledge.info.type !== "role") return "You are a spectator";
    return `You are ${selfKnowledge.info.role}`;
  };

  const getSelfRoleColor = () => {
    if (!selfKnowledge || selfKnowledge.info.type !== "role") return "text-gray-500";
    const team = getTeam(selfKnowledge.info.role);
    return team === "Arthurian" ? "text-blue-600" : "text-red-600";
  };

  const formatKnowledge = (k: Knowledge) => {
    const playerName = k.playerId;
    const source = k.source === "lady" ? "Lady of the Lake" : "Initial Knowledge";
    
    let infoText = "";
    switch (k.info.type) {
      case "team":
        infoText = `is on the ${k.info.team} team`;
        break;
      case "role":
        infoText = `is ${k.info.role}`;
        break;
      case "percivalic sight":
        infoText = "appears as a magic user (Merlin/Morgana)";
        break;
    }

    return { playerName, source, infoText };
  };

  const getSourceIcon = (source: string) => {
    return source === "Lady of the Lake" ? "🌊" : "👁️";
  };

  return (
    <>
      <button
        className="btn btn-info"
        onClick={() => setIsModalOpen(true)}
      >
        Secret Knowledge ({filteredKnowledge.length})
      </button>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Your Knowledge"
        position="center"
      >
        <div className="space-y-4">
          <div className="text-center p-3 bg-base-200 rounded-lg">
            <div className={`text-lg font-semibold ${getSelfRoleColor()}`}>
              {getSelfRoleText()}
            </div>
          </div>
          
          {filteredKnowledge.length === 0 ? (
            <p className="text-center text-base-content/60">
              You have no special knowledge.
            </p>
          ) : (
            <div className="space-y-3">
              {filteredKnowledge.map((k, index) => {
                const { playerName, source, infoText } = formatKnowledge(k);
                return (
                  <div
                    key={index}
                    className="card bg-base-200 p-3"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-lg">
                        {getSourceIcon(source)}
                      </span>
                      <div className="flex-1">
                        <div className="font-medium">
                          {playerName} {infoText}
                        </div>
                        <div className="text-sm text-base-content/60 mt-1">
                          Source: {source}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Modal>
    </>
  );
}
