import { useState } from "react";
import type { GameAction } from "engine/actions";
import { ruleEnum } from "engine";

export function DebugActions({ act }: { act: (a: GameAction) => void }) {
  const [selectedAction, setSelectedAction] = useState<string>("vote");
  const [voteChoice, setVoteChoice] = useState<"Approve" | "Reject">("Approve");
  const [questChoice, setQuestChoice] = useState<"Fail" | "Succeed">("Succeed");
  const [playerIds, setPlayerIds] = useState<string>("");
  const [playerId, setPlayerId] = useState<string>("");
  const [maxPlayers, setMaxPlayers] = useState<number>(5);
  const [selectedRules, setSelectedRules] = useState<string[]>([]);

  const handleRuleToggle = (rule: string) => {
    setSelectedRules(prev => 
      prev.includes(rule) 
        ? prev.filter(r => r !== rule)
        : [...prev, rule]
    );
  };

  const handleSubmit = () => {
    let action: GameAction;
    
    switch (selectedAction) {
      case "vote":
        action = { kind: "vote", vote: voteChoice };
        break;
      case "quest":
        action = { kind: "quest", action: questChoice };
        break;
      case "nominate":
        action = { 
          kind: "nominate", 
          playerIds: playerIds.split(",").map(id => id.trim()).filter(id => id.length > 0)
        };
        break;
      case "lady":
        action = { kind: "lady", playerId };
        break;
      case "assassinate":
        action = { kind: "assassinate", playerId };
        break;
      case "start":
        action = { kind: "start" };
        break;
      case "ruleset":
        action = { 
          kind: "ruleset", 
          ruleset: selectedRules as any[], 
          maxPlayers 
        };
        break;
      default:
        return;
    }
    
    act(action);
  };

  return (
    <div className="card bg-base-200 p-4 m-4">
      <h3 className="text-lg font-bold mb-4">Debug Actions</h3>
      
      <div className="form-control mb-4">
        <label className="label">
          <span className="label-text">Action Type</span>
        </label>
        <select 
          className="select select-bordered"
          value={selectedAction}
          onChange={(e) => setSelectedAction(e.target.value)}
        >
          <option value="vote">Vote</option>
          <option value="quest">Quest</option>
          <option value="nominate">Nominate</option>
          <option value="lady">Lady of the Lake</option>
          <option value="assassinate">Assassinate</option>
          <option value="start">Start Game</option>
          <option value="ruleset">Modify Ruleset</option>
        </select>
      </div>

      {selectedAction === "vote" && (
        <div className="form-control mb-4">
          <label className="label">
            <span className="label-text">Vote</span>
          </label>
          <select 
            className="select select-bordered"
            value={voteChoice}
            onChange={(e) => setVoteChoice(e.target.value as "Approve" | "Reject")}
          >
            <option value="Approve">Approve</option>
            <option value="Reject">Reject</option>
          </select>
        </div>
      )}

      {selectedAction === "quest" && (
        <div className="form-control mb-4">
          <label className="label">
            <span className="label-text">Quest Action</span>
          </label>
          <select 
            className="select select-bordered"
            value={questChoice}
            onChange={(e) => setQuestChoice(e.target.value as "Fail" | "Succeed")}
          >
            <option value="Succeed">Succeed</option>
            <option value="Fail">Fail</option>
          </select>
        </div>
      )}

      {selectedAction === "nominate" && (
        <div className="form-control mb-4">
          <label className="label">
            <span className="label-text">Player IDs (comma-separated)</span>
          </label>
          <input 
            type="text" 
            className="input input-bordered"
            value={playerIds}
            onChange={(e) => setPlayerIds(e.target.value)}
            placeholder="player1,player2,player3"
          />
        </div>
      )}

      {(selectedAction === "lady" || selectedAction === "assassinate") && (
        <div className="form-control mb-4">
          <label className="label">
            <span className="label-text">Player ID</span>
          </label>
          <input 
            type="text" 
            className="input input-bordered"
            value={playerId}
            onChange={(e) => setPlayerId(e.target.value)}
            placeholder="player1"
          />
        </div>
      )}

      {selectedAction === "ruleset" && (
        <div className="mb-4">
          <div className="form-control mb-2">
            <label className="label">
              <span className="label-text">Max Players</span>
            </label>
            <input 
              type="number" 
              className="input input-bordered"
              value={maxPlayers}
              onChange={(e) => setMaxPlayers(parseInt(e.target.value))}
              min="5"
              max="10"
            />
          </div>
          
          <div className="form-control">
            <label className="label">
              <span className="label-text">Rules</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {ruleEnum.options.map(rule => (
                <label key={rule} className="cursor-pointer label">
                  <input
                    type="checkbox"
                    className="checkbox checkbox-sm"
                    checked={selectedRules.includes(rule)}
                    onChange={() => handleRuleToggle(rule)}
                  />
                  <span className="label-text text-sm ml-2">{rule}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}

      <button 
        className="btn btn-primary"
        onClick={handleSubmit}
      >
        Execute Action
      </button>
    </div>
  );
}
