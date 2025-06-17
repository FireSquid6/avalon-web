import { useState } from "react";
import type { RulesetModifiaction } from "engine/actions";
import type { Rule } from "engine";
import { Modal } from "../Modal";

const availableRules: Rule[] = [
  "Lady of the Lake",
  "Oberon", 
  "Morgause",
  "Mordred",
  "Percival and Morgana",
  "Excalibur",
  "Quickshot Assassin",
  "Visible Teammate Roles",
  "Lancelot",
  "Targeting"
];

interface RulesetModificationActionProps {
  onAction: (action: RulesetModifiaction) => void;
  currentRuleset: Rule[];
  currentMaxPlayers: number;
  disabled?: boolean;
}

export function RulesetModificationActionComponent({ 
  onAction, 
  currentRuleset, 
  currentMaxPlayers,
  disabled = false 
}: RulesetModificationActionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRules, setSelectedRules] = useState<Rule[]>(currentRuleset);
  const [maxPlayers, setMaxPlayers] = useState(currentMaxPlayers);

  const handleRuleToggle = (rule: Rule) => {
    setSelectedRules(prev => {
      if (prev.includes(rule)) {
        return prev.filter(r => r !== rule);
      } else {
        return [...prev, rule];
      }
    });
  };

  const handleSave = () => {
    onAction({ 
      kind: "ruleset", 
      ruleset: selectedRules, 
      maxPlayers 
    });
    setIsModalOpen(false);
  };

  const handleClose = () => {
    setSelectedRules(currentRuleset);
    setMaxPlayers(currentMaxPlayers);
    setIsModalOpen(false);
  };

  return (
    <>
      <button
        className="btn btn-secondary"
        onClick={() => setIsModalOpen(true)}
        disabled={disabled}
      >
        Modify Ruleset
      </button>

      <Modal
        isOpen={isModalOpen}
        onClose={handleClose}
        title="Game Settings"
        position="center"
        className="max-w-2xl"
      >
        <div className="flex flex-col gap-6">
          <div>
            <label className="label">
              <span className="label-text font-semibold">Max Players</span>
            </label>
            <input
              type="number"
              className="input input-bordered w-full"
              value={maxPlayers}
              onChange={(e) => setMaxPlayers(Number(e.target.value))}
              min={5}
              max={10}
            />
          </div>

          <div>
            <label className="label">
              <span className="label-text font-semibold">Game Rules</span>
            </label>
            <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto">
              {availableRules.map(rule => (
                <label key={rule} className="label cursor-pointer justify-start gap-3">
                  <input
                    type="checkbox"
                    className="checkbox"
                    checked={selectedRules.includes(rule)}
                    onChange={() => handleRuleToggle(rule)}
                  />
                  <span className="label-text">{rule}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <button
              className="btn btn-outline"
              onClick={handleClose}
            >
              Cancel
            </button>
            <button
              className="btn btn-primary"
              onClick={handleSave}
            >
              Save Settings
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
