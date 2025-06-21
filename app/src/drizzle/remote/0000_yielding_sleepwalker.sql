CREATE TABLE `chat_messages` (
	`id` text PRIMARY KEY NOT NULL,
	`gameId` text NOT NULL,
	`userId` text NOT NULL,
	`sent` integer NOT NULL,
	`content` text NOT NULL,
	FOREIGN KEY (`gameId`) REFERENCES `games`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`userId`) REFERENCES `users`(`username`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `chat_messages_id_unique` ON `chat_messages` (`id`);--> statement-breakpoint
CREATE TABLE `game_players` (
	`id` text PRIMARY KEY NOT NULL,
	`gameId` text NOT NULL,
	`playerId` text NOT NULL,
	`displayName` text NOT NULL,
	FOREIGN KEY (`gameId`) REFERENCES `games`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `game_players_id_unique` ON `game_players` (`id`);--> statement-breakpoint
CREATE TABLE `game_rounds` (
	`id` text PRIMARY KEY NOT NULL,
	`gameId` text NOT NULL,
	`roundNumber` integer NOT NULL,
	`monarch` text NOT NULL,
	`questNumber` integer NOT NULL,
	`ladyTarget` text,
	`ladyUser` text,
	`nominatedPlayers` text,
	`votes` text NOT NULL,
	`questData` text,
	FOREIGN KEY (`gameId`) REFERENCES `games`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `game_rounds_id_unique` ON `game_rounds` (`id`);--> statement-breakpoint
CREATE TABLE `games` (
	`id` text PRIMARY KEY NOT NULL,
	`status` text NOT NULL,
	`expectedPlayers` integer NOT NULL,
	`password` text,
	`gameMaster` text NOT NULL,
	`ruleset` text NOT NULL,
	`tableOrder` text NOT NULL,
	`ladyHolder` text,
	`result` text,
	`hiddenRoles` text NOT NULL,
	`assassinationTarget` text,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	FOREIGN KEY (`gameMaster`) REFERENCES `users`(`username`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `games_id_unique` ON `games` (`id`);--> statement-breakpoint
CREATE TABLE `profile` (
	`username` text PRIMARY KEY NOT NULL,
	`centerString` text,
	`bio` text,
	FOREIGN KEY (`username`) REFERENCES `users`(`username`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `profile_username_unique` ON `profile` (`username`);--> statement-breakpoint
CREATE TABLE `sessions` (
	`token` text PRIMARY KEY NOT NULL,
	`expiresAt` integer NOT NULL,
	`username` text NOT NULL,
	FOREIGN KEY (`username`) REFERENCES `users`(`username`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `sessions_token_unique` ON `sessions` (`token`);--> statement-breakpoint
CREATE TABLE `users` (
	`username` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`hashedPassword` text NOT NULL,
	`verified` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_username_unique` ON `users` (`username`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);