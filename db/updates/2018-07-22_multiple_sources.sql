USE `ewma`;

CREATE TABLE `videos` (
    `id` INT(11) AUTO_INCREMENT,
    `movie_id` INT(11) NOT NULL,
    `type` ENUM('trailer', 'commentary', 'primary', 'other') NOT NULL DEFAULT 'primary',
    `title` VARCHAR(255) DEFAULT NULL,
    PRIMARY KEY (`id`),
    KEY `movie_id` (`movie_id`),
    CONSTRAINT `videos_ibfk_1` FOREIGN KEY (`movie_id`) REFERENCES `movies` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `sources` (
    `id` INT(11) AUTO_INCREMENT,
    `video_id` INT(11) NOT NULL,
    `file` VARCHAR(255) NOT NULL UNIQUE,
    `mime` VARCHAR(255) DEFAULT NULL,
    `resolution` ENUM('240p', '360p', '480p', '720p', '1080p'),
    PRIMARY KEY (`id`),
    KEY `video_id` (`video_id`),
    CONSTRAINT `sources_ibfk_1` FOREIGN KEY (`video_id`) REFERENCES `videos` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `videos` (`movie_id`, `type`, `title`)
    SELECT `id`, 'primary', `title`
    FROM `movies`
    WHERE `src` IS NOT NULL;

INSERT INTO `sources` (`video_id`, `file`, `mime`)
    SELECT `videos`.`id`, `movies`.`src`, `movies`.`mime`
    FROM `videos`
        INNER JOIN `movies` ON `videos`.`movie_id` = `movies`.`id`;

ALTER TABLE `movies`
    DROP `src`,
    DROP `mime`;

-- viewcount now applies to videos, not movies
CREATE TABLE `n_viewcount` (
    `video_id` int(11) NOT NULL,
    `session` char(36) NOT NULL,
    UNIQUE KEY `viewcount_ibuq_video_session` (`video_id`,`session`),
    CONSTRAINT `viewcount_ibfk_2` FOREIGN KEY (`video_id`) REFERENCES `videos` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `n_viewcount`
    SELECT `videos`.`id`, `viewcount`.`session`
    FROM `videos`
        INNER JOIN `movies` ON `videos`.`movie_id` = `movies`.`id`
        INNER JOIN `viewcount` ON `viewcount`.`movie_id` = `movies`.`id`;

RENAME TABLE `viewcount` TO `d_viewcount`, `n_viewcount` TO `viewcount`;
DROP TABLE `d_viewcount`;

UPDATE `videos`
    INNER JOIN `movies` ON `videos`.`movie_id` = `movies`.`id`
    INNER JOIN `trailer` ON `trailer`.`trailer` = `movies`.`id`
    SET `type` = 'trailer', `movie_id` = `trailer`.`parent`;

DROP TABLE `trailer`;

UPDATE `videos`
    INNER JOIN `movies` ON `videos`.`movie_id` = `movies`.`id`
    SET `type` = 'commentary', `movie_id` = 53
    WHERE `movies`.`id` IN (52);

UPDATE `videos`
    INNER JOIN `movies` ON `videos`.`movie_id` = `movies`.`id`
    SET `type` = 'other', `movie_id` = 38
    WHERE `movies`.`id` IN (39, 40, 41);

-- best trailer
UPDATE `award` SET `movie_id` = 93 WHERE `id` = 72;

-- all these are now videos on a single movie
DELETE FROM `movies` WHERE `id` IN (39, 40, 41, 52, 98, 99, 100);
