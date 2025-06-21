import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/me/profile')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/me/profile"!</div>
}
