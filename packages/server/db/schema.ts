import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";


export const usersTable = sqliteTable("users", {
  username: text().primaryKey().notNull().unique(),
  email: text().notNull().unique(),
  hashedPassword: text().notNull(),
});

export const profilesTable = sqliteTable("profile", {
  username: text().primaryKey().unique().references(() => usersTable.username),
  // ... TODO
});

export const completedGames = sqliteTable("games", {
  id: text().notNull().primaryKey().unique(),
  tableOrder: text().notNull(),  // comma separated values of people
  result: text().notNull(),
});

export const participationstable = sqliteTable("participations", {
  id: text().notNull().primaryKey().unique(),
  gameId: text().notNull().references(() => completedGames.id),
  username: text().notNull().references(() => usersTable.username),
});
