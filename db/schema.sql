-- MySQL dump 10.16  Distrib 10.3.8-MariaDB, for osx10.11 (x86_64)
--
-- Host: localhost    Database: ewma
-- ------------------------------------------------------
-- Server version	10.3.8-MariaDB


--
-- Table structure for table `award`
--

DROP TABLE IF EXISTS `award`;
CREATE TABLE `award` (
  `name` varchar(255) DEFAULT NULL,
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `movie_id` int(11) NOT NULL,
  `note` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `key_id_movie` (`id`,`movie_id`),
  KEY `movie_id` (`movie_id`),
  CONSTRAINT `award_ibfk_1` FOREIGN KEY (`movie_id`) REFERENCES `movies` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=86 DEFAULT CHARSET=latin1;

--
-- Table structure for table `department`
--

DROP TABLE IF EXISTS `department`;
CREATE TABLE `department` (
  `abbr` varchar(32) NOT NULL,
  `display` varchar(255) NOT NULL,
  PRIMARY KEY (`abbr`),
  UNIQUE KEY `display` (`display`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Table structure for table `movies`
--

DROP TABLE IF EXISTS `movies`;
CREATE TABLE `movies` (
  `title` varchar(255) DEFAULT NULL,
  `rating` int(100) DEFAULT NULL,
  `year` int(4) NOT NULL,
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `dept` varchar(32) CHARACTER SET latin1 DEFAULT NULL,
  `theme` varchar(255) CHARACTER SET latin1 DEFAULT NULL,
  `duration` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `dept` (`dept`),
  CONSTRAINT `movies_ibfk_1` FOREIGN KEY (`dept`) REFERENCES `department` (`abbr`)
) ENGINE=InnoDB AUTO_INCREMENT=101 DEFAULT CHARSET=utf8mb4;

--
-- Table structure for table `passwordtoken`
--

DROP TABLE IF EXISTS `passwordtoken`;
CREATE TABLE `passwordtoken` (
  `user` char(36) CHARACTER SET latin1 NOT NULL,
  `token` char(29) CHARACTER SET latin1 NOT NULL,
  `created` int(11) NOT NULL,
  PRIMARY KEY (`token`),
  KEY `passwordtoken_user_fk1` (`user`),
  CONSTRAINT `passwordtoken_user_fk1` FOREIGN KEY (`user`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Table structure for table `permission_schema`
--

DROP TABLE IF EXISTS `permission_schema`;
CREATE TABLE `permission_schema` (
  `perm` char(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`perm`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Table structure for table `permissions`
--

DROP TABLE IF EXISTS `permissions`;
CREATE TABLE `permissions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `perm` char(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user` char(36) CHARACTER SET latin1 NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `perm` (`perm`,`user`),
  KEY `permissions_user_fk1` (`user`),
  CONSTRAINT `permissions_perm_fk2` FOREIGN KEY (`perm`) REFERENCES `permission_schema` (`perm`),
  CONSTRAINT `permissions_user_fk1` FOREIGN KEY (`user`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Table structure for table `session`
--

DROP TABLE IF EXISTS `session`;
CREATE TABLE `session` (
  `token` char(36) CHARACTER SET latin1 NOT NULL,
  `issued` int(11) NOT NULL,
  `user` char(36) CHARACTER SET latin1 NOT NULL,
  PRIMARY KEY (`token`),
  KEY `session_user_fk1` (`user`),
  CONSTRAINT `session_user_fk1` FOREIGN KEY (`user`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Table structure for table `sources`
--

DROP TABLE IF EXISTS `sources`;
CREATE TABLE `sources` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `video_id` int(11) NOT NULL,
  `file` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `mime` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `resolution` enum('240p','360p','480p','720p','1080p') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `file` (`file`),
  KEY `video_id` (`video_id`),
  CONSTRAINT `sources_ibfk_1` FOREIGN KEY (`video_id`) REFERENCES `videos` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=129 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` char(36) CHARACTER SET latin1 NOT NULL,
  `username` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` char(60) COLLATE utf8mb4_unicode_ci NOT NULL,
  `approved` tinyint(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Table structure for table `videos`
--

DROP TABLE IF EXISTS `videos`;
CREATE TABLE `videos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `movie_id` int(11) NOT NULL,
  `type` enum('trailer','commentary','primary','other') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'primary',
  `title` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `movie_id` (`movie_id`),
  CONSTRAINT `videos_ibfk_1` FOREIGN KEY (`movie_id`) REFERENCES `movies` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=86 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Table structure for table `viewcount`
--

DROP TABLE IF EXISTS `viewcount`;
CREATE TABLE `viewcount` (
  `video_id` int(11) NOT NULL,
  `session` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  UNIQUE KEY `viewcount_ibuq_video_session` (`video_id`,`session`),
  CONSTRAINT `viewcount_ibfk_2` FOREIGN KEY (`video_id`) REFERENCES `videos` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- Dump completed on 2018-10-02 12:43:46
