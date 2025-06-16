import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/game/$gameId")({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/game/$gameId"!</div>
}
