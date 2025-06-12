-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Värd: 127.0.0.1
-- Tid vid skapande: 12 jun 2025 kl 13:42
-- Serverversion: 10.4.32-MariaDB
-- PHP-version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Databas: `news_platform`
--

-- --------------------------------------------------------

--
-- Tabellstruktur `content`
--

CREATE TABLE `content` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `body` text NOT NULL,
  `access_level` enum('free','curious','informed','insider') NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumpning av Data i tabell `content`
--

INSERT INTO `content` (`id`, `title`, `body`, `access_level`, `created_at`) VALUES
(1, 'Curious News updated', 'Introductory insights for curious minds.\r\nIntroductory insights for curious minds.Introductory insights for curious minds.Introductory insights for curious minds.Introductory insights for curious minds.Introductory insights for curious minds.Introductory insights for curious minds.Introductory insights for curious minds.Introductory insights for curious minds.Introductory insights for curious minds.Introductory insights for curious minds.Introductory insights for curious minds.Introductory insights for curious minds.Introductory insights for curious minds.Introductory insights for curious minds.Introductory insights for curious minds.', 'curious', '2025-06-03 01:41:59'),
(2, 'Informed Deep Dive', 'Exclusive content for informed users.', 'informed', '2025-06-03 01:41:59'),
(3, 'Insider Secrets', 'Confidential analysis for insiders only.', 'insider', '2025-06-03 01:41:59'),
(4, 'Free wispers', 'Get started with our free news content! This article is available to all users.', 'free', '2025-06-05 14:23:18'),
(9, 'Free wispers upgraded to Informed', 'Get started with our free news content! This article is available to all users.', 'informed', '2025-06-11 11:13:43');

-- --------------------------------------------------------

--
-- Tabellstruktur `subscriptions`
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
-- Dumpning av Data i tabell `subscriptions`
--

INSERT INTO `subscriptions` (`id`, `user_id`, `stripe_subscription_id`, `level`, `status`, `valid_until`, `created_at`) VALUES
(24, 22, 'sub_1RZ2vNGdVvFQyCt49aqF97PT', 'curious', 'active', '2025-07-12 06:43:42', '2025-06-12 04:43:38'),
(25, 23, 'sub_1RZ30fGdVvFQyCt4Iaiv6qPm', 'curious', 'active', '2025-06-19 06:50:08', '2025-06-12 04:45:09'),
(26, 23, 'sub_1RZ3AfGdVvFQyCt4rAPlSzk5', 'informed', 'active', '2025-06-19 06:55:23', '2025-06-12 05:01:16'),
(27, 23, 'sub_1RZ3GuGdVvFQyCt4NFcWxC8X', 'insider', 'active', '2025-06-19 07:01:51', '2025-06-12 05:01:57'),
(28, 24, 'sub_1RZ3NKGdVvFQyCt4bMRojEev', 'curious', 'active', '2025-06-19 07:08:29', '2025-06-12 05:08:34'),
(29, 24, 'sub_1RZ3S9GdVvFQyCt4CPr0CXoF', 'insider', 'active', '2025-06-19 07:13:27', '2025-06-12 05:13:33'),
(30, 25, 'sub_1RZ9QJGdVvFQyCt45cHt6bV9', 'curious', 'active', '2025-06-19 13:35:58', '2025-06-12 11:36:04'),
(31, 25, 'sub_1RZ9RYGdVvFQyCt4Bf2GPPw6', 'informed', 'active', '2025-06-19 13:37:15', '2025-06-12 11:37:21');

-- --------------------------------------------------------

--
-- Tabellstruktur `users`
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
-- Dumpning av Data i tabell `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `subscription_level`, `role`, `subscription_status`, `stripe_customer_id`, `stripe_subscription_id`, `created_at`) VALUES
(19, 'Admin', 'admin@example.com', '$2b$10$6NiCN4l9VLf2vmqyNIqqte12wyRTphO0/4MqjGGFrssZXx/MC.toC', 'free', 'admin', 'inactive', NULL, NULL, '2025-06-10 20:28:52'),
(22, 'Leksaksbil', 'linlongers@gmail.com', '$2b$10$cyQvQ3zTdVTAPmb/daro4.3A5uTPHL5/.dTaLRtmBKjmRb9G.sy.2', 'curious', 'user', 'active', 'cus_SU0xgfJveekflU', 'sub_1RZ2vNGdVvFQyCt49aqF97PT', '2025-06-12 04:39:17'),
(23, 'car', 'hejsansvejsan@gmail.com', '$2b$10$F5oLfxb0aOGfxENQrYDt5uBsq50zgHVLY1tGjMiiMiwKfBGsVbKa2', 'insider', 'user', 'cancelled', 'cus_SU12y3OfM0ObmS', 'sub_1RZ3GuGdVvFQyCt4NFcWxC8X', '2025-06-12 04:44:23'),
(24, 'blablabla', 'john.doe@gmail.com', '$2b$10$5lcdc.50CVApmYUwWgvV1uDH.q9yWm96Ql7ZuNhCn9CBuC7jXwHqu', 'insider', 'user', 'cancelled', 'cus_SU1PwzBBB3VpRg', 'sub_1RZ3S9GdVvFQyCt4CPr0CXoF', '2025-06-12 05:08:11'),
(25, 'car', 'hejsan@gmail.com', '$2b$10$mEx8tWRjLGyii3A6Ubaag.EZnskDHAijHpfUbTnBXSBoEphv8HG6u', 'informed', 'user', 'active', 'cus_SU7GW8Oyu6aAsS', 'sub_1RZ9RYGdVvFQyCt4Bf2GPPw6', '2025-06-12 11:10:05');

--
-- Index för dumpade tabeller
--

--
-- Index för tabell `content`
--
ALTER TABLE `content`
  ADD PRIMARY KEY (`id`);

--
-- Index för tabell `subscriptions`
--
ALTER TABLE `subscriptions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Index för tabell `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT för dumpade tabeller
--

--
-- AUTO_INCREMENT för tabell `content`
--
ALTER TABLE `content`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT för tabell `subscriptions`
--
ALTER TABLE `subscriptions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=32;

--
-- AUTO_INCREMENT för tabell `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- Restriktioner för dumpade tabeller
--

--
-- Restriktioner för tabell `subscriptions`
--
ALTER TABLE `subscriptions`
  ADD CONSTRAINT `subscriptions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
