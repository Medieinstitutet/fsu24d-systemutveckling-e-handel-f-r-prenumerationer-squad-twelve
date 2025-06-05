-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Värd: 127.0.0.1
-- Tid vid skapande: 05 jun 2025 kl 15:19
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
  `access_level` enum('curious','informed','insider') NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumpning av Data i tabell `content`
--

INSERT INTO `content` (`id`, `title`, `body`, `access_level`, `created_at`) VALUES
(1, 'Curious News 1', 'Introductory insights for curious minds.', 'curious', '2025-06-03 01:41:59'),
(2, 'Informed Deep Dive', 'Exclusive content for informed users.', 'informed', '2025-06-03 01:41:59'),
(3, 'Insider Secrets', 'Confidential analysis for insiders only.', 'insider', '2025-06-03 01:41:59');

-- --------------------------------------------------------

--
-- Tabellstruktur `subscriptions`
--

CREATE TABLE `subscriptions` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `stripe_subscription_id` varchar(255) DEFAULT NULL,
  `level` enum('curious','informed','insider') NOT NULL,
  `status` enum('active','cancelled','failed','inactive') DEFAULT 'active',
  `valid_until` datetime NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumpning av Data i tabell `subscriptions`
--

INSERT INTO `subscriptions` (`id`, `user_id`, `stripe_subscription_id`, `level`, `status`, `valid_until`, `created_at`) VALUES
(7, 8, 'sub_1RWbFGGdVvFQyCt4d7fXjApG', 'curious', 'active', '2025-07-05 12:52:21', '2025-06-05 10:51:49'),
(8, 9, 'sub_1RWbWuGdVvFQyCt4yGcakbxJ', 'informed', 'active', '2025-07-05 13:00:18', '2025-06-05 11:00:18'),
(9, 11, 'sub_1RWdPxGdVvFQyCt4eWzoCNaU', 'curious', 'active', '2025-07-05 15:01:15', '2025-06-05 13:01:15'),
(10, 12, 'sub_1RWdTDGdVvFQyCt45dC5ajGj', 'insider', 'active', '2025-07-05 15:04:37', '2025-06-05 13:04:36'),
(11, 13, 'sub_1RWdXlGdVvFQyCt4xpoveqGg', 'informed', 'active', '2025-07-05 15:09:19', '2025-06-05 13:09:19'),
(12, 13, 'sub_1RWdYYGdVvFQyCt4ilYwM8K4', 'insider', 'active', '2025-07-05 15:10:08', '2025-06-05 13:10:08');

-- --------------------------------------------------------

--
-- Tabellstruktur `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `subscription_level` enum('not_subscribed','curious','informed','insider') DEFAULT 'not_subscribed',
  `subscription_status` varchar(50) DEFAULT 'inactive',
  `stripe_customer_id` varchar(255) DEFAULT NULL,
  `stripe_subscription_id` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumpning av Data i tabell `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `subscription_level`, `subscription_status`, `stripe_customer_id`, `stripe_subscription_id`, `created_at`) VALUES
(8, 'Kevin Rob 2', 'linglongers@gmail.com', '$2b$10$FncpU2VVlCL0bouO9GW9H.BzR9D2xw9jvYdHeIC/kWYpUQNll7ibm', 'curious', 'active', 'cus_SRU3QtauNOc4tY', 'sub_1RWbFGGdVvFQyCt4d7fXjApG', '2025-06-05 10:26:37'),
(9, 'hubba bubba', 'john.doe@gmail.com', '$2b$10$fQJnZMYRho16QnI45U6BtekhmiV4/6cYjvldZMqP0WhpYLXW6cm.6', 'informed', 'active', 'cus_SRUVqDmygRW8dA', 'sub_1RWbWuGdVvFQyCt4yGcakbxJ', '2025-06-05 10:59:47'),
(11, 'hello', 'admin@hotmale.com', '$2b$10$NDbB.mwiRj7PCvm.xLbdLOFmGz/i24KlV6pbk/o6BN8Rktp9rJN5S', 'curious', 'active', 'cus_SRWS9N6O7vIoii', 'sub_1RWdPxGdVvFQyCt4eWzoCNaU', '2025-06-05 13:00:47'),
(12, 'car', 'walla@gmail.com', '$2b$10$9C425WGWCfdlCFRxtrXyL.FhDWbLRGG8DSbXj.nBpasbpY8o5zq2O', 'insider', 'active', 'cus_SRWWfl26ufJcxh', 'sub_1RWdTDGdVvFQyCt45dC5ajGj', '2025-06-05 13:04:06'),
(13, 'i love pancakes', 'hej@gmail.com', '$2b$10$Ybsi7AKhJuoLRWtWzCYcE.zkxpvdQhSqV/RXisj6Pq2YhBpwLKQ9m', '', 'active', 'cus_SRWadaIZL1p9Xj', 'sub_1RWdYYGdVvFQyCt4ilYwM8K4', '2025-06-05 13:08:22'),
(14, 'bror', 'bror@gmail.com', '$2b$10$rGigNItdSGwl6koAP3G8n.ShEvEln/AsWYm27DCRF7mPJ702YBqvy', '', 'inactive', NULL, NULL, '2025-06-05 13:16:57');

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT för tabell `subscriptions`
--
ALTER TABLE `subscriptions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT för tabell `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

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
