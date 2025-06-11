-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jun 11, 2025 at 02:03 PM
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
  `access_level` enum('free','curious','informed','insider') NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `content`
--

INSERT INTO `content` (`id`, `title`, `body`, `access_level`, `created_at`) VALUES
(1, 'Curious News updated', 'Introductory insights for curious minds.\r\nIntroductory insights for curious minds.Introductory insights for curious minds.Introductory insights for curious minds.Introductory insights for curious minds.Introductory insights for curious minds.Introductory insights for curious minds.Introductory insights for curious minds.Introductory insights for curious minds.Introductory insights for curious minds.Introductory insights for curious minds.Introductory insights for curious minds.Introductory insights for curious minds.Introductory insights for curious minds.Introductory insights for curious minds.Introductory insights for curious minds.', 'curious', '2025-06-03 01:41:59'),
(2, 'Informed Deep Dive', 'Exclusive content for informed users.', 'informed', '2025-06-03 01:41:59'),
(3, 'Insider Secrets', 'Confidential analysis for insiders only.', 'insider', '2025-06-03 01:41:59'),
(4, 'Free wispers', 'Get started with our free news content! This article is available to all users.', 'free', '2025-06-05 14:23:18'),
(9, 'Free wispers upgraded to Informed', 'Get started with our free news content! This article is available to all users.', 'informed', '2025-06-11 11:13:43');

-- --------------------------------------------------------

--
-- Table structure for table `subscriptions`
--

CREATE TABLE `subscriptions` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `stripe_subscription_id` varchar(255) DEFAULT NULL,
  `level` enum('free','curious','informed','insider') NOT NULL,
  `status` enum('active','cancelled','failed','inactive') DEFAULT 'active',
  `valid_until` datetime NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `subscriptions`
--

INSERT INTO `subscriptions` (`id`, `user_id`, `stripe_subscription_id`, `level`, `status`, `valid_until`, `created_at`) VALUES
(14, 16, '[object Object]', 'curious', 'active', '2025-07-05 17:28:10', '2025-06-05 15:28:10'),
(15, 17, '[object Object]', 'curious', 'active', '2025-07-11 03:26:51', '2025-06-10 11:08:11'),
(16, 18, '[object Object]', 'informed', 'active', '2025-07-10 13:21:00', '2025-06-10 11:20:07');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `subscription_level` enum('not_subscribed','free','curious','informed','insider') DEFAULT 'not_subscribed',
  `role` enum('user','admin') DEFAULT 'user',
  `subscription_status` enum('active','cancelled','failed','inactive') DEFAULT 'inactive',
  `stripe_customer_id` varchar(255) DEFAULT NULL,
  `stripe_subscription_id` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `subscription_level`, `role`, `subscription_status`, `stripe_customer_id`, `stripe_subscription_id`, `created_at`) VALUES
(16, 'hello', 'linlongers@gmail.com', '$2b$10$eK1e9F2beDj/KnW4.nLXm.JK5/CUxG5fBNGyCKL1CvyTEWu08l6rO', 'curious', 'user', 'active', 'cus_SRXwM5l3X8whyq', '[object Object]', '2025-06-05 14:32:37'),
(17, 'Test user', 'test@example.com', '$2b$10$3SOIhoO6ulkI7/y4LyHbzuB4OsBAe2C.DccFavmKVm0QG7WG2LRRW', 'curious', 'user', 'cancelled', 'cus_STBLZBxOY0Q528', '[object Object]', '2025-06-09 18:05:25'),
(18, 'Test User 2', 'test2@example.com', '$2b$10$u4lRqvVD4uVbbngpPja7e.zw.HPlEyUnYrqmO3Foeg6zPipd6oTp.', 'informed', 'user', 'active', 'cus_STMx2hTfpfY6MZ', '[object Object]', '2025-06-10 11:18:46'),
(19, 'Admin', 'admin@example.com', '$2b$10$6NiCN4l9VLf2vmqyNIqqte12wyRTphO0/4MqjGGFrssZXx/MC.toC', 'free', 'admin', 'inactive', NULL, NULL, '2025-06-10 20:28:52');

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `subscriptions`
--
ALTER TABLE `subscriptions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

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
