import { createFileRoute } from "@tanstack/react-router"
import { useAuth, useGameSubscription } from "../../lib/hooks";
import { client } from "../../lib/game";
import { GameContextProvider } from "../../components/GameContext";
import { GameRender } from "../../components/game";
import { ConnectionStatus } from "../../components/ConnectionStatus";

export const Route = createFileRoute("/game/$gameId")({
  component: RouteComponent,
})

function RouteComponent() {
  const { gameId } = Route.useParams();
  const { state: auth } = useAuth();

  const username = auth.type === "authenticated" ? auth.username : "anonymous-user";
  const { data: { state, knowledge }, act, connected, messages, chat }  = useGameSubscription(gameId);

  return (
    <GameContextProvider data={{ state, knowledge, act, viewingUser: username, chat, messages }}>
      <ConnectionStatus 
        connected={connected}
        onReconnect={() => {
          client.reconnect();
        }}
        gameId={gameId}
      />
      <GameRender />
    </GameContextProvider>
  )
}
