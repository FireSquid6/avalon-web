import { createFileRoute, useParams } from "@tanstack/react-router"

export const Route = createFileRoute("/game/$gameId")({
  component: RouteComponent,
})

function RouteComponent() {
  const { gameId } = Route.useParams();

  return (
    <div>
      <p>Hello "/game/$gameId"!</p>
      <p>id: {gameId}</p>
    </div>
  )
}
