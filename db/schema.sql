USE `ewma`;

CREATE TABLE IF NOT EXISTS `department` (
    `abbr` VARCHAR(32) NOT NULL PRIMARY KEY,
    `display` VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS `movies` (
    `title` VARCHAR(255),
    `rating` INT(100),
    `year` INT(4) NOT NULL,
    `id` INT(11) NOT NULL PRIMARY KEY AUTO_INCREMENT,
    `dept` VARCHAR(32),
    `src` VARCHAR(255),
    `mime` VARCHAR(255),
    `theme` VARCHAR(255),
    FOREIGN KEY(`dept`) REFERENCES `department`(`abbr`)
);

CREATE TABLE IF NOT EXISTS `award` (
    `name` VARCHAR(255),
    `id` INT(11) NOT NULL AUTO_INCREMENT,
    `movie_id` INT(11) NOT NULL,
    `note` VARCHAR(255),
    PRIMARY KEY(`id`),
    CONSTRAINT `key_id_movie` UNIQUE(`id`, `movie_id`),
    FOREIGN KEY(`movie_id`) REFERENCES `movies`(`id`)
);

CREATE TABLE IF NOT EXISTS `session` (
    `token` CHAR(36) NOT NULL,
    `issued` INT(11) NOT NULL,
    `admin` BOOLEAN NOT NULL,
    PRIMARY KEY(`token`)
);

CREATE TABLE IF NOT EXISTS `users` (
    `username` VARCHAR(100) NOT NULL,
    `password` CHAR(60) NOT NULL,
    PRIMARY KEY(`username`)
);
