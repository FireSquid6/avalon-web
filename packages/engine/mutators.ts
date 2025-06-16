// all mutators take in a ProcessInputs object and can mutate it
// they can also at any time throw an error
import type { AssassinationAction, LadyAction, NominateAction, QuestAction, RulesetModifiaction, StartAction, VoteAction } from "./actions";
import { getRolesForRuleset, validateRuleset, rulesetHas, getNextIntendedAction, newRound, getQuestInformation, getFailedVotes, getScore, shuffleArray } from "./logic";
import { ProcessError, type ProcessInputs } from "./process";


// general structure:
// - ensure player has permissions to perform action
// - ensure that action can be performed based on ruleset
// - ensure that action can be performed based on current state
// - update state
// - update knowledge
// - TODO: probably use claude to refactor into this structure with better
// -      types so that validation can be done without performing actions


export function performStart<T extends StartAction>(inputs: ProcessInputs<T>) {
  const { state, actorId } = inputs;

  if (state.gameMaster !== actorId) {
    throw new ProcessError("client", "The game master must start the game");
  }

  const validated = validateRuleset(state.ruleset, state.players.length);

  if (validated !== true) {
    throw new ProcessError("server", validated);
  }

  if (state.status !== "waiting") {
    throw new ProcessError("client", `Tried to start game that was already ${state.status}`);
  }

  if (state.players.length !== state.expectedPlayers) {
    throw new ProcessError("client", `Need ${state.expectedPlayers} players, but only have ${state.players.length}`);
  }

  const roles = getRolesForRuleset(state.ruleset, state.players.length);
  shuffleArray(roles);

  // allocate roles
  for (const player of state.players) {
    const role = roles.pop()!;

    state.hiddenRoles.set(player.id, role)
  }

  state.status = "in-progress";
  shuffleArray(state.tableOrder);

  // grant lady of the lake if applicable
  if (rulesetHas(state.ruleset, "Lady of the Lake")) {
    state.ladyHolder = state.tableOrder[state.tableOrder.length - 1];
  }

  // add the first round
  state.rounds = [
  ];
}

export function performNominate<T extends NominateAction>(inputs: ProcessInputs<T>) {
  const { state, action, actorId } = inputs;
  const intendedAction = getNextIntendedAction(state);

  if (intendedAction !== "nominate") {
    throw new ProcessError("client", "Should have monarch nominating right now");
  }

  const round = state.rounds[state.rounds.length - 1]!;

  if (round.monarch !== actorId) {
    throw new ProcessError("client", "Only monarch can nominate players");
  }

  const questInfo = getQuestInformation(state.players.length)[round.questNumber - 1]!;

  if (questInfo.players !== action.playerIds.length) {
    throw new ProcessError("client", `Need to nominate ${questInfo.players} players to this quest`);
  }

  // add the players
  round.nominatedPlayers = action.playerIds;
}

export function performVote<T extends VoteAction>(inputs: ProcessInputs<T>) {
  const { state, action, actorId } = inputs;
  const intendedAction = getNextIntendedAction(state)

  if (intendedAction !== "vote") {
    throw new ProcessError("client", `You should be performing action ${intendedAction}`);
  }

  const currentRound = state.rounds[state.rounds.length - 1]!;

  if (currentRound.votes.keys().find((p) => p === actorId) !== undefined) {
    throw new ProcessError("client", "You have already voted for this quest");
  }

  currentRound.votes.set(actorId, action.vote);

  // if we aren't done voting yet, just continue!
  if (currentRound.votes.size < state.players.length) {
    return;
  }

  const requiredApproves = Math.ceil(state.players.length / 2);
  let approves: number = 0;
  for (const r of currentRound.votes.values()) {
    if (r === "Approve") {
      approves += 1;
    }
  }

  if (approves >= requiredApproves) {
    currentRound.quest = {
      failCards: 0,
      successCards: 0,
      questedPlayers: [],
      completed: false,
    }
  } else {
    const failedVotes = getFailedVotes(state);

    if (failedVotes < 5) {
      newRound(state);
    } else {
      // game is over, too many failed votes
      state.status = "finished";
      state.result = "Deadlock";
    }
  }
}

