import { z } from "zod";

// type alias for code readability purposes

export const ruleEnum = z.enum([ 
  "Lady of the Lake",
  "Oberon",
  "Morgause",
  "Mordred",
  "Asassin",
  "Percival and Morgana",
  "Excalibur",
  "Visible Teammate Roles",
  "Lancelot",
]);
export type Rule = z.infer<typeof ruleEnum>;

export const roleEnum = z.enum([
  "Merlin",
  "Percival",
  "Arthurian Servant",
  "Mordred",
  "Assassin",
  "Morgana",
  "Oberon",
  "Mordredic Servant",
]);
export type Role = z.infer<typeof roleEnum>;

export const playerSchema = z.object({
  id: z.string(),
  socketId: z.string(),
  displayName: z.string(),
});
export type Player = z.infer<typeof playerSchema>;


export const roundSchema = z.object({
  monarch: z.string(), // playerId of monarch
  electedPlayers: z.optional(z.array(z.string())),
  votes: z.optional(z.map(z.string(), z.enum(["Approve", "Reject"]))),
  failCards: z.optional(z.number()),
  successCards: z.optional(z.number()),
})

export type Round = z.infer<typeof roundSchema>;

export const gameStateSchema = z.object({
  id: z.string(),
  status: z.enum(["in-progress", "finished", "waiting"]),
  players: z.array(playerSchema),
  tableOrder: z.array(z.string()),  // first playerId is the starting monarch
  ladyHolder: z.optional(z.string()),

  gameMaster: z.string(),
  ruleset: z.array(roleEnum),

  rounds: z.array(roundSchema),
  // Arthurian Victory - three quest passes 
  // Assassination Failure - assassination attempted mid-round (hot assassin) but missed
  // Mordredic Victory - three quest fails
  // Asassination - Successful mid-round assassination
  // Deadlock - too many failed votes
  result: z.optional(z.enum(["Arthurian Victory", "Assassination Failure", "Mordredic Victory", "Assassination", "Deadlock"])),

  // hidden roles are provided after the game is over
  hiddenRoles: z.optional(z.map(z.string(), roleEnum)),

  assassinationTarget: z.optional(z.string()),
});
export type GameState = z.infer<typeof gameStateSchema>;

// knowledge given to a specific player
export const knowledgeSchema = z.object({
  playerId: z.string(),
  info: z.discriminatedUnion("type", [
    z.object({
      type: z.literal("team"),
      team: z.enum(["Mordredic", "Arthurian"]),
    }),
    z.object({
      type: z.literal("role"),
      role: roleEnum,
    }),
    z.object({
      type: z.literal("percivalic sight"),
    })
  ])
});
export type Knowledge = z.infer<typeof knowledgeSchema>;
