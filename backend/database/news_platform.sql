-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jun 04, 2025 at 02:20 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `news_platform`
--

-- --------------------------------------------------------

--
-- Table structure for table `content`
--

CREATE TABLE `content` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `body` text NOT NULL,
  `access_level` enum('curious','informed','insider') NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `content`
--

INSERT INTO `content` (`id`, `title`, `body`, `access_level`, `created_at`) VALUES
(1, 'Curious News 1', 'Introductory insights for curious minds.', 'curious', '2025-06-03 01:41:59'),
(2, 'Informed Deep Dive', 'Exclusive content for informed users.', 'informed', '2025-06-03 01:41:59'),
(3, 'Insider Secrets', 'Confidential analysis for insiders only.', 'insider', '2025-06-03 01:41:59');

-- --------------------------------------------------------

--
-- Table structure for table `subscriptions`
--

CREATE TABLE `subscriptions` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `stripe_subscription_id` varchar(255) DEFAULT NULL,
  `level` enum('curious','informed','insider') NOT NULL,
  `status` enum('active','cancelled','failed') DEFAULT 'active',
  `valid_until` datetime NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `subscriptions`
--

INSERT INTO `subscriptions` (`id`, `user_id`, `stripe_subscription_id`, `level`, `status`, `valid_until`, `created_at`) VALUES
(1, 3, 'sub_1RW22TPM6gbdFklFEoWtJ5AJ', 'informed', 'active', '2025-06-10 23:06:29', '2025-06-03 21:06:29'),
(2, 1, 'sub_1RW6FiPM6gbdFklFPlwmHdDg', 'insider', 'active', '2025-06-11 03:36:27', '2025-06-04 01:36:27'),
(3, 3, 'sub_1RW6XOPM6gbdFklFKRMFdqne', 'insider', 'active', '2025-06-11 03:54:42', '2025-06-04 01:54:42'),
(4, 2, 'sub_1RW7DLPM6gbdFklFSoU04Gjw', 'informed', 'active', '2025-06-11 04:38:03', '2025-06-04 02:38:03'),
(5, 4, 'sub_1RW8rgPM6gbdFklFrV3uczB8', 'informed', 'active', '2025-06-11 06:23:49', '2025-06-04 04:23:49'),
(6, 4, 'sub_1RW8wyPM6gbdFklFCcgBvxA2', 'insider', 'active', '2025-06-11 06:29:16', '2025-06-04 04:29:16');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `subscription_level` enum('curious','informed','insider') DEFAULT 'curious',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `subscription_level`, `created_at`) VALUES
(1, '', 'test@example.com', '$2b$10$/gIBICCXSwFv1WWnLTQYZ.dSDDwVlXTw7glMCy37gtIFyIHZV/pRK', 'insider', '2025-05-31 00:07:37'),
(2, '', 'test2@example.com', '$2b$10$CtDMHsITWm3fx14GC0isCuPX/sN9LpIgTrPzQiM2FO9IPBMwQgx1G', 'informed', '2025-06-02 11:11:54'),
(3, '', 'test3@example.com', '$2b$10$vylPt46Pnz6trBZlgmWXdONHlzm2CNQnBMK/.ZNdeS2IfVb4yy8kK', 'insider', '2025-06-02 23:59:20'),
(4, '', 'test4@example.com', '$2b$10$49zxbfGI5uqNUcZLzBEwGOVuKMexxplmPZRCjwJA7sRUUAgj0HnKq', 'insider', '2025-06-04 04:22:31'),
(5, 'Test User', 'test5@example.com', '$2b$10$R2Vwp4UzYRyoYl3HjSaFX..z4I.KkZEP3UfyMIxZ1vb0HDY986WpW', 'curious', '2025-06-04 12:13:30');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `content`
--
ALTER TABLE `content`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `subscriptions`
--
ALTER TABLE `subscriptions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `content`
--
ALTER TABLE `content`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `subscriptions`
--
ALTER TABLE `subscriptions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `subscriptions`
--
ALTER TABLE `subscriptions`
  ADD CONSTRAINT `subscriptions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
