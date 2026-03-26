CREATE TABLE `workRecordImages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`recordId` int NOT NULL,
	`filename` varchar(255) NOT NULL,
	`url` text NOT NULL,
	`uploadedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `workRecordImages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `workRecords` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`date` varchar(10) NOT NULL,
	`month` varchar(10) NOT NULL,
	`customerName` text,
	`customerPhone` varchar(20),
	`product` text,
	`os` text,
	`serviceType` text,
	`details` text,
	`notes` text,
	`status` enum('pending','completed','cancelled') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `workRecords_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `workRecordImages` ADD CONSTRAINT `workRecordImages_recordId_workRecords_id_fk` FOREIGN KEY (`recordId`) REFERENCES `workRecords`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `workRecords` ADD CONSTRAINT `workRecords_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;