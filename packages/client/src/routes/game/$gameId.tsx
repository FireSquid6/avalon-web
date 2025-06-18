import { createFileRoute } from "@tanstack/react-router"
import { useAuth, useGameSubscription } from "../../lib/hooks";
import { GameContextProvider } from "../../components/GameContext";
import { GameRender } from "../../components/game";

export const Route = createFileRoute("/game/$gameId")({
  component: RouteComponent,
})

function RouteComponent() {
  const { gameId } = Route.useParams();
  const auth = useAuth();

  const username = auth.type === "authenticated" ? auth.username : "anonymous-user";
  const { data: { state, knowledge }, act, connected }  = useGameSubscription(gameId);

  return (
    <GameContextProvider data={{ state, knowledge, act, viewingUser: username }}>
      <p>{connected ? "Connected to" : "Disconnected from"} game {state.id}</p>
      <GameRender />
    </GameContextProvider>
  )
}
