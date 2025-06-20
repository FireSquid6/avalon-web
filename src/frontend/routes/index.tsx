import { createFileRoute } from "@tanstack/react-router"
import { CreateGameForm } from "../components/CreateGameForm"
import { JoinGameForm } from "../components/JoinGameForm"
import { GameList } from "../components/GameList"
import type { Rule } from "@/engine"
import { useAvailableGames } from "../lib/hooks"
import { createGame, joinGame } from "../lib/game"
import { usePushError } from "../lib/errors"
import { JoinedGames } from "../components/JoinedGames"

export const Route = createFileRoute("/")({
  component: Index,
})

function Index() {
  const pushError = usePushError();
  const navigate = Route.useNavigate(); 
  const handleCreate = async (ruleset: Rule[], maxPlayers: number, password?: string) => {
    const data = await createGame(ruleset, maxPlayers, password);

    if (data instanceof Error) {
      pushError(data);
      return;
    }

    navigate({
      to: "/game/$gameId",
      params: {
        gameId: data.state.id,
      }
    });
  }

  const handleJoin = async (gameId: string, password?: string) => {
    const data = await joinGame(gameId, password);

    if (data instanceof Error) {
      pushError(data);
      return;
    }

    navigate({
      to: "/game/$gameId",
      params: {
        gameId: data.state.id,
      }
    })
  }

  const games = useAvailableGames();

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2">Avalon</h1>
        <p className="text-lg text-base-content/70">
          Create or join an ongoing game.
        </p>
      </div>
      <JoinedGames />
      <div className="grid md:grid-cols-2 gap-6">
        <CreateGameForm onCreateGame={handleCreate} />
        <JoinGameForm onJoinGame={handleJoin} />
      </div>

      <GameList games={games} onJoinGame={(id) => handleJoin(id)} />
    </div>
  )
}
