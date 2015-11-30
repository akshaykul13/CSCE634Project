-- phpMyAdmin SQL Dump
-- version 4.4.10
-- http://www.phpmyadmin.net
--
-- Host: localhost:3306
-- Generation Time: Nov 30, 2015 at 06:22 AM
-- Server version: 5.5.42
-- PHP Version: 5.6.10

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

--
-- Database: `langauger`
--

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `firstname` varchar(25) NOT NULL,
  `lastname` varchar(25) NOT NULL,
  `email` varchar(50) NOT NULL,
  `password` varchar(15) NOT NULL
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=latin1;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `firstname`, `lastname`, `email`, `password`) VALUES
(1, 'Akshay', 'Kulkarni', 'asd', 'qwe'),
(2, '', '', 'qwe', 'qwe'),
(3, 'test', 'test', 'test', 'test');

-- --------------------------------------------------------

--
-- Table structure for table `words`
--

CREATE TABLE `words` (
  `id` int(11) NOT NULL,
  `userid` int(11) NOT NULL,
  `word` varchar(30) NOT NULL,
  `language` varchar(15) NOT NULL
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=latin1;

--
-- Dumping data for table `words`
--

INSERT INTO `words` (`id`, `userid`, `word`, `language`) VALUES
(1, 1, 'high', ''),
(2, 1, 'quality', ''),
(3, 1, 'quality', 'fr'),
(4, 1, 'familiar', 'ru'),
(6, 1, 'with', 'ru'),
(7, 1, 'familiar', 'es'),
(8, 1, 'create', 'es'),
(9, 1, 'functionality', 'es'),
(10, 1, 'feel', 'es'),
(11, 1, 'Extensions', 'es'),
(12, 1, 'add', 'es'),
(13, 1, 'create', 'de'),
(14, 1, 'create', 'ru'),
(15, 1, 'extensions', 'fr'),
(16, 1, 'familiar', 'fr'),
(17, 1, 'userid', 'fr'),
(18, 1, 'Getting', 'fr'),
(19, 1, 'provided', 'fr'),
(20, 1, 'background', 'fr'),
(21, 1, 'vocalize', 'fr'),
(22, 1, 'add', 'fr'),
(23, -1, 'extensions', 'fr'),
(24, 1, 'built', 'ru');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `words`
--
ALTER TABLE `words`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=4;
--
-- AUTO_INCREMENT for table `words`
--
ALTER TABLE `words`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=25;