CREATE TABLE `assignments` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`trip_id` integer NOT NULL,
	`giver_name` text NOT NULL,
	`recipient_name` text NOT NULL
);
