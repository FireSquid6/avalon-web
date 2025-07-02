import { createFileRoute, Link } from "@tanstack/react-router";
import { Demo } from "../components/demo";
import { actions } from "@/frontend/lib/script";
import { RulesDisplay } from "../components/Rules";

export const Route = createFileRoute("/")({
  component: Index,
})


function Index() {
  return (
    <>
      <div className="text-center mt-40">
        <h1 className="text-4xl font-bold">Play The Resistance - Avalon online</h1>
        <p className="text-lg">Enjoy the social deduction board game with anyone around the world</p>
        <Link className="btn btn-primary mt-8 mb-40" to="/play">Play now</Link>
      </div>
      <div>
        <Demo
          players={["Andrew", "Blaise", "Caroline", "Drayton", "Elliana", "Frederick", "Gabi", "Hunter"]}
          actions={actions}
        />
      </div>
      <div className="max-w-[800px] mx-auto">
        <RulesDisplay />
      </div>
    </>
  )
}
