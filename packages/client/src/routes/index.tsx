import { createFileRoute } from "@tanstack/react-router"
import { CreateGameForm } from "../components/CreateGameForm"
import { JoinGameForm } from "../components/JoinGameForm"
import { GameList } from "../components/GameList"
import type { GameInfo, Rule } from "engine"

export const Route = createFileRoute("/")({
  component: Index,
})

// Dummy data for testing
const dummyGames: GameInfo[] = [
  {
    id: "abc123-def456-ghi789",
    currentPlayers: 3,
    maxPlayers: 10,
    ruleset: ["Lady of the Lake", "Percival and Morgana", "Mordred"] as Rule[],
    requiresPassword: false,
    status: "waiting",
    gameMaster: "someone",
  },
  {
    id: "xyz789-uvw456-rst123",
    currentPlayers: 5,
    maxPlayers: 8,
    ruleset: ["Oberon", "Excalibur"] as Rule[],
    requiresPassword: false,
    status: "waiting",
    gameMaster: "someone",
  },
  {
    id: "mno345-pqr678-stu901",
    currentPlayers: 2,
    maxPlayers: 6,
    ruleset: [] as Rule[],
    requiresPassword: false,
    status: "waiting",
    gameMaster: "someone",
  },
];

function Index() {
  const handleCreateGame = (ruleset: Rule[], password?: string) => {
    console.log("Creating game with ruleset:", ruleset, "password:", password);
  };

  const handleJoinGameForm = (gameId: string, password: string) => {
    console.log("Joining game:", gameId, "with password:", password);
  };

  const handleJoinGameFromList = (gameId: string) => {
    console.log("Joining game from list:", gameId);
  };

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

      <GameList games={dummyGames} onJoinGame={handleJoinGameFromList} />
    </div>
  )
}
