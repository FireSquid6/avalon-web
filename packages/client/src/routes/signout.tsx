import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute("/signout")({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/signout"!</div>
}