export function performQuest<T extends QuestAction>(inputs: ProcessInputs<T>) {
  const { state, action, actorId } = inputs;
  const intendedAction = getNextIntendedAction(state)

  if (intendedAction !== "quest") {
    throw new ProcessError("client", "Tried to perform incorrect quest");
  }

  const round = state.rounds[state.rounds.length - 1]!;
  if (round.quest === undefined || round.nominatedPlayers === undefined) {
    throw new ProcessError("server", "Trying to perform undefined quest");
  }

  if (round.nominatedPlayers.find((n) => n === actorId) === undefined) {
    throw new ProcessError("client", "Not nominated for the quest");
  }

  if (round.quest.questedPlayers.find((n) => n === actorId) !== undefined) {
    throw new ProcessError("client", "Already performed this quest");
  }

  round.quest.questedPlayers.push(actorId);

  if (action.action === "Fail") {
    round.quest.failCards += 1;
  } else {
    round.quest.successCards += 1;
  }

  if (round.quest.successCards + round.quest.failCards < round.nominatedPlayers.length) {
    return;
  }

  if (round.questNumber < 5) {
    const questNumber = round.questNumber;
    const needsToUseLady = rulesetHas(state.ruleset, "Lady of the Lake")
      && questNumber > 1
      && round.ladyTarget === undefined

    if (!needsToUseLady) {
      newRound(state);
    }
    return;
  }

  const { fails } = getScore(state);

  if (fails < 3) {
    if (rulesetHas(state.ruleset, "Quickshot Assassin")) {
      state.status = "finished";
      state.result = "Arthurian Victory";
    }

  } else {
    state.status = "finished";
    state.result = "Mordredic Victory";
  }
}

export function performLady<T extends LadyAction>(inputs: ProcessInputs<T>) {
  const { state, action, actorId } = inputs;
  const intendedAction = getNextIntendedAction(state)

  if (intendedAction !== "lady") {
    throw new ProcessError("client", "Lady is not a valid action");
  }

  if (actorId !== state.ladyHolder) {
    throw new ProcessError("client", "You do not have the lady of the lake");
  }

  const round = state.rounds[state.rounds.length - 1]!;
  round.ladyUser = actorId;
  round.ladyTarget = action.playerId
  state.ladyHolder = action.playerId;

  newRound(state);
}

export function performAssassination<T extends AssassinationAction>(inputs: ProcessInputs<T>) {
  const { state, action, actorId } = inputs;

  if (state.hiddenRoles.get(actorId) !== "Assassin") {
    throw new ProcessError("client", "You are not the assassin");
  }

  const canAssassinate = rulesetHas(state.ruleset, "Quickshot Assassin")
    ? state.status === "in-progress"
    : getNextIntendedAction(state) === "assassinate";

  if (!canAssassinate)  {
    throw new ProcessError("client", "Cannot assassinate at this time");
  }
  
  state.status = "finished";
  state.assassinationTarget = action.playerId;

  state.result = state.hiddenRoles.get(state.assassinationTarget) === "Merlin"
    ? "Assassination"
    : "Arthurian Victory"
}

export function performRulesetModification<T extends RulesetModifiaction>(inputs: ProcessInputs<T>) {
  const { state, action, actorId } = inputs;

  if (actorId !== state.gameMaster) {
    throw new ProcessError("client", "You must be the game master to do this");
  }

  const validation = validateRuleset(action.ruleset, action.maxPlayers);

  if (validation !== true) {
    throw new ProcessError("client", `Invalid ruleset for ${action.maxPlayers}: ${action.ruleset}`);
  }

  state.ruleset = action.ruleset;
  state.expectedPlayers = action.maxPlayers;

}
