import { useState } from 'react';
import type { Rule } from '@/engine';
import { RulesetCreator } from './RulesetCreator';
import { validateRuleset } from '@/engine/logic';

interface CreateGameFormProps {
  onCreateGame?: (ruleset: Rule[], maxPlayers: number, password?: string) => void;
}

export function CreateGameForm({ onCreateGame }: CreateGameFormProps) {
  const [isPrivate, setIsPrivate] = useState(false);
  const [password, setPassword] = useState('');
  const [ruleset, setRuleset] = useState<Rule[]>([]);
  const [maxPlayers, setMaxPlayers] = useState(10);

  const validationError = validateRuleset(ruleset, maxPlayers);
  const isFormValid = validationError === true;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validationError === true && onCreateGame) {
      onCreateGame(ruleset, maxPlayers, isPrivate ? password.trim() : undefined);
    }
  };

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title">Create Game</h2>
        <p className="text-sm text-base-content/70 mb-4">
          Set up a new Avalon game with your preferred rules
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="form-control">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                className="checkbox checkbox-primary"
                checked={isPrivate}
                onChange={(e) => setIsPrivate(e.target.checked)}
              />
              <span className="label-text">Private Game</span>
            </label>
          </div>

          {isPrivate && (
            <div className="form-control">
              <label className="label">
                <span className="label-text">Password</span>
              </label>
              <input
                type="password"
                placeholder="Enter game password"
                className="input input-bordered"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          )}

          <div className="form-control">
            <label className="label">
              <span className="label-text">Max Players</span>
            </label>
            <input
              type="number"
              min="5"
              max="10"
              className="input input-bordered"
              value={maxPlayers}
              onChange={(e) => setMaxPlayers(Number(e.target.value))}
            />
          </div>

          <div>
            <RulesetCreator onRulesetChange={setRuleset} />
          </div>

          <div className={isFormValid ? "text-success" : "text-error"}>
            {isFormValid ? `Valid ruleset for ${maxPlayers} players` : validationError}
          </div>

          <button
            type="submit"
            className={`btn btn-primary w-full ${!isFormValid ? 'btn-disabled' : ''}`}
            disabled={!isFormValid}
          >
            Create Game
          </button>
        </form>
      </div>
    </div>
  );
}
