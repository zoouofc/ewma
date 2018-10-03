USE `ewma`;

CREATE TABLE `passwordtoken` (
    `user` char(36) CHARACTER SET latin1 NOT NULL,
    `token` char(29) CHARACTER SET latin1 NOT NULL,
    `created` int(11) NOT NULL,
    PRIMARY KEY (`token`),
    KEY `passwordtoken_user_fk1` (`user`),
    CONSTRAINT `passwordtoken_user_fk1` FOREIGN KEY (`user`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
