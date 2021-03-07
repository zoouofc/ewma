USE `ewma`;

ALTER TABLE `users` ADD COLUMN `dark` tinyint(1) NOT NULL DEFAULT 0 AFTER `approved`;
