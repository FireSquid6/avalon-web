import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/me/games')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/me/games"!</div>
}
