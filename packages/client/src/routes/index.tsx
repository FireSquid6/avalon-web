import { createFileRoute } from "@tanstack/react-router"
import { CreateGameForm } from "../components/CreateGameForm"
import { JoinGameForm } from "../components/JoinGameForm"
import { GameList } from "../components/GameList"
import type { Rule } from "engine"
import { useAvailableGames } from "../lib/hooks"

export const Route = createFileRoute("/")({
  component: Index,
})

function Index() {
  const handleCreateGame = async (ruleset: Rule[], password?: string) => {
    console.log("Creating game with ruleset:", ruleset, "password:", password);
  };

  const handleJoinGameForm = async (gameId: string, password: string) => {
    console.log("Joining game:", gameId, "with password:", password);
  };

  const handleJoinGameFromList = (gameId: string) => {
    console.log("Joining game from list:", gameId);
  };
  const games = useAvailableGames();

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2">Avalon</h1>
        <p className="text-lg text-base-content/70">
          The resistance needs you. Create or join a game to begin.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <CreateGameForm onCreateGame={handleCreateGame} />
        <JoinGameForm onJoinGame={handleJoinGameForm} />
      </div>

      <GameList games={games} onJoinGame={handleJoinGameFromList} />
    </div>
  )
}
