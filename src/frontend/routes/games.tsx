import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/games")({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="flex flex-col mx-4">
      <article className="mx-auto max-w-[46rem] w-full">
        <p>Game database coming soon!</p>
      </article>
    </div>
  )
}
