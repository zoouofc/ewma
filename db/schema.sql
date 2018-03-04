-- MySQL dump 10.16  Distrib 10.1.30-MariaDB, for Linux (x86_64)
--
-- Host: localhost    Database: ewma
-- ------------------------------------------------------
-- Server version	10.1.30-MariaDB


--
-- Table structure for table `award`
--

DROP TABLE IF EXISTS `award`;
CREATE TABLE `award` (
  `name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `movie_id` int(11) NOT NULL,
  `note` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `key_id_movie` (`id`,`movie_id`),
  KEY `movie_id` (`movie_id`),
  CONSTRAINT `award_ibfk_1` FOREIGN KEY (`movie_id`) REFERENCES `movies` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Table structure for table `department`
--

DROP TABLE IF EXISTS `department`;
CREATE TABLE `department` (
  `abbr` char(32) COLLATE utf8mb4_unicode_ci NOT NULL,
  `display` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`abbr`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Table structure for table `movies`
--

DROP TABLE IF EXISTS `movies`;
CREATE TABLE `movies` (
  `title` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `rating` int(100) DEFAULT NULL,
  `year` int(4) NOT NULL,
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `dept` varchar(32) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `src` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `mime` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `theme` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `duration` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `dept` (`dept`),
  CONSTRAINT `movies_ibfk_1` FOREIGN KEY (`dept`) REFERENCES `department` (`abbr`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Table structure for table `session`
--

DROP TABLE IF EXISTS `session`;
CREATE TABLE `session` (
  `token` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `issued` int(11) DEFAULT NULL,
  `admin` tinyint(1) NOT NULL,
  PRIMARY KEY (`token`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Table structure for table `trailer`
--

DROP TABLE IF EXISTS `trailer`;
CREATE TABLE `trailer` (
  `trailer` int(11) NOT NULL,
  `parent` int(11) NOT NULL,
  UNIQUE KEY `key_trailer_parent` (`trailer`,`parent`),
  KEY `parent` (`parent`),
  CONSTRAINT `trailer_ibfk_1` FOREIGN KEY (`trailer`) REFERENCES `movies` (`id`),
  CONSTRAINT `trailer_ibfk_2` FOREIGN KEY (`parent`) REFERENCES `movies` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `username` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` char(60) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Table structure for table `viewcount`
--

DROP TABLE IF EXISTS `viewcount`;
CREATE TABLE `viewcount` (
  `movie_id` int(11) NOT NULL,
  `session` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  UNIQUE KEY `key_movie_sesion` (`movie_id`,`session`),
  CONSTRAINT `viewcount_ibfk_1` FOREIGN KEY (`movie_id`) REFERENCES `movies` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- Dump completed on 2018-03-03 21:20:46
