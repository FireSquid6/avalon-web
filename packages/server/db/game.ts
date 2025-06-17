import { eq, and, isNull } from "drizzle-orm";
import type { GameState, Round, Rule, Role } from "engine";
import type { Db } from "./index";
import { gamesTable, gamePlayersTable, gameRoundsTable, participationsTable } from "./schema";

// Convert database records to GameState
async function dbToGameState(db: Db, gameId: string): Promise<GameState | null> {
  const game = (await db.select().from(gamesTable).where(eq(gamesTable.id, gameId)).limit(1))[0];
  if (!game) return null;

  const players = await db.select().from(gamePlayersTable).where(eq(gamePlayersTable.gameId, gameId));
  const rounds = await db.select().from(gameRoundsTable).where(eq(gameRoundsTable.gameId, gameId));

  return {
    id: game.id,
    status: game.status as GameState["status"],
    players: players.map(p => ({ id: p.playerId, displayName: p.displayName })),
    expectedPlayers: game.expectedPlayers,
    password: game.password ?? undefined,
    tableOrder: game.tableOrder,
    ladyHolder: game.ladyHolder ?? undefined,
    gameMaster: game.gameMaster,
    ruleset: game.ruleset as Rule[],
    rounds: rounds.map((r): Round => ({
      monarch: r.monarch,
      questNumber: r.questNumber,
      ladyTarget: r.ladyTarget ?? undefined,
      ladyUser: r.ladyUser ?? undefined,
      nominatedPlayers: r.nominatedPlayers ?? undefined,
      votes: r.votes as Record<string, "Approve" | "Reject">,
      quest: r.questData ?? undefined,
    })),
    result: game.result as GameState["result"] ?? undefined,
    hiddenRoles: game.hiddenRoles as Record<string, Role>,
    assassinationTarget: game.assassinationTarget ?? undefined,
  };
}

// Convert GameState to database records
async function gameStateToDb(db: Db, gameState: GameState): Promise<void> {
  
  // Insert/update main game record
  await db.insert(gamesTable).values({
    id: gameState.id,
    status: gameState.status,
    expectedPlayers: gameState.expectedPlayers,
    password: gameState.password ?? null,
    gameMaster: gameState.gameMaster,
    ruleset: gameState.ruleset,
    tableOrder: gameState.tableOrder,
    ladyHolder: gameState.ladyHolder ?? null,
    result: gameState.result ?? null,
    hiddenRoles: gameState.hiddenRoles,
    assassinationTarget: gameState.assassinationTarget ?? null,
    createdAt: new Date(),
    updatedAt: new Date(),
  }).onConflictDoUpdate({
    target: gamesTable.id,
    set: {
      status: gameState.status,
      expectedPlayers: gameState.expectedPlayers,
      password: gameState.password ?? null,
      gameMaster: gameState.gameMaster,
      ruleset: gameState.ruleset,
      tableOrder: gameState.tableOrder,
      ladyHolder: gameState.ladyHolder ?? null,
      result: gameState.result ?? null,
      hiddenRoles: gameState.hiddenRoles,
      assassinationTarget: gameState.assassinationTarget ?? null,
      updatedAt: new Date(),
    },
  });

  // Clear and insert players
  await db.delete(gamePlayersTable).where(eq(gamePlayersTable.gameId, gameState.id));
  if (gameState.players.length > 0) {
    await db.insert(gamePlayersTable).values(
      gameState.players.map(player => ({
        id: `${gameState.id}-${player.id}`,
        gameId: gameState.id,
        playerId: player.id,
        displayName: player.displayName,
      }))
    );
  }

  // Clear and insert rounds
  await db.delete(gameRoundsTable).where(eq(gameRoundsTable.gameId, gameState.id));
  if (gameState.rounds.length > 0) {
    await db.insert(gameRoundsTable).values(
      gameState.rounds.map((round, index) => ({
        id: `${gameState.id}-round-${index}`,
        gameId: gameState.id,
        roundNumber: index,
        monarch: round.monarch,
        questNumber: round.questNumber,
        ladyTarget: round.ladyTarget ?? null,
        ladyUser: round.ladyUser ?? null,
        nominatedPlayers: round.nominatedPlayers ?? null,
        votes: round.votes,
        questData: round.quest ?? null,
      }))
    );
  }
}

// Get all finished games by a certain user
export async function getFinishedGamesByUser(db: Db, username: string): Promise<GameState[]> {
  const participations = await db
    .select({ gameId: participationsTable.gameId })
    .from(participationsTable)
    .where(eq(participationsTable.username, username));
  
  const gameIds = participations.map(p => p.gameId);
  if (gameIds.length === 0) return [];

  const games = await db
    .select()
    .from(gamesTable)
    .where(and(
      eq(gamesTable.status, "finished"),
      // Note: This would need to be replaced with an IN clause for multiple gameIds
      // For now, we'll fetch all finished games and filter
    ));

  const finishedGames = games.filter(game => gameIds.includes(game.id));
  const results: GameState[] = [];
  
  for (const game of finishedGames) {
    const gameState = await dbToGameState(db, game.id);
    if (gameState) results.push(gameState);
  }
  
  return results;
}

// Get all joined games by a certain user (in-progress or waiting)
export async function getJoinedGamesByUser(db: Db, username: string): Promise<GameState[]> {
  const participations = await db
    .select({ gameId: participationsTable.gameId })
    .from(participationsTable)
    .where(eq(participationsTable.username, username));
  
  const gameIds = participations.map(p => p.gameId);
  if (gameIds.length === 0) return [];

  const games = await db
    .select()
    .from(gamesTable)
    .where(and(
      eq(gamesTable.status, "in-progress"),
      // Filter for joined games in application logic for now
    ));

  const joinedGames = games.filter(game => gameIds.includes(game.id));
  const results: GameState[] = [];
  
  for (const game of joinedGames) {
    const gameState = await dbToGameState(db, game.id);
    if (gameState) results.push(gameState);
  }
  
  return results;
}

// Get all currently waiting games without a password
export async function getWaitingGames(db: Db, limit: number = 10): Promise<GameState[]> {
  const games = await db
    .select()
    .from(gamesTable)
    .where(and(
      eq(gamesTable.status, "waiting"),
      isNull(gamesTable.password)
    ))
    .limit(limit);

  const results: GameState[] = [];
  for (const game of games) {
    const gameState = await dbToGameState(db, game.id);
    if (gameState) results.push(gameState);
  }
  
  return results;
}

// Update a game's state
export async function updateGameState(db: Db, gameState: GameState): Promise<void> {
  await gameStateToDb(db, gameState);
  
  // Update participations table if game is finished
  if (gameState.status === "finished") {
    // Clear existing participations
    await db.delete(participationsTable).where(eq(participationsTable.gameId, gameState.id));
    
    // Add participations for all players
    if (gameState.players.length > 0) {
      await db.insert(participationsTable).values(
        gameState.players.map(player => ({
          id: `${gameState.id}-${player.id}`,
          gameId: gameState.id,
          username: player.id, // Assuming player.id is the username
        }))
      );
    }
  }
}

// Create a new game
export async function createGame(db: Db, gameState: GameState): Promise<void> {
  await gameStateToDb(db, gameState);
}

// Get a specific game by ID
export async function getGameById(db: Db, gameId: string): Promise<GameState | null> {
  return await dbToGameState(db, gameId);
}
