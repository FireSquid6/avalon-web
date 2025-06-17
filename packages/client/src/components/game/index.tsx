import { useGameContext } from '../GameContext';

import { PlayerCircle } from './PlayerCircle';
import type { Player } from './PlayerCircle';
import { useScreenSize } from '../../lib/hooks';
import { ActionRenderer } from '../actions';
import type { GameState, Knowledge } from 'engine';
import { Quest, type QuestWithResult } from "./Quest";
import { getNextIntendedAction, getQuestInformation, rulesetHas } from 'engine/logic';
import { VoteTracker } from './VoteTracker';
import { KnowledgeModal } from './KnowledgeModal';


export function GameRender() {
  const { state, act, knowledge, viewingUser } = useGameContext();
  const screenSize = useScreenSize();

  const lastRound = state.rounds[state.rounds.length - 1];
  const players: Player[] = state.tableOrder.map((id) => {
    let color: "white" | "black" | "gray" = "gray";
    const assassinated = state.assassinationTarget === id;
    let isMonarch = false;
    let isNominated = false;

    if (lastRound) {
      const vote = lastRound.votes.get(id);

      if (vote) {
        color = vote === "Approve" ? "white" : "black";
      }

      if (lastRound.nominatedPlayers) {
        isNominated = lastRound.nominatedPlayers.find((p) => p === id) !== undefined;
      }

      isMonarch = lastRound.monarch === id;
    }


    return {
      id,
      username: id,
      iconColor: color,
      assassinated,
      nominated: isNominated,
      isMonarch: isMonarch,
      hasLady: state.ladyHolder === id,
      isCurrentPlayer: id === viewingUser,
      role: state.hiddenRoles.get(id),
    }
  })

  let centerText = "";
  switch (getNextIntendedAction(state)) {
    case "assassinate":
      centerText = "Assassin is picking their final target...";
      break;
    case "nominate":
      centerText = "The monarch is discussing and nominating...";
      break;
    case "quest":
      centerText = "The quest is ongoing...";
      break;
    case "vote":
      centerText = "Players still voting...";
      break;
    case "lady":
      centerText = "The lady of the lake is revealing truth...";
      break;
    case "complete":
    case "none":
      // ugh nested switch statements ew ew ew
      switch (state.result) {
        case "Deadlock":
          centerText = "Avalon has fallen into civil disorder. The forces of Modred are victorious."
          break;
        case "Arthurian Victory":
          centerText = "The Arthurian forces prevail!";
          break;
        case "Mordredic Victory":
          centerText = "The forces of Morderd are victorious.";
          break;
        case "Assassination":
          centerText = "Merlin was assassinated. The forces of Mordred are victorious.";
          break;
      }
      break;
    case "start":
      if (state.players.length < state.expectedPlayers) {
        centerText = `Waiting for players (${state.players.length} / ${state.expectedPlayers})...`;
      } else {
        centerText = `Waiting for ${state.gameMaster} to start the game...`;
      }
      break;
  }


  const radius = Math.min(((screenSize.width - 100) / 2), 350);
  let nominationCount = 0;
  const questInfo = getQuestInformation(state.players.length);

  if (lastRound) {
    nominationCount = questInfo[lastRound.questNumber - 1].players;
  }

  const quests: QuestWithResult[] = questInfo.map((q, i) => {
    let result: "Pending" | "Failure" | "Success" = "Pending";
    const roundWithQuest = state.rounds.find((round) => {
      return (round.questNumber === i + 1 && round.quest !== undefined && round.quest.completed);
    })


    if (roundWithQuest && roundWithQuest.quest) {
      const isFail = roundWithQuest.quest.failCards > q.failsRequired;
      result = isFail ? "Failure" : "Success";
    }

    return {
      index: i,
      failsRequired: q.failsRequired,
      players: q.players,
      result: result,
      failsGiven: roundWithQuest?.quest?.failCards ?? 0,
    }
  });

  let failedVotes = 0;
  const requiredApproves = Math.ceil(state.players.length / 2);

  for (const round of state.rounds) {
    if (round.votes.size < state.players.length) {
      continue;
    }
    let approves: number = 0;
    for (const r of round.votes.values()) {
      if (r === "Approve") {
        approves += 1;
      }
    }

    if (approves < requiredApproves) {
      failedVotes += 1;
    }
  }


  return (
    <>
      {/* Central table */}
      <div className="my-8">
        <PlayerCircle players={players} radius={radius} centerText={centerText}/>
      </div>
      {/* Game Info */}

      <div className="flex flex-col mx-8">
        <Quest quests={quests} />
        <VoteTracker failedVotes={failedVotes} />
      </div>

      {/* Actions bar */}
      <ActionRenderer
        currentMaxPlayers={state.expectedPlayers}
        currentRuleset={state.ruleset}
        requiredCount={nominationCount}
        onAction={act}
        players={players.map((p) => { return { id: p.id, displayName: p.id } })}
        availableActions={getAvailableActions(state, knowledge, viewingUser)}
        extras={<KnowledgeModal knowledge={knowledge} viewingUserId={viewingUser} /> }
      />
    </>
  )
}

function getAvailableActions(state: GameState, knowledge: Knowledge[], id: string): string[] {
  const actions: string[] = [];
  const currentRound = state.rounds[state.rounds.length - 1];
  let isAssassin = false;
  for (const k of knowledge) {
    if (k.playerId === id && k.info.type === "role") {
      isAssassin = k.info.role === "Assassin";
    }
  }

  switch (getNextIntendedAction(state)) {
    case "start":
      if (state.gameMaster === id) {
        actions.push("ruleset")
        actions.push("start")
      }
      break;
    case "vote":
      if (currentRound?.votes.get(id) === undefined) {
        actions.push("vote");
      }
      break;
    case "lady":
      if (state.ladyHolder === "") {
        actions.push("lady");
      }
      break;
    case "quest":
      const isNominated = currentRound?.nominatedPlayers?.find((q) => q === id) !== undefined;
      const hasQuested = currentRound?.quest?.questedPlayers.find((q) => q === id) !== undefined;

      if (isNominated && !hasQuested) {
        actions.push("quest");
      }
      break;
    case "nominate":
      if (currentRound?.monarch === id) {
        actions.push("nominate");
      }
      break;
    case "assassinate":
      if (isAssassin) {
        actions.push("assassinate");
      }
      break;
    case "complete":
      // nothing to do!
      break;
    case "none":
      // nothing to do!
      break;
  }

  if (rulesetHas(state.ruleset, "Quickshot Assassin") && state.status === "in-progress" && isAssassin) {
    actions.push("assassinate");
  }

  return actions;
}

