import { GameState } from ".";

export function viewStateAs(givenState: GameState, playerId: string): GameState {
  const state = structuredClone(givenState);


  // only need to hide stuff for in progress games
  if (state.status === "finished" || state.status === "waiting") {
    return state;
  }

  if (state.rounds.length !== 0) {
    // if voting isn't complete, don't show votes
    const round = state.rounds[state.rounds.length - 1];
    
    if (round.votes.size !== state.players.length) {
      for (const k of round.votes.keys()) {
        if (k !== playerId) {
          round.votes.delete(k);
        }
      }
    }

    // only show quest result if it is done
    if (round.quest && !round.quest.completed) {
      round.quest.questedPlayers = round.quest.questedPlayers.filter((p) => p === playerId);
      round.quest.failCards = 0;
      round.quest.successCards = 0;
    }
  }

  // hide the roles
  state.hiddenRoles = new Map();

  return state;
}
