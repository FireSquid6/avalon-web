import { getTeam } from "@/engine/logic";
import type { ScriptedActionGenerator } from "../components/demo";
import type { GameState } from "@/engine";

export const actions: ScriptedActionGenerator[] = [
  // start game
  {
    generator: (state: GameState) => {
      return {
        action: {
          kind: "start"
        },
        actorId: state.gameMaster,
      }
    },
    delay: 4000,
  },
  // nominate
  {
    generator: (state: GameState) => {
      return {
        action: {
          kind: "nominate",
          playerIds: ["Andrew", "Blaise", "Caroline"],
        },
        actorId: state.rounds[state.rounds.length - 1].monarch,
      }
    },
    delay: 4000,
  },
  // vote
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
    delay: 4000,
  },
  // pass the quest
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
  // nominate
  {
    generator: (state: GameState) => {
      return {
        action: {
          kind: "nominate",
          playerIds: ["Andrew", "Blaise", "Caroline", "Gabi"],
        },
        actorId: state.rounds[state.rounds.length - 1].monarch,
      }
    },
    delay: 4000,
  },
  // reject this quest
  {
    generator: (state: GameState) => {
      return state.players.map(({ id }) => {
        return {
          action: {
            kind: "vote",
            vote: "Reject",
          },
          actorId: id,
        }
      })

    },
    delay: 4000,
  },
  {
    generator: (state: GameState) => {
      return {
        action: {
          kind: "nominate",
          playerIds: ["Frederick", "Hunter", "Caroline", "Gabi"],
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
    delay: 4000,
  },
  {
    generator: (state: GameState) => {
      const nominated = state.rounds[state.rounds.length - 1].nominatedPlayers!;
      return nominated.map((p) => {
        const team = getTeam(state.hiddenRoles[p]!);
        return {
          action: {
            kind: "quest",
            action: team === "Arthurian" ? "Succeed" : "Fail",
          },
          actorId: p,
        }
      });
    },
    delay: 4000,
  },
  {
    generator: (state: GameState) => {
      const merlin = Object.keys(state.hiddenRoles).find(p => state.hiddenRoles[p] === "Merlin")!;
      const assassin = Object.keys(state.hiddenRoles).find(p => state.hiddenRoles[p] === "Assassin")!;

      return {
        action: {
          kind: "assassinate",
          playerId: merlin,
        },
        actorId: assassin,
      }
    },
    delay: 4000,
  }
]
