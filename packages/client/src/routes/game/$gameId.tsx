import { createFileRoute } from "@tanstack/react-router"
import { getGameClient } from "../../lib/game";
import { usePushError } from "../../lib/errors";
import { useAuth, useGame } from "../../lib/hooks";
import { GameContextProvider } from "../../components/GameContext";
import { DebugGameRender } from "../../components/GameRender";

export const Route = createFileRoute("/game/$gameId")({
  component: RouteComponent,
})

function RouteComponent() {
  const { gameId } = Route.useParams();
  const pushError = usePushError();
  const auth = useAuth();
  const client = getGameClient(gameId, (e: Error) => {
    pushError(e, "/")
  });
  const username = auth.type === "authenticated" ? auth.username : "anonymous-user";
  
  const { data: { state, knowledge }, act, connected }  = useGame(client);
  return (
    <GameContextProvider data={{ state, knowledge, act, viewingUser: username }}>
      <p>Connected: {connected ? "True" : "False"}</p>
      <DebugGameRender />
    </GameContextProvider>
  )
}
