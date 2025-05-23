import type { GameState, Quest, Role, Rule, Player } from ".";
import { playerCounts, questInfo } from "./data";
import { ProcessError } from "./process";

export function validateRuleeset(ruleset: Rule[], playerCount: number): string | true {
  if (hasDuplicates(ruleset)) {
    return `Ruleset has duplicate rules. All rules should be unique`;
  }

  if (playerCount > 10 || playerCount < 5) {
    return `Need a player amount between 5 and 10 (inclusive), got ${playerCount}`;
  }
  let maxEvilPlayers = 0;
  
  switch (playerCount) {
    case 5:
    case 6:
      maxEvilPlayers = 2;
      break;
    case 7:
    case 8:
      maxEvilPlayers = 3;
      break;
    case 9:
    case 10:
      maxEvilPlayers = 4;
      break;
  }

  const maxGoodPlayers = playerCount - maxEvilPlayers;

  // both start at 1 since merlin and assassin are always required
  let requiredGoodPlayers = 1;
  let requiredEvilPlayers = 1;

  for (const rule of ruleset) {
    // don't need to do anything else for other rules
    switch (rule) {
      case "Oberon":
      case "Mordred":
        requiredEvilPlayers += 1;
        break;
      case "Lancelot":
        requiredGoodPlayers += 1;
        break;
      case "Percival and Morgana":
        requiredEvilPlayers += 1;
        requiredGoodPlayers += 1;
        break;
    }
  }

  if (requiredEvilPlayers > maxEvilPlayers) {
    return `${requiredEvilPlayers} evil players needed for this ruleset, but only ${maxEvilPlayers} available`
  }
  if (requiredGoodPlayers > maxGoodPlayers) {
    return `${requiredGoodPlayers} good players needed for this ruleset, but only ${maxGoodPlayers} available`
  }

  return true;
}

function hasDuplicates<T>(l: T[]): boolean {
  const set = new Set<T>();

  for (const t of l) {
    if (set.has(t)) {
      return true;
    }
    set.add(t);
  }
  return false;
}


export function getQuestInformation(players: number): Quest[] {
  const quests = questInfo[players];

  if (quests === undefined) {
    throw new Error(`Tried to get quest info for ${players} players`);
  }

  return quests;
}

export function getGoodEvilNumber(players: number): { good: number, evil: number} {
  const res = playerCounts[players];

  if (res === undefined) {
    throw new Error(`Tried to get good and evil number for ${players} players`);
  }

  return res;
}

export function getRolesForRuleset(ruleset: Rule[], playerCount: number): Role[] {
  let { good: goodRemaining, evil: evilRemaining } = getGoodEvilNumber(playerCount);
  const roles: Role[] = [];

  roles.push("Merlin");
  roles.push("Assassin");
  goodRemaining -= 1;
  evilRemaining -= 1;

  for (const rule of ruleset) {
    switch (rule) {
      case "Oberon":
        roles.push("Oberon");
        evilRemaining -= 1;
        break;
      case "Lancelot":
        roles.push("Lancelot");
        goodRemaining -= 1;
        break;
      case "Mordred":
        roles.push("Mordred");
        evilRemaining -= 1;
        break;
      case "Percival and Morgana":
        roles.push("Percival");
        roles.push("Morgana");
        evilRemaining -= 1;
        goodRemaining -= 1;
        break;
    }

    while (goodRemaining > 0) {
      roles.push("Arthurian Servant");
      goodRemaining -= 1;
    }

    while (evilRemaining > 0) {
      roles.push("Mordredic Servant");
      evilRemaining -= 1;
    }
  }


  if (roles.length !== playerCount) {
    throw new Error(`Super screwed! Allocated ${roles.length} roles for a ${playerCount} player game!`);
  }
  
  return roles;
}

export function getBlankState(id: string, gameMasterId: string, ruleset: Rule[]): GameState {
  return {
    id,
    status: "waiting",
    players: [],
    tableOrder: [],
    ruleset,
    gameMaster: gameMasterId,
    rounds: [],
    monarchIndex: 0,
    hiddenRoles: new Map(),
  }
}

export function insertPlayer(state: GameState, player: Player) {
  state.players.push(player);
  state.tableOrder.push(player.id);
}
