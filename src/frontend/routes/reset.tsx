import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/reset")({
  component: ResetPage,
})

function ResetPage() {
  const query = Route.useSearch();
  console.log(query);

  return (
    <div>
      hello, /reset
    </div>
  )
}
