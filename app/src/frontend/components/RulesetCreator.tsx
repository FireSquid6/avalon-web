import { useState } from 'react';
import type { Rule } from 'engine';

const AVAILABLE_RULES: Rule[] = [
  "Lady of the Lake",
  "Oberon", 
  "Mordred",
  "Percival and Morgana",
  "Quickshot Assassin",
  "Visible Teammate Roles",
];

interface RulesetCreatorProps {
  onRulesetChange: (ruleset: Rule[]) => void;
  initialRuleset?: Rule[];
}

export function RulesetCreator({ onRulesetChange, initialRuleset = [] }: RulesetCreatorProps) {
  const [selectedRules, setSelectedRules] = useState<Set<Rule>>(new Set(initialRuleset));

  const handleRuleToggle = (rule: Rule) => {
    const newSelectedRules = new Set(selectedRules);
    
    if (newSelectedRules.has(rule)) {
      newSelectedRules.delete(rule);
    } else {
      newSelectedRules.add(rule);
    }
    
    setSelectedRules(newSelectedRules);
    onRulesetChange(Array.from(newSelectedRules));
  };

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title">Game Rules</h2>
        <p className="text-sm text-base-content/70 mb-4">
          Select the rules you want to include in your game
        </p>
        
        <div className="space-y-2">
          {AVAILABLE_RULES.map((rule) => (
            <label key={rule} className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                className="checkbox checkbox-primary"
                checked={selectedRules.has(rule)}
                onChange={() => handleRuleToggle(rule)}
              />
              <span className="label-text">{rule}</span>
            </label>
          ))}
        </div>
        
        <div className="mt-4 text-sm text-base-content/50">
          {selectedRules.size} rule{selectedRules.size !== 1 ? 's' : ''} selected
        </div>
      </div>
    </div>
  );
}
