-- MySQL Database Schema and Seed Data for Movement Register
-- Create the database if it doesn't exist
CREATE DATABASE IF NOT EXISTS `dashboard_db`;
USE `dashboard_db`;

-- 1. Create Employees Table
DROP TABLE IF EXISTS `Employees`;
CREATE TABLE `Employees` (
  `id` VARCHAR(255) NOT NULL,
  `name` VARCHAR(255) NOT NULL,   
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Create Movements Table
DROP TABLE IF EXISTS `Movements`;
CREATE TABLE `Movements` (
  `id` VARCHAR(255) NOT NULL,
  `employeeName` VARCHAR(255) NOT NULL,
  `employeeId` VARCHAR(255) NOT NULL,
  `outTime` DATETIME NOT NULL,
  `returnTime` DATETIME DEFAULT NULL,
  `informTo` VARCHAR(255) NOT NULL,
  `visitLocation` VARCHAR(255) DEFAULT NULL,
  `purpose` TEXT NOT NULL,
  `date` VARCHAR(255) NOT NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Seed Employee Data
INSERT INTO `Employees` (`id`, `name`) VALUES
('203107', 'Manaswini Behera'),
('106346', 'Lonalisa Badajena'),
('202889', 'Mukul Pattnaik'),
('204805', 'Abinash Das'),
('206993', 'Ritwik Nandy'),
('203129', 'Satyajeet Sahoo'),
('206999', 'Laboni Pratihar'),
('202885', 'Bikku Kumar'),
('207000', 'Diptiranjan Nayak'),
('205186', 'Sunita Rout'),
('203826', 'Anmol Nayak'),
('206997', 'Santosh Kumar Rout'),
('207070', 'Suchismita Dash'),
('107113', 'Ashabari Dhal'),
('209677', 'Mitali Madhusmita Sahoo'),
('203117', 'Pratik Ray'),
('203146', 'Rajesh Ojha'),
('107200', 'Dibya Kishor Bishi'),
('204000', 'Bijay Kumar Maharana'),
('107119', 'Rajat Ku Mohanty'),
('204826', 'Sanjay Kumar Sahoo'),
('107121', 'Sashikanta Behera'),
('107106', 'Rajesh Kumar Bal'),
('203114', 'Susant Kumar Pradhan'),
('204821', 'Ranjit Singh Purty'),
('203109', 'Sandeep Sahoo'),
('203620', 'Sunil Kumar Barik'),
('205359', 'Gopabandhu Behera'),
('204381', 'Pankaj Kumar Dash'),
('206599', 'Rajeeb Lochan Mishra'),
('207046', 'Babul Patra'),
('210846', 'Satwik Kanungo'),
('211362', 'Satyabrata swain'),
('201901', 'Pradeep Kumar Sahoo'),
('205357', 'Papu Behera'),
('210764', 'Tapaswini Ojha'),
('210762', 'Ananya Mahapatra'),
('210918', 'Pritipuspa Barik'),
('210763', 'Md Danish Alam'),
('210761', 'Sidhanta Barik'),
('210759', 'Santosh Kumar Sahoo'),
('210760', 'Rikon kumar parida'),
('210690', 'Soumya Ranjan Das'),
('210919', 'Jyotiranjan Nayak'),
('211210', 'Amlan Nanda'),
('211604', 'BijayaKetan Sahoo');
