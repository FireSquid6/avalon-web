import { createFileRoute } from '@tanstack/react-router'
import Rules from "../content/rules.mdx";

export const Route = createFileRoute('/rules')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="flex flex-col mx-4">
      <article className="mx-auto max-w-[46rem] w-full">
        <Rules />
      </article>
    </div>
  )
}
