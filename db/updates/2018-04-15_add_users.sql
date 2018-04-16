USE `ewma`;

DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
    `id` CHAR(36) CHARACTER SET latin1 PRIMARY KEY,
    `username` VARCHAR(100) NOT NULL UNIQUE,
    `email` VARCHAR(100) NOT NULL UNIQUE,
    `password` CHAR(60) NOT NULL,
    `approved` BOOLEAN DEFAULT 0 NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `permission_schema`;
CREATE TABLE IF NOT EXISTS `permission_schema` (
    `perm` CHAR(20) PRIMARY KEY,
    `description` VARCHAR(255)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `permissions`;
CREATE TABLE IF NOT EXISTS `permissions` (
    `id` INT(11) AUTO_INCREMENT PRIMARY KEY,
    `perm` CHAR(20) NOT NULL,
    `user` CHAR(36) CHARACTER SET latin1 NOT NULL,
    CONSTRAINT `permissions_user_fk1` FOREIGN KEY (`user`) REFERENCES `users` (`id`),
    CONSTRAINT `permissions_perm_fk2` FOREIGN KEY (`perm`) REFERENCES `permission_schema` (`perm`),
    UNIQUE (`perm`, `user`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `session`;
CREATE TABLE `session` (
    `token` CHAR(36) CHARACTER SET latin1 NOT NULL PRIMARY KEY,
    `issued` INT(11) NOT NULL,
    `user` CHAR(36) CHARACTER SET latin1 NOT NULL,
    CONSTRAINT `session_user_fk1` FOREIGN KEY (`user`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
