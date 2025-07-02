import { createFileRoute, Link } from "@tanstack/react-router"
import { CreateGameForm } from "../components/CreateGameForm"
import { JoinGameForm } from "../components/JoinGameForm"
import { GameList } from "../components/GameList"
import type { Rule } from "@/engine"
import { useAuth, useAvailableGames } from "../lib/hooks"
import { client, createGame, joinGame } from "../lib/game"
import { usePushError } from "../lib/errors"
import { JoinedGames } from "../components/JoinedGames"

export const Route = createFileRoute("/play")({
  component: Play,
})

function Play() {
  const pushError = usePushError();
  const navigate = Route.useNavigate();
  const { state: { type: authType } } = useAuth();
  const handleCreate = async (ruleset: Rule[], maxPlayers: number, password?: string) => {
    const data = await createGame(ruleset, maxPlayers, password);

    if (data instanceof Error) {
      pushError(data);
      return;
    }

    client.hintKnownData(data.state.id, data);

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

    client.hintKnownData(data.state.id, data);

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
      {authType === "authenticated" ? (
        <>

          <JoinedGames />
          <div className="grid md:grid-cols-2 gap-6">
            <CreateGameForm onCreateGame={handleCreate} />
            <JoinGameForm onJoinGame={handleJoin} />
          </div>

          <GameList games={games} onJoinGame={(id) => handleJoin(id)} />
        </>
      ) : (
        <div className="flex flex-col w-full">
          <p>You must be authenticated to play</p>
          <Link to="/auth" className="btn btn-primary mx-auto">
            Sign In
          </Link>
        </div>
      )}
    </div>
  )
}
