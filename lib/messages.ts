import { z } from "zod";

// actions to be taken:
// Interaction
// - monarch can highlight players
// - chat
//
// Game:
// - vote yes/no
// - success/fail quest
// - nominate players
// - use lady of the lakte
// - use excalibur
// - assassinate merlin

export const voteAction = z.object({
  kind: z.literal("vote"),
  vote: z.enum(["Approve", "Reject"]),
});

export const questAction = z.object({
  kind: z.literal("quest"),
  action: z.enum(["Fail", "Succeed"]),
});

export const ladyAction = z.object({
  kind: z.literal("lady"),
});

export const gameActions = z.discriminatedUnion("kind", [
  voteAction,
  questAction,
  ladyAction,
]);

export type GameAction = z.infer<typeof gameActions>;
