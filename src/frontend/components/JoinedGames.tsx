import { Link } from "@tanstack/react-router";
import { useJoinedGames } from "../lib/hooks";

export function JoinedGames() {
  const joinedGames = useJoinedGames();

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title">Your Games</h2>
        <p className="text-sm text-base-content/70 mb-4">
          Continue playing your active games
        </p>
        
        {joinedGames.length === 0 ? (
          <div className="text-center py-8 text-base-content/50">
            No active games
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table table-zebra">
              <thead>
                <tr>
                  <th>Game ID</th>
                  <th>Status</th>
                  <th>Players</th>
                  <th>Rules</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {joinedGames.map((game) => (
                  <tr key={game.id}>
                    <td>
                      <span className="font-mono text-sm">
                        {game.id}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${
                        game.status === 'in-progress' ? 'badge-success' : 
                        game.status === 'waiting' ? 'badge-warning' : 
                        'badge-neutral'
                      }`}>
                        {game.status === 'in-progress' ? 'Playing' : 
                         game.status === 'waiting' ? 'Waiting' : 
                         'Finished'}
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
                      <Link
                        to="/game/$gameId"
                        params={{ gameId: game.id }}
                        className="btn btn-primary btn-sm"
                      >
                        Rejoin
                      </Link>
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
