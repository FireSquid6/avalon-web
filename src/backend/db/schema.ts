import { Timeset } from "@/engine";
import type { InferSelectModel } from "drizzle-orm";
import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";


export const usersTable = sqliteTable("users", {
  username: text().primaryKey().notNull().unique(),
  email: text().notNull().unique(),
  hashedPassword: text().notNull(),
  verified: int({ mode: "boolean" }).notNull(),
});
export type User = InferSelectModel<typeof usersTable>;

export const profilesTable = sqliteTable("profile", {
  username: text().primaryKey().unique().references(() => usersTable.username),
  centerString: text(),
  bio: text(),
});
export type Profile = InferSelectModel<typeof profilesTable>;

export const gamesTable = sqliteTable("games", {
  id: text().notNull().primaryKey().unique(),
  status: text().notNull(),
  expectedPlayers: int().notNull(),
  password: text(),
  gameMaster: text().notNull().references(() => usersTable.username),
  ruleset: text({ mode: "json" }).$type<string[]>().notNull(),
  tableOrder: text({ mode: "json" }).$type<string[]>().notNull(),
  ladyHolder: text(),
  result: text(),
  hiddenRoles: text({ mode: "json" }).$type<Record<string, string>>().notNull(),
  assassinationTarget: text(),
  timeoutTime: int(),
  createdAt: int({ mode: "timestamp_ms" }).notNull(),
  updatedAt: int({ mode: "timestamp_ms" }).notNull(),
  timeset: text({ mode: "json" }).$type<Timeset>().notNull(),
});
export type Game = InferSelectModel<typeof gamesTable>;

export const gamePlayersTable = sqliteTable("game_players", {
  id: text().notNull().primaryKey().unique(),
  gameId: text().notNull().references(() => gamesTable.id),
  playerId: text().notNull(),
  displayName: text().notNull(),
});

export const gameRoundsTable = sqliteTable("game_rounds", {
  id: text().notNull().primaryKey().unique(),
  gameId: text().notNull().references(() => gamesTable.id),
  roundNumber: int().notNull(),
  monarch: text().notNull(),
  questNumber: int().notNull(),
  ladyTarget: text(),
  ladyUser: text(),
  nominatedPlayers: text({ mode: "json" }).$type<string[]>(),
  votes: text({ mode: "json" }).$type<Record<string, string>>().notNull(),
  questData: text({ mode: "json" }).$type<{
    failCards: number;
    successCards: number;
    questedPlayers: string[];
    completed: boolean;
  }>(),
});

export const chatMessages = sqliteTable("chat_messages", {
  id: text().notNull().primaryKey().unique(),
  gameId: text().notNull().references(() => gamesTable.id),
  userId: text().notNull().references(() => usersTable.username),
  sent: int({ mode: "timestamp_ms" }).notNull(),
  content: text().notNull(),
});
export type Message = InferSelectModel<typeof chatMessages>;

export const sessionsTable = sqliteTable("sessions", {
  token: text().notNull().primaryKey().unique(),
  expiresAt: int({ mode: "timestamp_ms" }).notNull(),
  username: text().notNull().references(() => usersTable.username)
});

export type Session = InferSelectModel<typeof sessionsTable>;

export const resetTable = sqliteTable("resets", {
  id: text().notNull().unique().primaryKey(),
  username: text().notNull().references(() => usersTable.username),
  expiresAt: int({ mode: "timestamp_ms" }).notNull(),
  key: text().notNull(),
});
export type ResetToken = InferSelectModel<typeof resetTable>;


