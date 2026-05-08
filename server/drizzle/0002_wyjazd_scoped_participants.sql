DROP TABLE IF EXISTS `pending_notifications`;
DROP TABLE IF EXISTS `participants`;

CREATE TABLE `participants` (
	`trip_id` integer NOT NULL,
	`name` text NOT NULL,
	`size` text NOT NULL,
	`email` text,
	`submitted_at` text NOT NULL,
	PRIMARY KEY(`trip_id`, `name`)
);

CREATE TABLE `pending_notifications` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`trip_id` integer NOT NULL,
	`giver_email` text NOT NULL,
	`recipient` text NOT NULL,
	`created_at` text NOT NULL
);
