import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Index,
})


function Index() {
  return (
  <>
    <p>Play avalon with your friends online!</p>
    <Link to="/play">Play now</Link>
  </>
  )

}
