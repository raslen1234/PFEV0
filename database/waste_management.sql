-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: May 25, 2026 at 01:52 PM
-- Server version: 9.1.0
-- PHP Version: 8.3.14

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `waste_management`
--

-- --------------------------------------------------------

--
-- Table structure for table `locations`
--

DROP TABLE IF EXISTS `locations`;
CREATE TABLE IF NOT EXISTS `locations` (
  `location_id` int NOT NULL AUTO_INCREMENT,
  `location_name` varchar(255) NOT NULL,
  PRIMARY KEY (`location_id`),
  UNIQUE KEY `location_name` (`location_name`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `locations`
--

INSERT INTO `locations` (`location_id`, `location_name`) VALUES
(6, 'dejrba'),
(4, 'hamaam lif'),
(5, 'hamam chot'),
(1, 'lac1'),
(2, 'lac3'),
(9, 'manar'),
(3, 'souk'),
(8, 'sousse'),
(7, 'zahra');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
CREATE TABLE IF NOT EXISTS `users` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('worker','municipality_head','admin') NOT NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `username`, `password`, `role`) VALUES
(1, 'head1', '$2y$10$eJmDsReW25D5sGPjDjG44eUD3th2zaAim6c/s7nT7hze4KYnQxjzO', 'municipality_head'),
(2, 'worker1', '$2y$10$AbtfEZgdTuJFK2QiI6tjseh59iA8/AqbmDdCIsprWuPr.yLxJYgFW', 'worker'),
(3, 'admin', '$2y$10$q1kE1BF1YM97i4Pop2/KnO5840VsCvLPdNsu5UZD6ZDcOL5EMcNzS', 'admin');

-- --------------------------------------------------------

--
-- Table structure for table `waste_entries`
--

DROP TABLE IF EXISTS `waste_entries`;
CREATE TABLE IF NOT EXISTS `waste_entries` (
  `waste_entry_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `waste_type_id` int NOT NULL,
  `location_id` int NOT NULL,
  `quantity` decimal(10,2) NOT NULL,
  `date` date NOT NULL,
  `waste_category` enum('household','non_household','construction','wood','hazardous') DEFAULT NULL,
  `household_waste` tinyint(1) DEFAULT NULL,
  `non_household_waste` tinyint(1) DEFAULT NULL,
  `controlled_facility` tinyint(1) DEFAULT NULL,
  `status` enum('Submitted','Approved','Rejected') DEFAULT 'Submitted',
  `submission_date` timestamp NULL DEFAULT NULL,
  `validation_date` timestamp NULL DEFAULT NULL,
  `validator_id` int DEFAULT NULL,
  `waste_subtype` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`waste_entry_id`),
  KEY `user_id` (`user_id`),
  KEY `waste_type_id` (`waste_type_id`),
  KEY `location_id` (`location_id`),
  KEY `validator_id` (`validator_id`),
  KEY `idx_waste_entries_status` (`status`)
) ;

--
-- Dumping data for table `waste_entries`
--

INSERT INTO `waste_entries` (`waste_entry_id`, `user_id`, `waste_type_id`, `location_id`, `quantity`, `date`, `waste_category`, `household_waste`, `non_household_waste`, `controlled_facility`, `status`, `submission_date`, `validation_date`, `validator_id`, `waste_subtype`) VALUES
(5, 2, 1, 3, 69.00, '2025-04-16', 'non_household', NULL, 69, 1, 'Rejected', '2025-04-16 13:32:47', '2025-04-16 12:35:59', 1, 'Organic'),
(13, 1, 2, 4, 100.00, '2024-06-17', 'construction', NULL, NULL, 1, 'Approved', '2025-04-16 18:47:46', '2025-04-16 17:48:43', 1, 'Wood'),
(17, 1, 2, 3, 88.00, '2024-04-26', 'construction', NULL, NULL, 1, 'Approved', '2025-04-16 22:00:30', '2025-04-16 21:01:01', 1, 'Construction'),
(18, 1, 2, 5, 20.00, '2023-03-02', 'construction', NULL, NULL, 1, 'Approved', '2025-04-16 22:00:56', '2025-04-16 21:01:02', 1, 'Wood'),
(20, 2, 2, 1, 50.00, '2025-04-30', 'construction', NULL, NULL, 1, 'Rejected', '2025-04-30 19:05:47', '2025-04-30 18:06:25', 1, 'Construction'),
(23, 2, 2, 7, 33.00, '2025-05-06', 'construction', NULL, NULL, 1, 'Approved', '2025-05-05 23:03:02', '2025-05-05 22:03:21', 1, 'Wood'),
(24, 2, 1, 3, 10.00, '2025-05-06', 'non_household', NULL, 10, 1, 'Approved', '2025-05-06 08:13:03', '2025-05-12 12:30:56', 1, 'Plastic'),
(25, 2, 1, 1, 40.00, '2025-05-13', 'non_household', NULL, 44, 1, 'Rejected', '2025-05-12 13:31:28', '2025-05-12 12:32:05', 1, 'Plastic'),
(26, 2, 2, 2, 3.00, '2025-05-12', 'construction', NULL, NULL, 1, 'Rejected', '2025-05-12 13:32:31', '2025-05-12 12:32:38', 1, 'Construction'),
(27, 2, 2, 3, 55.00, '2025-06-17', 'construction', NULL, NULL, 1, 'Rejected', '2025-05-12 14:19:07', '2025-05-12 13:25:38', 1, 'Wood'),
(28, 2, 1, 7, 10.00, '2025-05-12', 'household', 10, NULL, 1, 'Approved', '2025-05-12 14:28:29', '2025-05-12 13:52:48', 1, 'Organic'),
(29, 2, 2, 6, 88.00, '2025-05-12', 'construction', NULL, NULL, 1, 'Rejected', '2025-05-12 14:29:41', '2025-05-12 13:54:15', 1, 'Construction'),
(30, 2, 1, 4, 698.00, '2025-05-29', 'household', 127, NULL, 1, 'Rejected', '2025-05-29 17:53:12', '2025-05-29 16:53:28', 1, 'Textiles'),
(31, 2, 1, 4, 555.00, '2025-05-29', 'non_household', NULL, 127, 1, 'Rejected', '2025-05-29 18:03:16', '2025-05-29 17:03:25', 1, 'Paper'),
(32, 2, 2, 8, 67.00, '2025-05-29', 'construction', NULL, NULL, 1, 'Approved', '2025-05-29 18:03:48', '2025-05-29 17:04:29', 1, 'Wood'),
(33, 1, 1, 7, 50.00, '2025-05-29', 'household', 50, NULL, 1, 'Rejected', '2025-05-29 18:05:41', '2025-05-29 17:05:51', 1, 'Glass'),
(34, 2, 1, 9, 48.00, '2025-05-30', 'household', 48, NULL, 1, 'Approved', '2025-05-30 08:58:25', '2025-05-30 07:59:17', 1, 'Plastic'),
(35, 2, 2, 1, 10.00, '2025-05-30', 'construction', NULL, NULL, 1, 'Rejected', '2025-05-30 08:58:46', '2025-05-30 07:59:20', 1, 'Wood'),
(36, 1, 1, 3, 33.00, '2022-02-24', 'household', 33, NULL, 1, 'Approved', '2025-05-30 09:00:24', '2025-05-30 08:00:28', 1, 'Plastic');

-- --------------------------------------------------------

--
-- Table structure for table `waste_types`
--

DROP TABLE IF EXISTS `waste_types`;
CREATE TABLE IF NOT EXISTS `waste_types` (
  `waste_type_id` int NOT NULL AUTO_INCREMENT,
  `waste_type_name` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`waste_type_id`),
  UNIQUE KEY `waste_type_name` (`waste_type_name`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `waste_types`
--

INSERT INTO `waste_types` (`waste_type_id`, `waste_type_name`, `created_at`) VALUES
(1, 'Normal Waste', '2025-04-16 00:45:32'),
(2, 'Construction Waste', '2025-04-16 00:45:32');

--
-- Constraints for dumped tables
--

--
-- Constraints for table `waste_entries`
--
ALTER TABLE `waste_entries`
  ADD CONSTRAINT `waste_entries_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`),
  ADD CONSTRAINT `waste_entries_ibfk_2` FOREIGN KEY (`waste_type_id`) REFERENCES `waste_types` (`waste_type_id`),
  ADD CONSTRAINT `waste_entries_ibfk_3` FOREIGN KEY (`location_id`) REFERENCES `locations` (`location_id`),
  ADD CONSTRAINT `waste_entries_ibfk_4` FOREIGN KEY (`validator_id`) REFERENCES `users` (`user_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
