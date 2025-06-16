import { useState } from 'react';

interface JoinGameFormProps {
  onJoinGame?: (gameId: string, password: string) => void;
}

export function JoinGameForm({ onJoinGame }: JoinGameFormProps) {
  const [gameId, setGameId] = useState('');
  const [password, setPassword] = useState('');

  const isFormValid = gameId.trim() !== '' && password.trim() !== '';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormValid && onJoinGame) {
      onJoinGame(gameId.trim(), password.trim());
    }
  };

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title">Join Game</h2>
        <p className="text-sm text-base-content/70 mb-4">
          Enter the game ID and password to join an existing game
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Game ID</span>
            </label>
            <input
              type="text"
              placeholder="Enter game ID"
              className="input input-bordered"
              value={gameId}
              onChange={(e) => setGameId(e.target.value)}
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Password</span>
            </label>
            <input
              type="password"
              placeholder="Enter game password (empty if public)"
              className="input input-bordered"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className={`btn btn-primary w-full ${!isFormValid ? 'btn-disabled' : ''}`}
            disabled={!isFormValid}
          >
            Join Game
          </button>
        </form>
      </div>
    </div>
  );
}
