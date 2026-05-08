CREATE TABLE IF NOT EXISTS `participants` (
	`name` text PRIMARY KEY NOT NULL,
	`size` text NOT NULL,
	`email` text,
	`submitted_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `pending_notifications` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`giver_email` text NOT NULL,
	`recipient` text NOT NULL,
	`created_at` text NOT NULL
);
