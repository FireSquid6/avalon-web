

// all mutators take in a ProcessInputs object and can mutate it
// they can also at any time throw an error

import { cursorTo } from "readline";
import { GameState, Knowledge, Rule } from ".";
import { StartAction } from "./actions";
import { getRolesForRuleset, validateRuleeset } from "./logic";
import { ProcessError, ProcessInputs } from "./process";


// general structure:
// - ensure player has permissions to perform action
// - ensure that action can be performed based on ruleset
// - ensure that action can be performed based on current state
// - update state
// - update knowledge
// - TODO: probably use claude to refactor into this structure with better
// -      types so that validation can be done without performing actions


export function performStart<T extends StartAction>(inputs: ProcessInputs<T>) {
  const { state, knowledge, action, actorId } = inputs;

  if (state.gameMaster !== actorId) {
    throw new ProcessError("client", "The game master must start the game");
  }

  const validated = validateRuleeset(state.ruleset, state.players.length);

  if (validated !== true) {
    throw new ProcessError("server", validated);
  }

  if (state.status !== "waiting") {
    throw new ProcessError("client", `Tried to start game that was already ${state.status}`);
  }

  const roles = getRolesForRuleset(state.ruleset, state.players.length);
  shuffleArray(roles);

  // allocate roles
  for (const player of state.players) {
    const role = roles.pop()!;

    state.hiddenRoles.set(player.id, role)
  }

  resetKnowledge(state, knowledge)

  state.status = "in-progress";
  shuffleArray(state.tableOrder);

  // grant lady of the lake if applicable
  if (rulesetHas(state.ruleset, "Lady of the Lake")) {
    state.ladyHolder = state.tableOrder[state.tableOrder.length - 1];
  }

  // add the first round
  state.rounds = [
    {
      monarch: state.tableOrder[0],
      questNumber: 1,
      ladyUsed: false,
    }
  ];
}

function resetKnowledge(state: GameState, knowledgeMap: Record<string, Knowledge[]>) {
  const showTeammateRoles = rulesetHas(state.ruleset, "Visible Teammate Roles");

  for (const [player, role] of state.hiddenRoles) {
    const knowledge: Knowledge[] = [];

    switch (role) {
      case "Mordredic Servant":
      case "Assassin":
      case "Mordred":
      case "Morgana":
        state.hiddenRoles.keys().map((p) => {
          const r = state.hiddenRoles.get(p)!;

          if (r === "Assassin" || r === "Mordred" || r === "Morgana" || r === "Mordredic Servant") {
            if (showTeammateRoles) {
              knowledge.push({
                playerId: p,
                info: {
                  type: "role",
                  role: r,
                }
              });
            } else {
              knowledge.push({
                playerId: p,
                info: {
                  type: "team",
                  team: "Mordredic",
                }
              });
            }
          }
        })
        break;
      case "Percival":
        state.hiddenRoles.keys().map((p) => {
          const r = state.hiddenRoles.get(p)!

          if (r === "Merlin" || r === "Morgana") {
            knowledge.push({
              playerId: p,
              info: {
                type: "percivalic sight",
              },
            });
          }
        });
        break;
      case "Merlin":
        state.hiddenRoles.keys().map((p) => {
          const r = state.hiddenRoles.get(p)!;

          if (r === "Morgana" || r === "Assassin" || r === "Oberon" || r === "Mordredic Servant") {
            knowledge.push({
              playerId: p,
              info: {
                type: "team",
                team: "Mordredic",
              },
            });
          }
        });
        break;
    }

    shuffleArray(knowledge);
    knowledgeMap[player] = knowledge;
  }

}

function shuffleArray<T>(array: T[]) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]]; // Swap elements
  }
  return array;
}

function rulesetHas(ruleset: Rule[], rule: Rule): boolean {
  return ruleset.find((r) => r === rule) !== undefined;
}
