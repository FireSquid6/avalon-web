import { createFileRoute, Link } from "@tanstack/react-router";
import { Demo, type ScriptedActionGenerator } from "../components/demo";
import type { GameState } from "@/engine";

export const Route = createFileRoute("/")({
  component: Index,
})

const actions: ScriptedActionGenerator[] = [
  {
    generator: (state: GameState) => {
      return {
        action: {
          kind: "start"
        },
        actorId: state.gameMaster,
      }
    },
    delay: 1000,
  },
  {
    generator: (state: GameState) => {
      return {
        action: {
          kind: "nominate",
          playerIds: ["Brodie", "Jonathan", "Aidan"],
        },
        actorId: state.rounds[state.rounds.length - 1].monarch,
      }
    },
    delay: 4000,
  },
  {
    generator: (state: GameState) => {
      return state.players.map(({ id }) => {
        return {
          action: {
            kind: "vote",
            vote: "Approve",
          },
          actorId: id,
        }
      })

    },
    delay: 2000,
  },
  {
    generator: (state: GameState) => {
      const nominated = state.rounds[state.rounds.length - 1].nominatedPlayers!;
      return nominated.map((p) => {
        return {
          action: {
            kind: "quest",
            action: "Succeed",
          },
          actorId: p,
        }
      });
    },
    delay: 4000,
  },
]

function Index() {
  return (
    <>
      <div className="text-center mt-40">
        <h1 className="text-4xl font-bold">Play Avalon with your friends online!</h1>
        <Link className="btn btn-primary mt-8 mb-40" to="/play">Play now</Link>
      </div>
      <div>
        <Demo
          players={["Jonathan", "Brodie", "Sarah", "Evie", "Aidan", "Alexa", "Sean", "Sophia"]}
          actions={actions}
        />
      </div>
    </>
  )
}
