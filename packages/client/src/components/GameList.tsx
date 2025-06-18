import type { GameInfo } from 'engine';


interface GameListProps {
  games: GameInfo[];
  onJoinGame?: (gameId: string) => void;
}

export function GameList({ games, onJoinGame }: GameListProps) {
  const handleJoinGame = (gameId: string) => {
    if (onJoinGame) {
      onJoinGame(gameId);
    }
  };

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title">Available Games</h2>
        <p className="text-sm text-base-content/70 mb-4">
          Join an existing game or wait for more players
        </p>
        
        {games.length === 0 ? (
          <div className="text-center py-8 text-base-content/50">
            No games available
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table table-zebra">
              <thead>
                <tr>
                  <th>Game ID</th>
                  <th>Players</th>
                  <th>Rules</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {games.map((game) => (
                  <tr key={game.id}>
                    <td>
                      <span className="font-mono text-sm">
                        {game.id}
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-outline">
                        {game.currentPlayers}/{game.maxPlayers}
                      </span>
                    </td>
                    <td>
                      <div className="flex flex-wrap gap-1">
                        {game.ruleset.length === 0 ? (
                          <span className="text-base-content/50 text-sm">Vanilla</span>
                        ) : (
                          game.ruleset.slice(0, 3).map((rule) => (
                            <span key={rule} className="badge badge-primary badge-sm">
                              {rule}
                            </span>
                          ))
                        )}
                        {game.ruleset.length > 3 && (
                          <span className="badge badge-primary badge-sm">
                            +{game.ruleset.length - 3}
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => handleJoinGame(game.id)}
                      >
                        Join
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
