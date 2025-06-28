CREATE TABLE `resets` (
	`id` text PRIMARY KEY NOT NULL,
	`username` text NOT NULL,
	`expiresAt` integer NOT NULL,
	`key` text NOT NULL,
	FOREIGN KEY (`username`) REFERENCES `users`(`username`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `resets_id_unique` ON `resets` (`id`);