import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { TextInput } from "../components/form"
import { useState } from "react"
import { getTreaty } from "../lib/api";

export const Route = createFileRoute("/")({
  component: Home,
})

function Home() {
  const [gameId, setGameId] = useState<string>("");
  const api = getTreaty();
  const navigate = useNavigate();
  const [enabled, setEnabled] = useState<boolean>(true);

  const onCreate = async () => {
    setEnabled(false);
    try {
      const newGame = await api.games.post({
        ruleset: [],
        playerId: "player1",
      });

      if (newGame.error !== null) {
        throw new Error(`Error fetching new game: ${newGame.error}`);
      }

      const gameId = newGame.data;
      navigate({
        to: `/game/${gameId}`,
      });
    } catch (e) {
      console.error(e);
    }
    setEnabled(true);
  }

  const onJoin = async () => {
    navigate({
      to: `/game/${gameId}`,
    });
  }

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex flex-col mx-auto my-auto">
        <div className="card bg-base-300 rounded-box grid place-items-center h-52">
          <button onClick={onCreate} disabled={!enabled} className="btn btn-primary m-12">Create New Game</button>
        </div>
        <div className="divider">OR</div>
        <div className="card bg-base-300 rounded-box grid place-items-center h-52">
          <div className="m-4">
            <TextInput
              state={gameId}
              onChange={setGameId}
              label="Game Code"
              placeholder="ABCDEFG"

            />
          </div>

          <button onClick={onJoin} disabled={!enabled} className="btn btn-primary mx-12 mb-8 mt-2">Join Game</button>
        </div>
      </div>
    </div>
  )
}


