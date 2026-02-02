-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Feb 01, 2026 at 08:18 AM
-- Server version: 9.4.0
-- PHP Version: 8.2.12

SET SQL_MODE = '';
SET FOREIGN_KEY_CHECKS = 0;
USE `defaultdb`;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Imported to Aiven defaultdb
--

-- --------------------------------------------------------

--
-- Table structure for table `appointments`
--

DROP TABLE IF EXISTS `appointments`;
CREATE TABLE IF NOT EXISTS `appointments` (
  `appointment_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `customer_name` varchar(100) DEFAULT NULL,
  `customer_email` varchar(100) DEFAULT NULL,
  `customer_phone` varchar(20) DEFAULT NULL,
  `service_types` json DEFAULT NULL,
  `appointment_date` date NOT NULL,
  `time_slot` varchar(20) DEFAULT NULL,
  `appointment_time` varchar(20) DEFAULT NULL,
  `status` enum('pending','confirmed','completed','cancelled') DEFAULT 'pending',
  `priority` enum('low','medium','high') DEFAULT 'medium',
  `notes` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`appointment_id`),
  KEY `user_id` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=108 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `appointments`
--

INSERT INTO `appointments` (`appointment_id`, `user_id`, `customer_name`, `customer_email`, `customer_phone`, `service_types`, `appointment_date`, `time_slot`, `appointment_time`, `status`, `priority`, `notes`, `created_at`, `updated_at`) VALUES
(1, 12, 'vaibhav patil', 'vaibhav.patil@gmail.com', '9876543219', '[\"Custom Design\", \"Measurements\", \"Fabric Selection\"]', '2025-11-30', '12:00 PM - 01:00 PM', '12:00 PM', 'confirmed', 'medium', 'Modern fusion designs preferred', '2025-11-29 11:32:23', '2025-11-29 11:32:23'),
(2, 3, 'siddhirath mane', 'siddhirath.mane@gmail.com', '9876543212', '[\"Fitting Session\"]', '2025-12-02', '12:00 PM - 01:00 PM', '12:00 PM', 'confirmed', 'high', 'Budget conscious customer', '2025-11-30 23:33:43', '2025-11-30 23:33:43'),
(3, 11, 'prathamesh bansode', 'prathamesh.bansode@gmail.com', '9876543218', '[\"Fitting Session\"]', '2025-12-01', '05:00 PM - 06:00 PM', '05:00 PM', 'confirmed', 'medium', 'Budget conscious customer', '2025-11-29 22:59:24', '2025-11-29 22:59:24'),
(4, 9, 'aditya dhanawade', 'aditya.dhanawade@gmail.com', '9876543215', '[\"Fitting Session\"]', '2025-11-29', '10:00 AM - 11:00 AM', '10:00 AM', 'pending', 'medium', 'Budget conscious customer', '2025-11-28 13:13:50', '2025-11-28 13:13:50'),
(5, 7, 'Matyur Sankpal', 'mayur445@gmail.com', '9876543211', '[\"Custom Design\", \"Measurements\", \"Fabric Selection\"]', '2025-12-02', '03:00 PM - 04:00 PM', '03:00 PM', 'confirmed', 'high', 'Looking for traditional wear', '2025-11-30 18:54:06', '2025-11-30 18:54:06'),
(6, 11, 'prathamesh bansode', 'prathamesh.bansode@gmail.com', '9876543218', '[\"Design Consultation\", \"Fabric Selection\"]', '2025-11-27', '04:00 PM - 05:00 PM', '04:00 PM', 'confirmed', 'high', 'Budget conscious customer', '2025-11-26 08:45:27', '2025-11-26 08:45:27'),
(7, 9, 'aditya dhanawade', 'aditya.dhanawade@gmail.com', '9876543215', '[\"Custom Tailoring\", \"Measurements\"]', '2025-11-29', '12:00 PM - 01:00 PM', '12:00 PM', 'pending', 'high', 'Customer interested in wedding collection', '2025-11-28 01:33:34', '2025-11-28 01:33:34'),
(8, 11, 'prathamesh bansode', 'prathamesh.bansode@gmail.com', '9876543218', '[\"Wedding Outfit Consultation\"]', '2025-11-26', '02:00 PM - 03:00 PM', '02:00 PM', 'completed', 'low', 'Customer interested in wedding collection', '2025-11-24 19:54:39', '2025-11-24 19:54:39'),
(9, 8, 'shravan mane', 'shravan.mane@gmail.com', '9876543213', '[\"Style Advisory\"]', '2025-11-30', '12:00 PM - 01:00 PM', '12:00 PM', 'confirmed', 'low', 'Budget conscious customer', '2025-11-29 17:21:26', '2025-11-29 17:21:26'),
(10, 7, 'Matyur Sankpal', 'mayur445@gmail.com', '9876543211', '[\"Alteration Service\"]', '2025-11-26', '04:00 PM - 05:00 PM', '04:00 PM', 'pending', 'medium', 'Customer interested in wedding collection', '2025-11-25 06:37:55', '2025-11-25 06:37:55'),
(11, 10, 'Customer 91', 'customer11@example.com', '+917648720061', '[\"Fabric Selection\", \"Custom Design\"]', '2025-12-10', '02:00 PM', '05:00 PM', 'confirmed', 'medium', 'Appointment for Fabric Selection, Custom Design', '2025-12-11 17:57:02', '2025-12-11 17:57:02'),
(12, 2, 'Customer 53', 'customer61@example.com', '+913992061325', '[\"Design Consultation\"]', '2025-12-09', '06:00 PM', '09:00 AM', 'confirmed', 'low', 'Appointment for Design Consultation', '2025-12-11 17:57:02', '2025-12-11 17:57:02'),
(13, 8, 'Customer 61', 'customer6@example.com', '+915039666311', '[\"Style Advisory\"]', '2025-12-02', '06:00 PM', '11:00 AM', 'completed', 'high', 'Appointment for Style Advisory', '2025-12-11 17:57:02', '2025-12-11 17:57:02'),
(14, 9, 'Customer 66', 'customer59@example.com', '+917920368505', '[\"Style Consultation\"]', '2025-12-25', '09:00 AM', '12:00 PM', 'confirmed', 'medium', 'Appointment for Style Consultation', '2025-12-11 17:57:02', '2025-12-11 17:57:02'),
(15, 6, 'Customer 34', 'customer68@example.com', '+918125302407', '[\"Style Consultation\", \"Wedding Outfit Consultation\", \"Fitting Session\"]', '2025-12-26', '02:00 PM', '12:00 PM', 'pending', 'high', 'Appointment for Style Consultation, Wedding Outfit Consultation, Fitting Session', '2025-12-11 17:57:02', '2025-12-11 17:57:02'),
(16, 3, 'Customer 33', 'customer1@example.com', '+918369333340', '[\"Measurements\", \"Custom Tailoring\"]', '2025-12-25', '05:00 PM', '06:00 PM', 'pending', 'high', 'Appointment for Measurements, Custom Tailoring', '2025-12-11 17:57:02', '2025-12-11 17:57:02'),
(17, 2, 'Customer 31', 'customer92@example.com', '+918248509375', '[\"Alteration Service\", \"Design Consultation\", \"Wedding Outfit Consultation\"]', '2025-12-25', '02:00 PM', '12:00 PM', 'confirmed', 'medium', 'Appointment for Alteration Service, Design Consultation, Wedding Outfit Consultation', '2025-12-11 17:57:02', '2025-12-11 17:57:02'),
(18, 2, 'Customer 21', 'customer85@example.com', '+919092267555', '[\"Fitting Session\", \"Custom Tailoring\", \"Fabric Selection\"]', '2025-12-25', '04:00 PM', '02:00 PM', 'pending', 'low', 'Appointment for Fitting Session, Custom Tailoring, Fabric Selection', '2025-12-11 17:57:02', '2025-12-11 17:57:02'),
(19, 7, 'Customer 6', 'customer98@example.com', '+913017181909', '[\"Measurements\", \"Wedding Outfit Consultation\", \"Custom Tailoring\"]', '2025-12-16', '03:00 PM', '12:00 PM', 'completed', 'medium', 'Appointment for Measurements, Wedding Outfit Consultation, Custom Tailoring', '2025-12-11 17:57:02', '2025-12-11 17:57:02'),
(20, 4, 'Customer 61', 'customer76@example.com', '+911197243612', '[\"Fitting Session\"]', '2025-12-03', '01:00 PM', '06:00 PM', 'confirmed', 'medium', 'Appointment for Fitting Session', '2025-12-11 17:57:02', '2025-12-11 17:57:02'),
(21, 8, 'Customer 24', 'customer80@example.com', '+913344706341', '[\"Fabric Selection\", \"Style Advisory\"]', '2025-11-17', '02:00 PM', '04:00 PM', 'confirmed', 'low', 'Appointment for Fabric Selection, Style Advisory', '2025-12-11 17:57:02', '2025-12-11 17:57:02'),
(22, 6, 'Customer 50', 'customer9@example.com', '+915352369139', '[\"Style Advisory\", \"Fitting Session\"]', '2025-11-14', '12:00 PM', '03:00 PM', 'completed', 'high', 'Appointment for Style Advisory, Fitting Session', '2025-12-11 17:57:02', '2025-12-11 17:57:02'),
(23, 3, 'Customer 22', 'customer41@example.com', '+914843483474', '[\"Fitting Session\", \"Measurements\"]', '2025-11-14', '03:00 PM', '05:00 PM', 'pending', 'medium', 'Appointment for Fitting Session, Measurements', '2025-12-11 17:57:02', '2025-12-11 17:57:02'),
(24, 6, 'Customer 74', 'customer87@example.com', '+913301360170', '[\"Design Consultation\", \"Fitting Session\"]', '2025-11-24', '09:00 AM', '10:00 AM', 'cancelled', 'high', 'Appointment for Design Consultation, Fitting Session', '2025-12-11 17:57:02', '2025-12-11 17:57:02'),
(25, 3, 'Customer 76', 'customer1@example.com', '+918383489556', '[\"Custom Tailoring\"]', '2025-11-22', '11:00 AM', '05:00 PM', 'cancelled', 'medium', 'Appointment for Custom Tailoring', '2025-12-11 17:57:02', '2025-12-11 17:57:02'),
(26, 1, 'Customer 45', 'customer49@example.com', '+914412482701', '[\"Wedding Outfit Consultation\", \"Style Advisory\"]', '2025-11-09', '06:00 PM', '02:00 PM', 'cancelled', 'high', 'Appointment for Wedding Outfit Consultation, Style Advisory', '2025-12-11 17:57:02', '2025-12-11 17:57:02'),
(27, 1, 'Customer 41', 'customer26@example.com', '+918046500912', '[\"Alteration Service\"]', '2025-11-08', '12:00 PM', '10:00 AM', 'confirmed', 'high', 'Appointment for Alteration Service', '2025-12-11 17:57:02', '2025-12-11 17:57:02'),
(28, 6, 'Customer 26', 'customer64@example.com', '+918563546402', '[\"Alteration Service\"]', '2025-11-01', '12:00 PM', '03:00 PM', 'completed', 'low', 'Appointment for Alteration Service', '2025-12-11 17:57:02', '2025-12-11 17:57:02'),
(29, 1, 'Customer 28', 'customer14@example.com', '+912999642999', '[\"Style Consultation\", \"Style Advisory\"]', '2025-11-13', '03:00 PM', '10:00 AM', 'confirmed', 'low', 'Appointment for Style Consultation, Style Advisory', '2025-12-11 17:57:02', '2025-12-11 17:57:02'),
(30, 6, 'Customer 20', 'customer11@example.com', '+915264663326', '[\"Design Consultation\"]', '2025-10-31', '05:00 PM', '01:00 PM', 'completed', 'low', 'Appointment for Design Consultation', '2025-12-11 17:57:02', '2025-12-11 17:57:02'),
(31, 2, 'Customer 19', 'customer56@example.com', '+912174255562', '[\"Fitting Session\"]', '2025-11-18', '02:00 PM', '06:00 PM', 'completed', 'low', 'Appointment for Fitting Session', '2025-12-11 17:57:02', '2025-12-11 17:57:02'),
(32, 4, 'Customer 23', 'customer85@example.com', '+914991232679', '[\"Design Consultation\"]', '2025-11-05', '03:00 PM', '12:00 PM', 'cancelled', 'high', 'Appointment for Design Consultation', '2025-12-11 17:57:02', '2025-12-11 17:57:02'),
(33, 6, 'Customer 80', 'customer67@example.com', '+918517789538', '[\"Design Consultation\"]', '2025-11-14', '11:00 AM', '12:00 PM', 'pending', 'high', 'Appointment for Design Consultation', '2025-12-11 17:57:02', '2025-12-11 17:57:02'),
(34, 8, 'Customer 42', 'customer10@example.com', '+912661735045', '[\"Custom Tailoring\", \"Fabric Selection\", \"Wedding Outfit Consultation\"]', '2025-10-31', '04:00 PM', '04:00 PM', 'cancelled', 'high', 'Appointment for Custom Tailoring, Fabric Selection, Wedding Outfit Consultation', '2025-12-11 17:57:02', '2025-12-11 17:57:02'),
(35, 4, 'Customer 45', 'customer93@example.com', '+913942020452', '[\"Style Consultation\"]', '2025-10-07', '11:00 AM', '01:00 PM', 'cancelled', 'high', 'Appointment for Style Consultation', '2025-12-11 17:57:02', '2025-12-11 17:57:02'),
(36, 9, 'Customer 52', 'customer9@example.com', '+918772886468', '[\"Custom Tailoring\", \"Measurements\", \"Style Advisory\"]', '2025-10-23', '11:00 AM', '05:00 PM', 'confirmed', 'low', 'Appointment for Custom Tailoring, Measurements, Style Advisory', '2025-12-11 17:57:02', '2025-12-11 17:57:02'),
(37, 6, 'Customer 70', 'customer39@example.com', '+913948693464', '[\"Style Advisory\", \"Fabric Selection\"]', '2025-10-13', '03:00 PM', '11:00 AM', 'confirmed', 'high', 'Appointment for Style Advisory, Fabric Selection', '2025-12-11 17:57:02', '2025-12-11 17:57:02'),
(38, 2, 'Customer 65', 'customer81@example.com', '+915854778884', '[\"Fabric Selection\", \"Design Consultation\"]', '2025-10-13', '04:00 PM', '06:00 PM', 'completed', 'high', 'Appointment for Fabric Selection, Design Consultation', '2025-12-11 17:57:02', '2025-12-11 17:57:02'),
(39, 9, 'Customer 49', 'customer17@example.com', '+918200803811', '[\"Alteration Service\", \"Style Consultation\"]', '2025-10-03', '04:00 PM', '04:00 PM', 'cancelled', 'high', 'Appointment for Alteration Service, Style Consultation', '2025-12-11 17:57:02', '2025-12-11 17:57:02'),
(40, 7, 'Customer 81', 'customer87@example.com', '+915726016438', '[\"Measurements\"]', '2025-10-17', '11:00 AM', '03:00 PM', 'cancelled', 'medium', 'Appointment for Measurements', '2025-12-11 17:57:02', '2025-12-11 17:57:02'),
(41, 5, 'Customer 27', 'customer39@example.com', '+912618544762', '[\"Custom Design\", \"Design Consultation\"]', '2025-10-14', '03:00 PM', '09:00 AM', 'cancelled', 'high', 'Appointment for Custom Design, Design Consultation', '2025-12-11 17:57:02', '2025-12-11 17:57:02'),
(42, 9, 'Customer 59', 'customer26@example.com', '+911078658287', '[\"Style Consultation\"]', '2025-10-03', '12:00 PM', '11:00 AM', 'cancelled', 'high', 'Appointment for Style Consultation', '2025-12-11 17:57:02', '2025-12-11 17:57:02'),
(43, 8, 'Customer 54', 'customer3@example.com', '+919487135345', '[\"Design Consultation\", \"Measurements\", \"Fabric Selection\"]', '2025-10-23', '12:00 PM', '05:00 PM', 'completed', 'medium', 'Appointment for Design Consultation, Measurements, Fabric Selection', '2025-12-11 17:57:02', '2025-12-11 17:57:02'),
(44, 10, 'Customer 29', 'customer95@example.com', '+919894434980', '[\"Custom Tailoring\"]', '2025-10-07', '02:00 PM', '03:00 PM', 'pending', 'low', 'Appointment for Custom Tailoring', '2025-12-11 17:57:02', '2025-12-11 17:57:02'),
(45, 9, 'Customer 56', 'customer39@example.com', '+916886213141', '[\"Style Advisory\", \"Fabric Selection\", \"Wedding Outfit Consultation\"]', '2025-10-06', '03:00 PM', '03:00 PM', 'confirmed', 'low', 'Appointment for Style Advisory, Fabric Selection, Wedding Outfit Consultation', '2025-12-11 17:57:02', '2025-12-11 17:57:02'),
(46, 7, 'Customer 82', 'customer69@example.com', '+916268571882', '[\"Style Advisory\"]', '2025-10-09', '12:00 PM', '11:00 AM', 'pending', 'high', 'Appointment for Style Advisory', '2025-12-11 17:57:02', '2025-12-11 17:57:02'),
(47, 3, 'Customer 36', 'customer2@example.com', '+918807862714', '[\"Fabric Selection\"]', '2025-10-20', '09:00 AM', '12:00 PM', 'cancelled', 'low', 'Appointment for Fabric Selection', '2025-12-11 17:57:02', '2025-12-11 17:57:02'),
(48, 5, 'Customer 43', 'customer27@example.com', '+916969344679', '[\"Custom Design\"]', '2025-09-08', '02:00 PM', '12:00 PM', 'pending', 'low', 'Appointment for Custom Design', '2025-12-11 17:57:02', '2025-12-11 17:57:02'),
(49, 9, 'Customer 6', 'customer87@example.com', '+914545500201', '[\"Fabric Selection\", \"Custom Tailoring\"]', '2025-09-09', '02:00 PM', '05:00 PM', 'completed', 'medium', 'Appointment for Fabric Selection, Custom Tailoring', '2025-12-11 17:57:02', '2025-12-11 17:57:02'),
(50, 8, 'Customer 20', 'customer87@example.com', '+913128228583', '[\"Custom Tailoring\", \"Design Consultation\", \"Fabric Selection\"]', '2025-09-03', '12:00 PM', '12:00 PM', 'cancelled', 'low', 'Appointment for Custom Tailoring, Design Consultation, Fabric Selection', '2025-12-11 17:57:02', '2025-12-11 17:57:02'),
(51, 6, 'Customer 11', 'customer15@example.com', '+918786220901', '[\"Fabric Selection\", \"Fitting Session\", \"Custom Design\"]', '2025-08-31', '02:00 PM', '06:00 PM', 'cancelled', 'high', 'Appointment for Fabric Selection, Fitting Session, Custom Design', '2025-12-11 17:57:02', '2025-12-11 17:57:02'),
(52, 6, 'Customer 8', 'customer100@example.com', '+912446261870', '[\"Design Consultation\"]', '2025-09-24', '03:00 PM', '02:00 PM', 'confirmed', 'high', 'Appointment for Design Consultation', '2025-12-11 17:57:02', '2025-12-11 17:57:02'),
(53, 5, 'Customer 64', 'customer50@example.com', '+914795341532', '[\"Fitting Session\"]', '2025-09-04', '10:00 AM', '10:00 AM', 'cancelled', 'high', 'Appointment for Fitting Session', '2025-12-11 17:57:02', '2025-12-11 17:57:02'),
(54, 4, 'Customer 70', 'customer11@example.com', '+915482163141', '[\"Alteration Service\", \"Fabric Selection\"]', '2025-09-17', '01:00 PM', '11:00 AM', 'confirmed', 'medium', 'Appointment for Alteration Service, Fabric Selection', '2025-12-11 17:57:02', '2025-12-11 17:57:02'),
(55, 2, 'Customer 45', 'customer100@example.com', '+917893521016', '[\"Fitting Session\"]', '2025-09-25', '06:00 PM', '03:00 PM', 'confirmed', 'medium', 'Appointment for Fitting Session', '2025-12-11 17:57:02', '2025-12-11 17:57:02'),
(56, 1, 'Customer 8', 'customer71@example.com', '+919907140156', '[\"Fabric Selection\", \"Measurements\"]', '2025-08-20', '12:00 PM', '01:00 PM', 'completed', 'medium', 'Appointment for Fabric Selection, Measurements', '2025-12-11 17:57:02', '2025-12-11 17:57:02'),
(57, 4, 'Customer 100', 'customer60@example.com', '+916052951242', '[\"Design Consultation\", \"Wedding Outfit Consultation\"]', '2025-08-27', '06:00 PM', '12:00 PM', 'confirmed', 'high', 'Appointment for Design Consultation, Wedding Outfit Consultation', '2025-12-11 17:57:02', '2025-12-11 17:57:02'),
(58, 9, 'Customer 4', 'customer10@example.com', '+916543850896', '[\"Style Advisory\", \"Custom Tailoring\"]', '2025-08-16', '03:00 PM', '04:00 PM', 'cancelled', 'high', 'Appointment for Style Advisory, Custom Tailoring', '2025-12-11 17:57:02', '2025-12-11 17:57:02'),
(59, 3, 'Customer 83', 'customer82@example.com', '+913572110016', '[\"Custom Tailoring\", \"Style Consultation\", \"Measurements\"]', '2025-08-01', '10:00 AM', '04:00 PM', 'cancelled', 'medium', 'Appointment for Custom Tailoring, Style Consultation, Measurements', '2025-12-11 17:57:02', '2025-12-11 17:57:02'),
(60, 7, 'Customer 8', 'customer91@example.com', '+914412106306', '[\"Wedding Outfit Consultation\"]', '2025-08-19', '09:00 AM', '04:00 PM', 'confirmed', 'low', 'Appointment for Wedding Outfit Consultation', '2025-12-11 17:57:02', '2025-12-11 17:57:02'),
(61, 6, 'Customer 34', 'customer15@example.com', '+918383522355', '[\"Measurements\"]', '2025-08-22', '12:00 PM', '01:00 PM', 'completed', 'high', 'Appointment for Measurements', '2025-12-11 17:57:02', '2025-12-11 17:57:02'),
(62, 4, 'Customer 46', 'customer100@example.com', '+916876667567', '[\"Custom Design\", \"Custom Tailoring\"]', '2025-08-21', '09:00 AM', '03:00 PM', 'completed', 'low', 'Appointment for Custom Design, Custom Tailoring', '2025-12-11 17:57:02', '2025-12-11 17:57:02'),
(63, 1, 'Customer 35', 'customer49@example.com', '+918747701254', '[\"Design Consultation\"]', '2025-08-23', '12:00 PM', '02:00 PM', 'pending', 'low', 'Appointment for Design Consultation', '2025-12-11 17:57:02', '2025-12-11 17:57:02'),
(64, 8, 'Customer 25', 'customer95@example.com', '+912673844214', '[\"Custom Design\"]', '2025-08-03', '04:00 PM', '12:00 PM', 'completed', 'high', 'Appointment for Custom Design', '2025-12-11 17:57:02', '2025-12-11 17:57:02'),
(65, 10, 'Customer 41', 'customer97@example.com', '+914890176112', '[\"Measurements\", \"Fabric Selection\"]', '2025-08-20', '05:00 PM', '09:00 AM', 'cancelled', 'high', 'Appointment for Measurements, Fabric Selection', '2025-12-11 17:57:02', '2025-12-11 17:57:02'),
(66, 3, 'Customer 1', 'customer83@example.com', '+912455845097', '[\"Custom Design\", \"Alteration Service\", \"Custom Tailoring\"]', '2025-08-23', '05:00 PM', '05:00 PM', 'pending', 'medium', 'Appointment for Custom Design, Alteration Service, Custom Tailoring', '2025-12-11 17:57:02', '2025-12-11 17:57:02'),
(67, 3, 'Customer 93', 'customer83@example.com', '+915556243504', '[\"Alteration Service\", \"Fabric Selection\"]', '2025-08-06', '12:00 PM', '10:00 AM', 'cancelled', 'low', 'Appointment for Alteration Service, Fabric Selection', '2025-12-11 17:57:02', '2025-12-11 17:57:02'),
(68, 5, 'Customer 99', 'customer91@example.com', '+916301680679', '[\"Style Consultation\", \"Fabric Selection\", \"Style Advisory\"]', '2025-08-10', '11:00 AM', '12:00 PM', 'cancelled', 'high', 'Appointment for Style Consultation, Fabric Selection, Style Advisory', '2025-12-11 17:57:02', '2025-12-11 17:57:02'),
(69, 5, 'Customer 20', 'customer1@example.com', '+918978439763', '[\"Custom Design\"]', '2025-08-03', '01:00 PM', '06:00 PM', 'completed', 'low', 'Appointment for Custom Design', '2025-12-11 17:57:02', '2025-12-11 17:57:02'),
(70, 4, 'Customer 78', 'customer95@example.com', '+914881232988', '[\"Fitting Session\"]', '2025-07-05', '09:00 AM', '10:00 AM', 'completed', 'high', 'Appointment for Fitting Session', '2025-12-11 17:57:02', '2025-12-11 17:57:02'),
(71, 10, 'Customer 80', 'customer62@example.com', '+916831824020', '[\"Fitting Session\"]', '2025-07-13', '02:00 PM', '01:00 PM', 'pending', 'medium', 'Appointment for Fitting Session', '2025-12-11 17:57:02', '2025-12-11 17:57:02'),
(72, 8, 'Customer 52', 'customer38@example.com', '+917259734373', '[\"Wedding Outfit Consultation\"]', '2025-07-21', '11:00 AM', '01:00 PM', 'pending', 'medium', 'Appointment for Wedding Outfit Consultation', '2025-12-11 17:57:02', '2025-12-11 17:57:02'),
(73, 4, 'Customer 58', 'customer87@example.com', '+912783589060', '[\"Fitting Session\"]', '2025-07-18', '02:00 PM', '04:00 PM', 'completed', 'high', 'Appointment for Fitting Session', '2025-12-11 17:57:02', '2025-12-11 17:57:02'),
(74, 3, 'Customer 17', 'customer88@example.com', '+911752415284', '[\"Fabric Selection\", \"Measurements\", \"Custom Tailoring\"]', '2025-07-03', '12:00 PM', '11:00 AM', 'pending', 'high', 'Appointment for Fabric Selection, Measurements, Custom Tailoring', '2025-12-11 17:57:02', '2025-12-11 17:57:02'),
(75, 3, 'Customer 44', 'customer9@example.com', '+915042039674', '[\"Design Consultation\", \"Style Advisory\"]', '2025-07-02', '05:00 PM', '10:00 AM', 'cancelled', 'medium', 'Appointment for Design Consultation, Style Advisory', '2025-12-11 17:57:02', '2025-12-11 17:57:02'),
(76, 5, 'Customer 85', 'customer87@example.com', '+911579128720', '[\"Design Consultation\", \"Alteration Service\", \"Custom Tailoring\"]', '2025-07-20', '10:00 AM', '02:00 PM', 'cancelled', 'high', 'Appointment for Design Consultation, Alteration Service, Custom Tailoring', '2025-12-11 17:57:02', '2025-12-11 17:57:02'),
(77, 4, 'Customer 83', 'customer65@example.com', '+917846440116', '[\"Style Consultation\"]', '2025-07-26', '10:00 AM', '11:00 AM', 'completed', 'medium', 'Appointment for Style Consultation', '2025-12-11 17:57:02', '2025-12-11 17:57:02'),
(78, 8, 'Customer 50', 'customer54@example.com', '+912696888569', '[\"Style Advisory\", \"Custom Design\"]', '2025-07-10', '06:00 PM', '01:00 PM', 'completed', 'low', 'Appointment for Style Advisory, Custom Design', '2025-12-11 17:57:02', '2025-12-11 17:57:02'),
(79, 2, 'Customer 83', 'customer73@example.com', '+912826870108', '[\"Measurements\", \"Fitting Session\", \"Custom Design\"]', '2025-07-06', '10:00 AM', '10:00 AM', 'confirmed', 'low', 'Appointment for Measurements, Fitting Session, Custom Design', '2025-12-11 17:57:02', '2025-12-11 17:57:02'),
(80, 4, 'Customer 25', 'customer16@example.com', '+911056529257', '[\"Custom Tailoring\"]', '2025-07-02', '12:00 PM', '02:00 PM', 'completed', 'low', 'Appointment for Custom Tailoring', '2025-12-11 17:57:02', '2025-12-11 17:57:02'),
(81, 9, 'Customer 8', 'customer82@example.com', '+912998960236', '[\"Measurements\", \"Custom Tailoring\"]', '2025-07-14', '02:00 PM', '03:00 PM', 'completed', 'medium', 'Appointment for Measurements, Custom Tailoring', '2025-12-11 17:57:02', '2025-12-11 17:57:02'),
(82, 7, 'Customer 23', 'customer3@example.com', '+917299480677', '[\"Wedding Outfit Consultation\"]', '2025-07-04', '02:00 PM', '06:00 PM', 'confirmed', 'medium', 'Appointment for Wedding Outfit Consultation', '2025-12-11 17:57:02', '2025-12-11 17:57:02'),
(83, 3, 'Customer 5', 'customer49@example.com', '+912978414837', '[\"Design Consultation\", \"Custom Design\"]', '2025-07-02', '04:00 PM', '01:00 PM', 'confirmed', 'medium', 'Appointment for Design Consultation, Custom Design', '2025-12-11 17:57:02', '2025-12-11 17:57:02'),
(84, 7, 'Customer 79', 'customer1@example.com', '+911220271380', '[\"Wedding Outfit Consultation\", \"Style Advisory\"]', '2025-05-31', '01:00 PM', '10:00 AM', 'cancelled', 'high', 'Appointment for Wedding Outfit Consultation, Style Advisory', '2025-12-11 17:57:02', '2025-12-11 17:57:02'),
(85, 10, 'Customer 98', 'customer91@example.com', '+914216137089', '[\"Wedding Outfit Consultation\"]', '2025-06-24', '06:00 PM', '10:00 AM', 'confirmed', 'medium', 'Appointment for Wedding Outfit Consultation', '2025-12-11 17:57:02', '2025-12-11 17:57:02'),
(86, 10, 'Customer 72', 'customer17@example.com', '+914442815883', '[\"Wedding Outfit Consultation\"]', '2025-05-31', '01:00 PM', '01:00 PM', 'completed', 'low', 'Appointment for Wedding Outfit Consultation', '2025-12-11 17:57:02', '2025-12-11 17:57:02'),
(87, 4, 'Customer 47', 'customer3@example.com', '+912728243088', '[\"Custom Design\"]', '2025-06-03', '04:00 PM', '04:00 PM', 'pending', 'medium', 'Appointment for Custom Design', '2025-12-11 17:57:02', '2025-12-11 17:57:02'),
(88, 3, 'Customer 34', 'customer70@example.com', '+915287449540', '[\"Custom Design\", \"Fitting Session\"]', '2025-06-07', '02:00 PM', '05:00 PM', 'confirmed', 'medium', 'Appointment for Custom Design, Fitting Session', '2025-12-11 17:57:02', '2025-12-11 17:57:02'),
(89, 2, 'Customer 76', 'customer21@example.com', '+916987996617', '[\"Fitting Session\"]', '2025-06-09', '01:00 PM', '06:00 PM', 'pending', 'medium', 'Appointment for Fitting Session', '2025-12-11 17:57:02', '2025-12-11 17:57:02'),
(90, 4, 'Customer 91', 'customer23@example.com', '+912811422223', '[\"Fitting Session\", \"Style Consultation\"]', '2025-05-31', '10:00 AM', '09:00 AM', 'pending', 'medium', 'Appointment for Fitting Session, Style Consultation', '2025-12-11 17:57:02', '2025-12-11 17:57:02'),
(91, 3, 'Customer 76', 'customer22@example.com', '+911121180019', '[\"Fitting Session\"]', '2025-06-19', '12:00 PM', '03:00 PM', 'completed', 'low', 'Appointment for Fitting Session', '2025-12-11 17:57:02', '2025-12-11 17:57:02'),
(92, 7, 'Customer 95', 'customer3@example.com', '+912863908627', '[\"Alteration Service\", \"Custom Design\", \"Fabric Selection\"]', '2025-06-24', '09:00 AM', '11:00 AM', 'pending', 'low', 'Appointment for Alteration Service, Custom Design, Fabric Selection', '2025-12-11 17:57:02', '2025-12-11 17:57:02'),
(93, 6, 'Customer 97', 'customer29@example.com', '+919802004984', '[\"Custom Design\", \"Fabric Selection\", \"Measurements\"]', '2025-05-08', '06:00 PM', '03:00 PM', 'confirmed', 'high', 'Appointment for Custom Design, Fabric Selection, Measurements', '2025-12-11 17:57:02', '2025-12-11 17:57:02'),
(94, 7, 'Customer 12', 'customer84@example.com', '+918099379193', '[\"Style Consultation\", \"Design Consultation\"]', '2025-05-03', '02:00 PM', '03:00 PM', 'confirmed', 'medium', 'Appointment for Style Consultation, Design Consultation', '2025-12-11 17:57:02', '2025-12-11 17:57:02'),
(95, 3, 'Customer 67', 'customer33@example.com', '+919163178759', '[\"Fitting Session\", \"Fabric Selection\"]', '2025-05-16', '11:00 AM', '05:00 PM', 'confirmed', 'medium', 'Appointment for Fitting Session, Fabric Selection', '2025-12-11 17:57:02', '2025-12-11 17:57:02'),
(96, 7, 'Customer 48', 'customer49@example.com', '+918069168712', '[\"Wedding Outfit Consultation\"]', '2025-05-10', '05:00 PM', '04:00 PM', 'pending', 'high', 'Appointment for Wedding Outfit Consultation', '2025-12-11 17:57:02', '2025-12-11 17:57:02'),
(97, 1, 'Customer 34', 'customer49@example.com', '+913339219312', '[\"Design Consultation\"]', '2025-05-26', '11:00 AM', '05:00 PM', 'cancelled', 'medium', 'Appointment for Design Consultation', '2025-12-11 17:57:02', '2025-12-11 17:57:02'),
(98, 9, 'Customer 37', 'customer29@example.com', '+914259549443', '[\"Alteration Service\", \"Fitting Session\", \"Style Consultation\"]', '2025-05-02', '02:00 PM', '09:00 AM', 'cancelled', 'medium', 'Appointment for Alteration Service, Fitting Session, Style Consultation', '2025-12-11 17:57:02', '2025-12-11 17:57:02'),
(99, 4, 'Customer 23', 'customer98@example.com', '+915101014660', '[\"Design Consultation\"]', '2025-05-22', '03:00 PM', '09:00 AM', 'pending', 'high', 'Appointment for Design Consultation', '2025-12-11 17:57:02', '2025-12-11 17:57:02'),
(100, 2, 'Customer 89', 'customer57@example.com', '+912913589053', '[\"Style Advisory\"]', '2025-05-21', '04:00 PM', '09:00 AM', 'cancelled', 'medium', 'Appointment for Style Advisory', '2025-12-11 17:57:02', '2025-12-11 17:57:02'),
(101, 10, 'Customer 77', 'customer33@example.com', '+919758534040', '[\"Custom Tailoring\", \"Style Consultation\"]', '2025-05-17', '06:00 PM', '11:00 AM', 'confirmed', 'low', 'Appointment for Custom Tailoring, Style Consultation', '2025-12-11 17:57:02', '2025-12-11 17:57:02'),
(102, 3, 'Customer 43', 'customer4@example.com', '+913145567995', '[\"Style Advisory\"]', '2025-05-10', '05:00 PM', '06:00 PM', 'confirmed', 'medium', 'Appointment for Style Advisory', '2025-12-11 17:57:02', '2025-12-11 17:57:02'),
(103, 2, 'Customer 6', 'customer5@example.com', '+916044034103', '[\"Style Advisory\", \"Custom Design\"]', '2025-05-17', '09:00 AM', '10:00 AM', 'cancelled', 'medium', 'Appointment for Style Advisory, Custom Design', '2025-12-11 17:57:02', '2025-12-11 17:57:02'),
(104, 6, 'Customer 64', 'customer75@example.com', '+911721850075', '[\"Style Advisory\", \"Design Consultation\"]', '2025-05-17', '10:00 AM', '05:00 PM', 'cancelled', 'medium', 'Appointment for Style Advisory, Design Consultation', '2025-12-11 17:57:02', '2025-12-11 17:57:02'),
(105, 3, 'Customer 92', 'customer34@example.com', '+915310181966', '[\"Custom Tailoring\", \"Fitting Session\"]', '2025-05-16', '05:00 PM', '11:00 AM', 'cancelled', 'medium', 'Appointment for Custom Tailoring, Fitting Session', '2025-12-11 17:57:02', '2025-12-11 17:57:02'),
(106, 9, 'Customer 40', 'customer54@example.com', '+914505208972', '[\"Wedding Outfit Consultation\", \"Fabric Selection\", \"Design Consultation\"]', '2025-05-06', '09:00 AM', '03:00 PM', 'confirmed', 'medium', 'Appointment for Wedding Outfit Consultation, Fabric Selection, Design Consultation', '2025-12-11 17:57:02', '2025-12-11 17:57:02'),
(107, 9, 'Customer 85', 'customer96@example.com', '+911274487797', '[\"Fitting Session\"]', '2025-05-24', '12:00 PM', '04:00 PM', 'cancelled', 'high', 'Appointment for Fitting Session', '2025-12-11 17:57:02', '2025-12-11 17:57:02');

-- --------------------------------------------------------

--
-- Table structure for table `appointment_slots`
--

DROP TABLE IF EXISTS `appointment_slots`;
CREATE TABLE IF NOT EXISTS `appointment_slots` (
  `slot_id` int NOT NULL AUTO_INCREMENT,
  `slot_date` date NOT NULL,
  `time_slot` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `max_capacity` int DEFAULT '4',
  `booked_count` int DEFAULT '0',
  `is_available` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`slot_id`),
  UNIQUE KEY `unique_slot` (`slot_date`,`time_slot`),
  KEY `idx_date_availability` (`slot_date`,`is_available`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `appointment_slots`
--

INSERT INTO `appointment_slots` (`slot_id`, `slot_date`, `time_slot`, `max_capacity`, `booked_count`, `is_available`, `created_at`, `updated_at`) VALUES
(1, '2025-11-27', '1:00 PM To 3:00 PM', 4, 1, 1, '2025-11-20 06:00:59', '2025-11-20 06:00:59');

-- --------------------------------------------------------

--
-- Table structure for table `cart`
--

DROP TABLE IF EXISTS `cart`;
CREATE TABLE IF NOT EXISTS `cart` (
  `cart_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `product_id` int NOT NULL,
  `quantity` int NOT NULL DEFAULT '1',
  `size` varchar(10) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `added_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`cart_id`),
  UNIQUE KEY `unique_user_product_size` (`user_id`,`product_id`,`size`),
  KEY `user_id` (`user_id`),
  KEY `product_id` (`product_id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
CREATE TABLE IF NOT EXISTS `categories` (
  `category_id` int NOT NULL AUTO_INCREMENT,
  `name` enum('mens','womens','kids') COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`category_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`category_id`, `name`) VALUES
(1, 'mens'),
(2, 'womens'),
(3, 'kids');

-- --------------------------------------------------------

--
-- Table structure for table `custom_appointments`
--

DROP TABLE IF EXISTS `custom_appointments`;
CREATE TABLE IF NOT EXISTS `custom_appointments` (
  `appointment_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `appointment_date` date NOT NULL,
  `time_slot` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `service_types` json NOT NULL,
  `number_of_items` int NOT NULL DEFAULT '1',
  `full_address` text COLLATE utf8mb4_general_ci NOT NULL,
  `landmark` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `city` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `pincode` varchar(20) COLLATE utf8mb4_general_ci NOT NULL,
  `building_floor` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `message` text COLLATE utf8mb4_general_ci,
  `status` enum('pending','confirmed','completed','cancelled') COLLATE utf8mb4_general_ci DEFAULT 'pending',
  `consultation_fee` decimal(10,2) DEFAULT '250.00',
  `payment_status` enum('pending','paid','failed') COLLATE utf8mb4_general_ci DEFAULT 'pending',
  `payment_method` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `transaction_id` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `admin_notes` text COLLATE utf8mb4_general_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`appointment_id`),
  KEY `idx_user_appointments` (`user_id`),
  KEY `idx_appointment_date` (`appointment_date`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `custom_appointments`
--

INSERT INTO `custom_appointments` (`appointment_id`, `user_id`, `appointment_date`, `time_slot`, `service_types`, `number_of_items`, `full_address`, `landmark`, `city`, `pincode`, `building_floor`, `message`, `status`, `consultation_fee`, `payment_status`, `payment_method`, `transaction_id`, `admin_notes`, `created_at`, `updated_at`) VALUES
(1, 1, '2025-11-27', '1:00 PM To 3:00 PM', '[\"Suit Pant\"]', 3, 'near chaundeshwari temple ,At post goware\nTal Karad Dist Satara', 'chaundeshwari temple', 'Karad', '415105', 'Basement', NULL, 'confirmed', 250.00, 'pending', 'upi', '123456789101', NULL, '2025-11-20 06:00:59', '2025-11-20 06:01:19');

-- --------------------------------------------------------

--
-- Table structure for table `custom_orders`
--

DROP TABLE IF EXISTS `custom_orders`;
CREATE TABLE IF NOT EXISTS `custom_orders` (
  `custom_order_id` int NOT NULL AUTO_INCREMENT,
  `appointment_id` int NOT NULL,
  `user_id` int NOT NULL,
  `order_number` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `service_type` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `measurements` json DEFAULT NULL,
  `fabric_details` text COLLATE utf8mb4_general_ci,
  `fabric_provided_by` enum('customer','store') COLLATE utf8mb4_general_ci DEFAULT 'store',
  `special_instructions` text COLLATE utf8mb4_general_ci,
  `estimated_delivery_date` date DEFAULT NULL,
  `actual_delivery_date` date DEFAULT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `advance_paid` decimal(10,2) DEFAULT '0.00',
  `balance_amount` decimal(10,2) DEFAULT '0.00',
  `status` enum('pending','in_progress','ready','delivered','cancelled') COLLATE utf8mb4_general_ci DEFAULT 'pending',
  `payment_status` enum('pending','partial','paid') COLLATE utf8mb4_general_ci DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`custom_order_id`),
  UNIQUE KEY `order_number` (`order_number`),
  KEY `idx_user_orders` (`user_id`),
  KEY `idx_appointment` (`appointment_id`),
  KEY `idx_status` (`status`),
  KEY `idx_order_number` (`order_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `memberships`
--

DROP TABLE IF EXISTS `memberships`;
CREATE TABLE IF NOT EXISTS `memberships` (
  `membership_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `plan_type` enum('free','premium') COLLATE utf8mb4_general_ci DEFAULT 'free',
  `start_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `end_date` timestamp NULL DEFAULT NULL,
  `status` enum('active','expired','cancelled') COLLATE utf8mb4_general_ci DEFAULT 'active',
  `payment_status` enum('pending','paid','failed') COLLATE utf8mb4_general_ci DEFAULT 'pending',
  `payment_amount` decimal(10,2) DEFAULT '0.00',
  `transaction_id` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`membership_id`),
  KEY `idx_user_status` (`user_id`,`status`),
  KEY `idx_plan_type` (`plan_type`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `memberships`
--

INSERT INTO `memberships` (`membership_id`, `user_id`, `plan_type`, `start_date`, `end_date`, `status`, `payment_status`, `payment_amount`, `transaction_id`, `created_at`, `updated_at`) VALUES
(1, 1, 'free', '2025-11-20 04:07:04', NULL, 'active', 'paid', 0.00, NULL, '2025-11-20 04:07:04', '2025-11-20 04:07:04');

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
CREATE TABLE IF NOT EXISTS `orders` (
  `order_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `order_number` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `subtotal` decimal(10,2) DEFAULT '0.00',
  `tax` decimal(10,2) DEFAULT '0.00',
  `shipping_cost` decimal(10,2) DEFAULT '0.00',
  `status` enum('pending','processing','shipped','delivered','cancelled') COLLATE utf8mb4_general_ci DEFAULT 'pending',
  `shipping_address` text COLLATE utf8mb4_general_ci NOT NULL,
  `payment_method` enum('cod','upi_direct','upi','razorpay','card','netbanking') COLLATE utf8mb4_general_ci DEFAULT 'cod',
  `payment_status` enum('pending','paid','failed','refunded','payment_pending') COLLATE utf8mb4_general_ci DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `transaction_id` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  PRIMARY KEY (`order_id`),
  UNIQUE KEY `order_number` (`order_number`),
  KEY `user_id` (`user_id`),
  KEY `idx_order_number` (`order_number`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`order_id`, `user_id`, `order_number`, `total_amount`, `subtotal`, `tax`, `shipping_cost`, `status`, `shipping_address`, `payment_method`, `payment_status`, `created_at`, `updated_at`, `transaction_id`) VALUES
(4, 1, 'FH1764565386772VL9U0', 2250.00, 2250.00, 0.00, 0.00, 'processing', 'near chaundeshwari temple ,At post goware\nTal Karad Dist Satara, Karad, Maharashtra - 415105, India', 'upi_direct', 'paid', '2025-12-01 05:03:06', '2025-12-01 05:05:53', '123456789101'),
(5, 1, 'FH1764579388555X4V19', 1500.00, 1500.00, 0.00, 0.00, 'processing', 'near chaundeshwari temple ,At post goware\nTal Karad Dist Satara, Karad, Maharashtra - 415105, India', 'upi_direct', 'paid', '2025-12-01 08:56:28', '2025-12-01 08:57:58', '789654123654'),
(6, 3, 'FH1764680534634DYJMX', 3773.64, 3198.00, 575.64, 0.00, 'delivered', 'Satara City, Satara, Maharashtra', 'upi', 'paid', '2025-11-30 05:40:08', '2025-11-30 05:40:08', 'TXN17646805346341181'),
(7, 5, 'FH17646805347809ID99', 2594.82, 2199.00, 395.82, 0.00, 'delivered', 'Karanje, Satara, Satara, Maharashtra', 'cod', 'pending', '2025-11-26 02:26:46', '2025-12-02 13:20:31', 'COD646816310574741'),
(8, 2, 'FH1764680534795FUZ4J', 2945.28, 2496.00, 449.28, 0.00, 'processing', 'Koregaon, Satara District, Koregaon, Maharashtra', 'upi', 'paid', '2025-12-01 01:25:53', '2025-12-01 01:25:53', 'TXN17646805347955653'),
(9, 8, 'FH1764680534813P7IEF', 6367.28, 5396.00, 971.28, 0.00, 'delivered', 'Satara City, Satara, Maharashtra', 'upi_direct', 'paid', '2025-11-29 21:18:27', '2025-11-29 21:18:27', 'TXN17646805348133339'),
(10, 7, 'FH1764680534830APTGA', 4596.10, 3895.00, 701.10, 0.00, 'delivered', 'Koparde, Satara District, Koparde, Maharashtra', 'cod', 'pending', '2025-11-27 21:21:08', '2025-12-02 13:20:31', 'COD646816310676275'),
(11, 4, 'FH1764680534846TWXK9', 3537.64, 2998.00, 539.64, 0.00, 'shipped', 'Karanje, Medha, Satara, Medha, Maharashtra', 'upi_direct', 'paid', '2025-11-30 13:20:02', '2025-11-30 13:20:02', 'TXN17646805348469826'),
(12, 8, 'FH1764680534855S097M', 520.82, 399.00, 71.82, 50.00, 'pending', 'Satara City, Satara, Maharashtra', 'cod', 'pending', '2025-11-28 03:35:04', '2025-12-02 13:20:31', NULL),
(13, 9, 'FH17646805348649U7NE', 15336.46, 12997.00, 2339.46, 0.00, 'pending', 'Medha, Satara District, Medha, Maharashtra', 'upi_direct', 'payment_pending', '2025-11-30 18:30:08', '2025-11-30 18:30:08', NULL),
(14, 7, 'FH1764680534878P0W48', 4422.64, 3748.00, 674.64, 0.00, 'shipped', 'Koparde, Satara District, Koparde, Maharashtra', 'cod', 'pending', '2025-12-01 12:35:48', '2025-12-02 13:20:31', 'COD646816310726445'),
(15, 4, 'FH1764680534890E2LYC', 1532.82, 1299.00, 233.82, 0.00, 'shipped', 'Karanje, Medha, Satara, Medha, Maharashtra', 'upi_direct', 'paid', '2025-11-28 12:01:39', '2025-11-28 12:01:39', 'TXN17646805348909221'),
(16, 6, 'FH176468053490103WXG', 4245.64, 3598.00, 647.64, 0.00, 'processing', 'Koparde, Satara District, Koparde, Maharashtra', 'cod', 'pending', '2025-12-01 10:54:42', '2025-12-02 13:20:31', 'COD646816310766234'),
(17, 7, 'FH1764680534917C87KX', 5483.46, 4647.00, 836.46, 0.00, 'processing', 'Koparde, Satara District, Koparde, Maharashtra', 'upi_direct', 'paid', '2025-11-28 03:48:14', '2025-11-28 03:48:14', 'TXN17646805349172738'),
(18, 7, 'FH17646805349350YZAE', 1768.82, 1499.00, 269.82, 0.00, 'shipped', 'Koparde, Satara District, Koparde, Maharashtra', 'cod', 'pending', '2025-12-02 00:17:31', '2025-12-02 13:20:31', 'COD646816310818999'),
(19, 2, 'FH1764680534944DW7IU', 14157.64, 11998.00, 2159.64, 0.00, 'delivered', 'Koregaon, Satara District, Koregaon, Maharashtra', 'cod', 'pending', '2025-11-26 11:04:25', '2025-12-02 13:20:31', 'COD646816310876940'),
(20, 3, 'FH1764680534953LA1X8', 2356.46, 1997.00, 359.46, 0.00, 'shipped', 'Satara City, Satara, Maharashtra', 'cod', 'pending', '2025-12-01 10:41:45', '2025-12-02 13:20:31', 'COD646816310939691'),
(21, 1, 'FH17646983064645S719', 8498.00, 8498.00, 0.00, 0.00, 'pending', 'near chaundeshwari temple ,At post goware\nTal Karad Dist Satara , Karad , Maharashtra  - 415105, India', 'upi', 'payment_pending', '2025-12-02 17:58:26', '2025-12-02 17:58:26', NULL),
(22, 1, 'FH1764698861451KUN8O', 8498.00, 8498.00, 0.00, 0.00, 'delivered', 'near chaundeshwari temple ,At post goware\nTal Karad Dist Satara , Karad , Maharashtra  - 415105 , India', 'upi_direct', 'payment_pending', '2025-12-02 18:07:41', '2025-12-09 05:52:00', '124578954522'),
(23, 1, 'FH1764952215622VFYYW', 3499.00, 3499.00, 0.00, 0.00, 'pending', 'near chaundeshwari temple ,At post goware\nTal Karad Dist Satara, Karad, Maharashtra - 415105, India', 'upi', 'payment_pending', '2025-12-05 16:30:15', '2025-12-05 16:30:15', NULL),
(24, 1, 'FH1765008894073EVPFS', 4998.00, 4998.00, 0.00, 0.00, 'processing', 'near chaundeshwari temple ,At post goware\nTal Karad Dist Satara, Karad, Maharashtra - 415105, India', 'upi_direct', 'paid', '2025-12-06 08:14:54', '2026-02-01 06:18:03', '121422222222');

-- --------------------------------------------------------

--
-- Table structure for table `order_items`
--

DROP TABLE IF EXISTS `order_items`;
CREATE TABLE IF NOT EXISTS `order_items` (
  `order_item_id` int NOT NULL AUTO_INCREMENT,
  `order_id` int NOT NULL,
  `product_id` int NOT NULL,
  `quantity` int NOT NULL,
  `size` varchar(10) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `total` decimal(10,2) NOT NULL,
  PRIMARY KEY (`order_item_id`),
  KEY `order_id` (`order_id`),
  KEY `product_id` (`product_id`)
) ENGINE=InnoDB AUTO_INCREMENT=42 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `order_items`
--

INSERT INTO `order_items` (`order_item_id`, `order_id`, `product_id`, `quantity`, `size`, `price`, `total`) VALUES
(4, 4, 5, 3, 'L', 750.00, 2250.00),
(5, 5, 5, 2, 'XL', 750.00, 1500.00),
(6, 6, 25, 2, 'M', 1599.00, 3198.00),
(7, 7, 2, 2, 'M', 750.00, 1500.00),
(8, 7, 23, 1, 'M', 699.00, 699.00),
(9, 8, 12, 2, 'M', 399.00, 798.00),
(10, 8, 6, 1, 'M', 1299.00, 1299.00),
(11, 8, 12, 1, 'M', 399.00, 399.00),
(12, 9, 6, 2, 'M', 1299.00, 2598.00),
(13, 9, 9, 1, 'M', 1499.00, 1499.00),
(14, 9, 6, 1, 'M', 1299.00, 1299.00),
(15, 10, 11, 1, 'M', 899.00, 899.00),
(16, 10, 26, 2, 'M', 699.00, 1398.00),
(17, 10, 29, 2, 'M', 799.00, 1598.00),
(18, 11, 9, 2, 'M', 1499.00, 2998.00),
(19, 12, 12, 1, 'M', 399.00, 399.00),
(20, 13, 28, 1, 'M', 999.00, 999.00),
(21, 13, 19, 2, 'M', 5999.00, 11998.00),
(22, 14, 5, 1, 'M', 750.00, 750.00),
(23, 14, 27, 2, 'M', 1499.00, 2998.00),
(24, 15, 22, 1, 'M', 1299.00, 1299.00),
(25, 16, 28, 1, 'M', 999.00, 999.00),
(26, 16, 4, 2, 'M', 500.00, 1000.00),
(27, 16, 25, 1, 'M', 1599.00, 1599.00),
(28, 17, 11, 1, 'M', 899.00, 899.00),
(29, 17, 27, 2, 'M', 1499.00, 2998.00),
(30, 17, 5, 1, 'M', 750.00, 750.00),
(31, 18, 9, 1, 'M', 1499.00, 1499.00),
(32, 19, 19, 2, 'M', 5999.00, 11998.00),
(33, 20, 23, 2, 'M', 699.00, 1398.00),
(34, 20, 8, 1, 'M', 599.00, 599.00),
(35, 21, 31, 1, 'M', 4999.00, 4999.00),
(36, 21, 24, 1, 'M', 3499.00, 3499.00),
(37, 22, 31, 1, 'M', 4999.00, 4999.00),
(38, 22, 24, 1, 'M', 3499.00, 3499.00),
(39, 23, 24, 1, 'M', 3499.00, 3499.00),
(40, 24, 27, 1, 'M', 1499.00, 1499.00),
(41, 24, 24, 1, 'M', 3499.00, 3499.00);

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
CREATE TABLE IF NOT EXISTS `products` (
  `product_id` int NOT NULL AUTO_INCREMENT,
  `product_name` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `category_id` int NOT NULL,
  `subcategory_id` int NOT NULL,
  `type` enum('upperwear','bottomwear','accessories','saree') COLLATE utf8mb4_general_ci NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `quantity` int NOT NULL DEFAULT '0',
  `sizes` set('S','M','L','XL','XXL','XXXL') COLLATE utf8mb4_general_ci DEFAULT NULL,
  `discount` decimal(5,2) DEFAULT NULL,
  `fabric` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `tags` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `colour` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `images` longtext COLLATE utf8mb4_general_ci,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`product_id`),
  KEY `category_id` (`category_id`),
  KEY `subcategory_id` (`subcategory_id`)
) ENGINE=InnoDB AUTO_INCREMENT=47 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`product_id`, `product_name`, `category_id`, `subcategory_id`, `type`, `price`, `quantity`, `sizes`, `discount`, `fabric`, `tags`, `colour`, `images`, `created_at`) VALUES
(1, 'Men White Solid Contemporary Fit Cotton T-Shirt', 1, 2, 'upperwear', 890.00, 11, 'M,L,XL,XXL', 15.00, 'Cotton', 't-shirt,white,polo', 'white', '[\"http://localhost:5000/uploads/products/Men White Solid Contemporary Fit Cotton T-Shirt-1763614055049-817832316.png\",\"http://localhost:5000/uploads/products/Men White Solid Contemporary Fit Cotton T-Shirt2-1763614055050-91560821.png\",\"http://localhost:5000/uploads/products/Men White Solid Contemporary Fit Cotton T-Shirt3-1763614055051-311032479.png\",\"http://localhost:5000/uploads/products/Men White Solid Contemporary Fit Cotton T-Shirt4-1763614055054-58812.png\"]', '2025-11-20 04:47:35'),
(2, 'Blue Knitted Low Rise Tapered Fit Cotton Blend Jeans', 1, 2, 'bottomwear', 750.00, 40, 'M,L,XL,XXL', 12.00, 'Cotton', 'denim,jeans,pants,pant', 'navy blue', '[\"http://localhost:5000/uploads/products/Blue Knitted Low Rise Tapered Fit Cotton Blend Jeans-1763624511380-943499533.jpg\",\"http://localhost:5000/uploads/products/Blue Knitted Low Rise Tapered Fit Cotton Blend Jeans2-1763624511384-744793965.jpg\",\"http://localhost:5000/uploads/products/Blue Knitted Low Rise Tapered Fit Cotton Blend Jeans3-1763624511388-779446069.jpg\",\"http://localhost:5000/uploads/products/Blue Knitted Low Rise Tapered Fit Cotton Blend Jeans4-1763624511394-375544321.jpg\"]', '2025-11-20 07:41:51'),
(3, 'Blue Printed Comfort Fit Cotton T-Shirt', 1, 2, 'upperwear', 450.00, 20, 'S,M,L,XL', 10.00, 'Cotton', 't-shirt,coler t-shirt,blue', 'SKY BLUE', '[\"http://localhost:5000/uploads/products/Blue Printed Comfort Fit Cotton T-Shirt-1763624657134-964377322.jpg\",\"http://localhost:5000/uploads/products/Blue Printed Comfort Fit Cotton T-Shirt2-1763624657135-424503801.jpg\",\"http://localhost:5000/uploads/products/Blue Printed Comfort Fit Cotton T-Shirt3-1763624657138-564879303.jpg\"]', '2025-11-20 07:44:17'),
(4, 'Men Pink Printed Slim Fit Cotton Blend T-Shirt', 1, 2, 'upperwear', 500.00, 45, 'L,XL,XXL,XXXL', 12.00, 'Cotton', 't-shirt,cotton,fit', 'pink', '[\"http://localhost:5000/uploads/products/Men Pink Printed Slim Fit Cotton Blend T-Shirt-1763624758223-26925681.jpg\",\"http://localhost:5000/uploads/products/Men Pink Printed Slim Fit Cotton Blend T-Shirt2-1763624758224-535539403.jpg\",\"http://localhost:5000/uploads/products/Men Pink Printed Slim Fit Cotton Blend T-Shirt3-1763624758226-858277002.jpg\"]', '2025-11-20 07:45:58'),
(5, 'Men White Striped Slim Fit Cotton Blend Formal Shirt', 1, 1, 'upperwear', 750.00, 32, 'L,XL,XXL', 13.00, 'Cotton', 'formal,shirt,cotton shirt', 'white', '[\"http://localhost:5000/uploads/products/Men White Striped Slim Fit Cotton Blend Formal Shirt-1763624947932-160715757.jpg\",\"http://localhost:5000/uploads/products/Men White Striped Slim Fit Cotton Blend Formal Shirt2-1763624947933-471204226.jpg\",\"http://localhost:5000/uploads/products/Men White Striped Slim Fit Cotton Blend Formal Shirt3-1763624947934-832894983.jpg\",\"http://localhost:5000/uploads/products/Men White Striped Slim Fit Cotton Blend Formal Shirt4-1763624947934-982893984.jpg\"]', '2025-11-20 07:49:07'),
(6, 'Classic Formal White Shirt', 1, 1, 'upperwear', 1299.00, 50, 'M,L,XL,XXL', 15.00, 'Cotton Blend', 'formal,office,business,white shirt,professional', 'White', '[\"http://localhost:5000/uploads/products/Classic Formal White Shirt 1-1764602289655-607344100.jpg\",\"http://localhost:5000/uploads/products/Classic Formal White Shirt 2-1764602289656-820843598.jpg\",\"http://localhost:5000/uploads/products/Classic Formal White Shirt3-1764602289657-553803535.jpg\"]', '2025-12-01 14:58:41'),
(7, 'Integrity Blue Relaxed Fit Jeans', 1, 2, 'bottomwear', 1899.00, 75, 'S,M,L,XL,XXL', 20.00, 'Denim', 'jeans,casual,denim,blue,slim fit,everyday wear', 'Dark Blue', '[\"http://localhost:5000/uploads/products/Integrity Blue Relaxed Fit Jeans3-1764603510956-867566718.jpg\",\"http://localhost:5000/uploads/products/Integrity Blue Relaxed Fit Jeans2-1764603510957-752383875.jpg\",\"http://localhost:5000/uploads/products/Integrity Blue Relaxed Fit Jeans-1764603510958-89215640.jpg\"]', '2025-12-01 14:58:42'),
(8, 'Cotton Casual T-Shirt - Navy Blue', 1, 2, 'upperwear', 599.00, 100, 'S,M,L,XL,XXL,XXXL', 10.00, 'Cotton', 't-shirt,casual,cotton,navy,comfortable,everyday', 'Navy Blue', '[\"http://localhost:5000/uploads/products/Cotton Casual T-Shirt - Navy Blue-1764603390421-638557873.jpg\",\"http://localhost:5000/uploads/products/Cotton Casual T-Shirt - Navy Blue2-1764603390421-746701717.jpg\",\"http://localhost:5000/uploads/products/Cotton Casual T-Shirt - Navy Blue3-1764603390422-489368484.jpg\"]', '2025-12-01 14:58:42'),
(9, 'Dabka Zardozi Embroidered Pure Banarasi Off Rose Short Kurta & Salwar With Dupatta', 2, 6, 'upperwear', 1499.00, 60, 'S,M,L,XL,XXL', 25.00, 'Cotton', 'Off Rose,kurti,ethnic,floral,casual,comfortable,indian wear', 'Off Rose', '[\"http://localhost:5000/uploads/products/Dabka Zardozi Embroidered Pure Banarasi Off Rose Short Kurta & Salwar With Dupatta-1764603287879-42175406.jpg\",\"http://localhost:5000/uploads/products/Dabka Zardozi Embroidered Pure Banarasi Off Rose Short Kurta & Salwar With Dupatta2-1764603287881-936164694.jpg\",\"http://localhost:5000/uploads/products/Dabka Zardozi Embroidered Pure Banarasi Off Rose Short Kurta & Salwar With Dupatta3-1764603287885-884516600.jpg\"]', '2025-12-01 14:58:42'),
(11, 'Women\'s Yoga Pants - Black', 2, 7, 'bottomwear', 899.00, 80, 'S,M,L,XL', 20.00, 'Polyester', 'yoga pants,sportswear,gym,fitness,activewear,comfortable', 'Black', '[\"http://localhost:5000/uploads/products/Women\'s Yoga Pants - Black-1764602946551-481668468.jpg\",\"http://localhost:5000/uploads/products/Women\'s Yoga Pants - Black2-1764602946551-744873170.jpg\",\"http://localhost:5000/uploads/products/Women\'s Yoga Pants - Black3-1764602946552-273746075.jpg\"]', '2025-12-01 14:58:42'),
(12, 'Looney Tunes by Wear Your Mind Girls Tweety Printed T-shirt', 3, 10, 'upperwear', 399.00, 120, 'S,M,L,XL', 15.00, 'Cotton', 'kids,t-shirt,cartoon,casual,comfortable,colorful', 'Yellow', '[\"http://localhost:5000/uploads/products/Looney Tunes by Wear Your Mind Girls Tweety Printed T-shirt-1764602768734-508431419.jpg\",\"http://localhost:5000/uploads/products/Looney Tunes by Wear Your Mind Girls Tweety Printed T-shirt2-1764602768734-255704082.jpg\",\"http://localhost:5000/uploads/products/Looney Tunes by Wear Your Mind Girls Tweety Printed T-shirt3-1764602768735-801282174.jpg\"]', '2025-12-01 14:58:42'),
(19, 'Traditional Banarasi Silk Saree', 2, 7, 'saree', 5999.00, 25, 'M,L,XL', 15.00, 'Silk', 'saree,silk,banarasi,traditional,wedding,ethnic,indian', 'Maroon', '[\"http://localhost:5000/uploads/products/Maroon-1764648028448-27641450.jpg\",\"http://localhost:5000/uploads/products/Maroon2-1764648028455-683967999.jpg\",\"http://localhost:5000/uploads/products/Maroon3-1764648028456-890738642.jpg\"]', '2025-12-01 14:59:39'),
(22, 'Kids Party Wear Dress - Pink', 3, 10, 'upperwear', 1299.00, 40, 'S,M,L,XL', 25.00, 'Polyester', 'kids,party dress,formal,pink,princess,special occasion', 'Pink', '[\"http://localhost:5000/uploads/products/Kids Party Wear Dress - Pink-1764603837893-850110204.jpg\",\"http://localhost:5000/uploads/products/Kids Party Wear Dress - Pink2-1764603837893-550941346.jpg\",\"http://localhost:5000/uploads/products/Kids Party Wear Dress - Pink3-1764603837894-620156859.jpg\"]', '2025-12-01 14:59:39'),
(23, 'Leather Formal Belt - Brown', 1, 1, 'accessories', 699.00, 90, 'M,L,XL', 10.00, 'Leather', 'belt,leather,formal,brown,accessories,professional', 'Brown', '[\"http://localhost:5000/uploads/products/Leather Formal Belt - Brown-1764603702001-665075837.jpg\",\"http://localhost:5000/uploads/products/Leather Formal Belt - Brown2-1764603702002-205850188.jpg\",\"http://localhost:5000/uploads/products/Leather Formal Belt - Brown3-1764603702003-684896254.jpg\"]', '2025-12-01 14:59:39'),
(24, 'Premium Black Blazer', 1, 1, 'upperwear', 3499.00, 31, 'M,L,XL,XXL', 20.00, 'Wool', 'blazer,formal,black,office,business,premium', 'Black', '[\"http://localhost:5000/uploads/products/Premium Black Blazer3-1764650243427-726889339.jpg\",\"http://localhost:5000/uploads/products/Premium Black Blazer2-1764650243427-121002301.jpg\",\"http://localhost:5000/uploads/products/Premium Black Blazer-1764650243429-792275242.jpg\"]', '2025-12-01 15:11:53'),
(25, 'Formal Grey Trousers', 1, 1, 'bottomwear', 1599.00, 60, 'M,L,XL,XXL', 15.00, 'Polyester', 'trousers,formal,grey,office,business', 'Grey', '[\"http://localhost:5000/uploads/products/Formal Grey Trousers3-1764650171099-922232928.jpg\",\"http://localhost:5000/uploads/products/Formal Grey Trousers2-1764650171101-468959549.jpg\",\"http://localhost:5000/uploads/products/Formal Grey Trousers-1764650171101-480122439.jpg\"]', '2025-12-01 15:11:53'),
(26, 'Squid Game Graphic Print T-Shirt', 1, 2, 'upperwear', 699.00, 90, 'S,M,L,XL,XXL', 15.00, 'Cotton', 'Squid Games,t-shirt,casual,graphic,trendy,comfortable', 'Black', '[\"http://localhost:5000/uploads/products/Squid Game3-1764650081076-353392145.jpg\",\"http://localhost:5000/uploads/products/Squid Game2-1764650081078-182244019.jpg\",\"http://localhost:5000/uploads/products/Squid Game-1764650081079-275785589.jpg\"]', '2025-12-01 15:11:53'),
(27, 'Cargo Pants - Khaki', 1, 2, 'bottomwear', 1499.00, 54, 'M,L,XL,XXL', 18.00, 'Cotton', 'cargo,pants,casual,khaki,utility', 'Khaki', '[\"http://localhost:5000/uploads/products/Cargo Pants - Khaki-1764648873571-842819904.jpg\",\"http://localhost:5000/uploads/products/Cargo Pants - Khaki2-1764648873571-515578272.jpg\",\"http://localhost:5000/uploads/products/Cargo Pants - Khaki3-1764648873572-150326067.jpg\"]', '2025-12-01 15:11:53'),
(28, 'Loose fit Super Soft Track Pants for Man | Track Pant for Men', 1, 4, 'bottomwear', 999.00, 70, 'S,M,L,XL,XXL', 20.00, 'Polyester', 'track pants,sportswear,gym,athletic,comfortable', 'Black', '[\"http://localhost:5000/uploads/products/Athletic Track Pants-1764649895300-632407870.jpg\",\"http://localhost:5000/uploads/products/Athletic Track Pants2-1764649895306-625192858.jpg\",\"http://localhost:5000/uploads/products/Athletic Track Pants3-1764649895310-836887460.jpg\"]', '2025-12-01 15:11:53'),
(29, 'Indian Cricket Team Champions Trophy Half Sleeves Jersey 2025, Tricolour, Sports Jersey', 1, 4, 'upperwear', 799.00, 65, 'S,M,L,XL,XXL', 15.00, 'Polyester', 'indian cricket team,jersey,sports,athletic,blue', 'Blue', '[\"http://localhost:5000/uploads/products/Indian Cricket Team Champions Trophy Half Sleeves Jersey 2025, Tricolour, Sports Jersey-1764648606650-672228618.jpg\",\"http://localhost:5000/uploads/products/Indian Cricket Team Champions Trophy Half Sleeves Jersey 2025, Tricolour, Sports Jersey2-1764648606651-100301685.jpg\"]', '2025-12-01 15:11:53'),
(30, 'Cotton Kurta - White', 1, 3, 'upperwear', 1299.00, 45, 'M,L,XL,XXL', 15.00, 'Cotton', 'kurta,traditional,ethnic,white,indian wear', 'White', '[\"http://localhost:5000/uploads/products/Cotton Kurta - White-1764648363836-570385472.jpg\",\"http://localhost:5000/uploads/products/Cotton Kurta - White2-1764648363842-756976415.jpg\",\"http://localhost:5000/uploads/products/Cotton Kurta - White3-1764648363852-191179560.jpg\"]', '2025-12-01 15:11:53'),
(31, 'Silk Sherwani - Maroon ', 1, 3, 'upperwear', 4999.00, 18, 'M,L,XL,XXL', 10.00, 'Silk', 'sherwani,traditional,wedding,ethnic,maroon', 'Maroon', '[\"http://localhost:5000/uploads/products/Silk Sherwani - Maroon-1764648284288-546092966.jpg\",\"http://localhost:5000/uploads/products/Silk Sherwani - Maroon2-1764648284294-232289845.jpg\"]', '2025-12-01 15:11:53'),
(32, 'Formal Blazer - Navy Blue', 2, 5, 'upperwear', 2999.00, 40, 'S,M,L,XL', 20.00, 'Polyester', 'blazer,formal,navy,office,professional', 'Navy Blue', '[\"http://localhost:5000/uploads/products/Formal Blazer - Navy Blue -1764648176156-410536424.jpg\",\"http://localhost:5000/uploads/products/Formal Blazer - Navy Blue2-1764648176157-614895351.jpg\",\"http://localhost:5000/uploads/products/Formal Blazer - Navy Blue3-1764648176158-766373776.jpg\"]', '2025-12-01 15:11:53'),
(33, 'Women\'s Knee Length Formal Pencil Skirt with Elastic Waist Band', 2, 5, 'bottomwear', 1299.00, 50, 'S,M,L,XL', 15.00, 'Polyester', 'skirt,formal,black,office,professional', 'Black', '[\"http://localhost:5000/uploads/products/Formal Pencil Skirt - Black-1764651493560-747483326.jpg\",\"http://localhost:5000/uploads/products/Formal Pencil Skirt - Black2-1764651493560-539877815.jpg\",\"http://localhost:5000/uploads/products/Formal Pencil Skirt - Black3-1764651493561-462243111.jpg\"]', '2025-12-01 15:11:53'),
(34, 'Women\'s Oversized Denim Jacket, Light Blue, Button Front, Long Sleeve', 2, 6, 'upperwear', 1899.00, 45, 'S,M,L,XL', 20.00, 'Denim', 'jacket,denim,casual,blue,trendy', 'Blue', '[\"http://localhost:5000/uploads/products/Denim Jacket - Blue-1764651389516-39197517.jpg\",\"http://localhost:5000/uploads/products/Denim Jacket - Blue2-1764651389517-299973077.jpg\",\"http://localhost:5000/uploads/products/Denim Jacket - Blue3-1764651389517-412023209.jpg\"]', '2025-12-01 15:11:53'),
(35, 'Casual Palazzo Pants', 2, 6, 'bottomwear', 999.00, 70, 'S,M,L,XL', 18.00, 'Cotton', 'palazzo,casual,comfortable,trendy', 'Beige', '[\"http://localhost:5000/uploads/products/Casual Palazzo Pants-1764651301123-478205543.jpg\",\"http://localhost:5000/uploads/products/Casual Palazzo Pants2-1764651301124-349796227.jpg\",\"http://localhost:5000/uploads/products/Casual Palazzo Pants3-1764651301124-784887543.jpg\"]', '2025-12-01 15:11:53'),
(37, 'Beautiful Embroidery and Sequence Work Set For Women (Pink)', 2, 7, 'upperwear', 599.00, 75, 'S,M,L,XL', 20.00, 'Polyester', 'Sequence,Embroidery,traditional,pink', 'Pink', '[\"http://localhost:5000/uploads/products/Beautiful Embroidery and Sequence Work Set For Women (Pink)-1764651201539-71491291.jpg\",\"http://localhost:5000/uploads/products/Beautiful Embroidery and Sequence Work Set For Women (Pink)2-1764651201540-925684977.jpg\",\"http://localhost:5000/uploads/products/Beautiful Embroidery and Sequence Work Set For Women (Pink)3-1764651201541-305935584.jpg\"]', '2025-12-01 15:11:53'),
(38, 'Embroidered Salwar Suit', 2, 7, 'upperwear', 2499.00, 35, 'S,M,L,XL', 20.00, 'Cotton', 'salwar suit,traditional,ethnic,embroidered', 'Begani', '[\"http://localhost:5000/uploads/products/Embroidered Salwar Suit-1764650974944-581917041.jpg\",\"http://localhost:5000/uploads/products/Embroidered Salwar Suit2-1764650974944-885668154.jpg\",\"http://localhost:5000/uploads/products/Embroidered Salwar Suit3-1764650974952-598445289.jpg\"]', '2025-12-01 15:11:53'),
(39, 'Designer Lehenga Choli', 2, 7, 'upperwear', 6999.00, 15, 'S,M,L,XL', 15.00, 'Silk', 'lehenga,traditional,wedding,designer,ethnic', 'Red', '[\"http://localhost:5000/uploads/products/Designer Lehenga Choli-1764650884863-976325996.jpg\",\"http://localhost:5000/uploads/products/Designer Lehenga Choli2-1764650884864-895402247.jpg\",\"http://localhost:5000/uploads/products/Designer Lehenga Choli3-1764650884865-501078321.jpg\"]', '2025-12-01 15:11:53'),
(40, 'Kanjivaram Silk Saree', 2, 7, 'saree', 7999.00, 20, 'M,L,XL', 10.00, 'Silk', 'Firozi,saree,silk,kanjivaram,traditional,wedding', 'Firozi', '[\"http://localhost:5000/uploads/products/Kanjivaram Silk Saree3-1764650734603-183797351.jpg\",\"http://localhost:5000/uploads/products/Kanjivaram Silk Saree2-1764650734604-596406864.jpg\",\"http://localhost:5000/uploads/products/Kanjivaram Silk Saree-1764650734606-430548054.jpg\"]', '2025-12-01 15:11:53'),
(42, 'Women\'s Desk-to-Dinner\' Fit & Flare Wrap Dress (Midi Length | Stylish)', 2, 5, 'upperwear', 4999.00, 20, 'S,M,L,XL', 20.00, 'Velvet', 'gown,party,velvet,evening wear,elegant', 'Burgundy', '[\"http://localhost:5000/uploads/products/Women\'s Desk-to-Dinner-1764650483637-984982748.jpg\",\"http://localhost:5000/uploads/products/Women\'s Desk-to-Dinner2-1764650483638-82970397.jpg\",\"http://localhost:5000/uploads/products/Women\'s Desk-to-Dinner3-1764650483639-828792958.jpg\"]', '2025-12-01 15:11:53'),
(43, 'Kids Denim Shorts', 3, 10, 'bottomwear', 599.00, 85, 'S,M,L,XL', 15.00, 'Denim', 'kids,shorts,denim,casual,comfortable', 'Blue', '[\"http://localhost:5000/uploads/products/Kids Denim Shorts-1764651806495-457523759.jpg\",\"http://localhost:5000/uploads/products/Kids Denim Shorts2-1764651806495-125774063.jpg\"]', '2025-12-01 15:11:53'),
(44, 'Girls White Polo Tshirt', 3, 10, 'upperwear', 499.00, 100, 'S,M,L,XL', 10.00, 'Cotton', 'kids,polo,t-shirt,casual,comfortable', 'Red', '[\"http://localhost:5000/uploads/products/Kids Polo T-Shirt-1764651748754-30553868.jpg\",\"http://localhost:5000/uploads/products/Kids Polo T-Shirt2-1764651748754-21452947.jpg\"]', '2025-12-01 15:11:53'),
(45, 'Boys Black Abstract Printed Winter Zipper Hoodie With Jogger Set', 3, 11, 'upperwear', 899.00, 60, 'S,M,L,XL', 20.00, 'Polyester', 'kids,track suit,sports,athletic,comfortable', 'Navy Blue', '[\"http://localhost:5000/uploads/products/Kids Track Suit-1764651659292-208973740.jpg\",\"http://localhost:5000/uploads/products/Kids Track Suit2-1764651659292-370140924.jpg\"]', '2025-12-01 15:11:53'),
(46, 'EARTHY TOUCH Single Jersey Knit Full Sleeves Kurta Dhoti Set with Floral Glitter Print - Light Blue', 3, 11, 'upperwear', 399.00, 90, 'S,M,L,XL', 15.00, 'Polyester', 'kids,shorts,sports,athletic,comfortable', 'Blue', '[\"http://localhost:5000/uploads/products/EARTHY TOUCH Single Jersey Knit Full Sleeves Kurta Dhoti Set with Floral Glitter Print - Light Blue-1764648784790-61603871.jpg\",\"http://localhost:5000/uploads/products/EARTHY TOUCH Single Jersey Knit Full Sleeves Kurta Dhoti Set with Floral Glitter Print - Light Blue2-1764648784790-309137267.jpg\",\"http://localhost:5000/uploads/products/EARTHY TOUCH Single Jersey Knit Full Sleeves Kurta Dhoti Set with Floral Glitter Print - Light Blue3-1764648784791-316776403.jpg\"]', '2025-12-01 15:11:53');

-- --------------------------------------------------------

--
-- Table structure for table `product_reviews`
--

DROP TABLE IF EXISTS `product_reviews`;
CREATE TABLE IF NOT EXISTS `product_reviews` (
  `review_id` int NOT NULL AUTO_INCREMENT,
  `product_id` int NOT NULL,
  `user_id` int NOT NULL,
  `rating` int NOT NULL,
  `review_text` text COLLATE utf8mb4_general_ci,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`review_id`),
  UNIQUE KEY `unique_user_product_review` (`user_id`,`product_id`),
  KEY `product_id` (`product_id`),
  KEY `user_id` (`user_id`)
) ;

--
-- Dumping data for table `product_reviews`
--

INSERT INTO `product_reviews` (`review_id`, `product_id`, `user_id`, `rating`, `review_text`, `created_at`, `updated_at`) VALUES
(9, 6, 3, 5, 'Excellent! The fabric feels premium and the fit is perfect.', '2025-11-29 22:49:11', '2025-11-29 22:49:11'),
(10, 33, 10, 5, 'Superb quality and perfect stitching. Very happy with this purchase.', '2025-11-28 18:43:27', '2025-11-28 18:43:27'),
(11, 19, 6, 5, 'Perfect fit and great material. Will definitely buy again!', '2025-11-29 14:56:37', '2025-11-29 14:56:37'),
(12, 39, 11, 5, 'Absolutely love it! The color and design are beautiful. Great value for money.', '2025-12-01 17:54:08', '2025-12-01 17:54:08'),
(13, 2, 11, 3, 'It\'s fine. Nothing extraordinary. Expected better quality.', '2025-11-26 08:15:11', '2025-11-26 08:15:11'),
(14, 12, 9, 5, 'Amazing! Better than I expected. Will order more colors.', '2025-11-29 11:03:49', '2025-11-29 11:03:49'),
(15, 32, 2, 5, 'Amazing product! The fabric quality is superb. Very satisfied with my purchase.', '2025-12-01 02:28:08', '2025-12-01 02:28:08'),
(16, 28, 2, 5, 'Excellent quality! Exactly as described. Highly recommend!', '2025-11-30 11:27:31', '2025-11-30 11:27:31'),
(17, 45, 10, 4, 'Nice product! Good fabric quality. Delivery was on time.', '2025-12-02 11:32:34', '2025-12-02 11:32:34'),
(18, 42, 9, 3, 'Okay product. Not as good as expected but usable.', '2025-11-29 04:50:43', '2025-11-29 04:50:43'),
(19, 25, 4, 5, 'Superb quality and perfect stitching. Very happy with this purchase.', '2025-12-02 03:29:57', '2025-12-02 03:29:57'),
(20, 27, 9, 5, 'Amazing! Better than I expected. Will order more colors.', '2025-11-27 01:42:06', '2025-11-27 01:42:06'),
(21, 24, 2, 5, 'Amazing product! The fabric quality is superb. Very satisfied with my purchase.', '2025-11-29 08:21:43', '2025-11-29 08:21:43'),
(22, 37, 7, 5, 'Best purchase ever! The quality is top-notch. Highly recommended!', '2025-12-01 11:06:17', '2025-12-01 11:06:17'),
(23, 34, 4, 4, 'Satisfied with the purchase. Good fabric but could be better.', '2025-11-26 08:21:10', '2025-11-26 08:21:10'),
(24, 34, 8, 1, 'Awful! The worst online shopping experience. Never buying again.', '2025-11-27 07:35:29', '2025-11-27 07:35:29'),
(25, 33, 12, 4, 'Nice product overall. Minor stitching issues but nothing major.', '2025-11-29 17:33:44', '2025-11-29 17:33:44'),
(26, 40, 2, 2, 'Not good. The stitching came loose after one wash.', '2025-11-26 18:38:51', '2025-11-26 18:38:51'),
(27, 5, 11, 2, 'Not satisfied. Size is wrong and quality is poor.', '2025-11-26 08:03:14', '2025-11-26 08:03:14'),
(28, 2, 8, 4, 'Good quality product. Slightly different from the image but overall satisfied.', '2025-11-30 07:40:51', '2025-11-30 07:40:51'),
(29, 31, 5, 3, 'It\'s alright. Fits okay but quality could be better.', '2025-11-29 21:20:03', '2025-11-29 21:20:03'),
(30, 44, 11, 5, 'Amazing product! The fabric quality is superb. Very satisfied with my purchase.', '2025-11-27 22:40:34', '2025-11-27 22:40:34'),
(31, 25, 8, 5, 'Amazing! Better than I expected. Will order more colors.', '2025-11-25 23:06:10', '2025-11-25 23:06:10'),
(32, 45, 2, 4, 'Pretty good! The fit is nice but color is slightly different from picture.', '2025-11-26 10:52:52', '2025-11-26 10:52:52'),
(33, 40, 4, 3, 'Average product. Stitching could be better.', '2025-12-02 12:35:54', '2025-12-02 12:35:54'),
(34, 30, 9, 4, 'Decent product. Quality is good but size runs slightly small.', '2025-11-27 14:37:19', '2025-11-27 14:37:19');

-- --------------------------------------------------------

--
-- Table structure for table `subcategories`
--

DROP TABLE IF EXISTS `subcategories`;
CREATE TABLE IF NOT EXISTS `subcategories` (
  `subcategory_id` int NOT NULL AUTO_INCREMENT,
  `category_id` int NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`subcategory_id`),
  KEY `category_id` (`category_id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `subcategories`
--

INSERT INTO `subcategories` (`subcategory_id`, `category_id`, `name`) VALUES
(1, 1, 'Formal'),
(2, 1, 'Casual'),
(3, 1, 'Traditional'),
(4, 1, 'Sports Wear'),
(5, 2, 'Formal'),
(6, 2, 'Casual'),
(7, 2, 'Traditional'),
(8, 2, 'Sports Wear'),
(9, 3, 'Boys Clothing'),
(10, 3, 'Girls Clothing'),
(11, 3, 'Kids Ethnic Wear');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
CREATE TABLE IF NOT EXISTS `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `email` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `phone` varchar(20) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `city` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `state` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `address` text COLLATE utf8mb4_general_ci,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `role` enum('user','admin') COLLATE utf8mb4_general_ci DEFAULT 'user',
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_email` (`email`),
  KEY `idx_username` (`username`),
  KEY `idx_city` (`city`),
  KEY `idx_state` (`state`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `email`, `password`, `phone`, `city`, `state`, `address`, `created_at`, `updated_at`, `role`) VALUES
(1, 'Satyam More', 'satyammore2020@gmail.com', '$2b$12$0YdR.ZkxbD3oU5DbXDgetOClVA9SZ7slgq6cwKDf17N6WAZJWZrsK', '9021679551', 'Karad', 'Maharashtra', 'At post Goware , Tal- Karad , Dist-Satara', '2025-08-28 13:59:44', '2026-02-01 06:04:22', 'admin'),
(2, 'tukaram jagadale', 'tukaram.jagadale@gmail.com', '$2b$10$vdL/r4pB2LLclXfzRnJch.GVtgTHYcPM9YFYUe0d8oUGA.W/JMvoC', '9876543216', 'Koregaon', 'Maharashtra', 'Koregaon, Satara District', '2025-11-28 03:21:07', '2025-12-02 12:54:46', 'user'),
(3, 'siddhirath mane', 'siddhirath.mane@gmail.com', '$2b$10$aXwJNhUp4CdgE/jl.xia5.lGWSHPJapPMigGezwpSPEMQxAFu8eHu', '9876543212', 'Satara', 'Maharashtra', 'Satara City', '2025-11-26 02:20:00', '2025-12-02 12:54:53', 'user'),
(4, 'anish dhanawade', 'dhanawadeanesh@gmail.com', '$2b$10$NwDoRh0BrZ5M9B6eNVTZd.3kgBazz00mqKMD9O3.nuiM8a0YL61vu', '8975899825', 'Medha', 'Maharashtra', 'Karanje, Medha, Satara', '2025-11-26 17:56:18', '2025-12-02 12:55:00', 'user'),
(5, 'rutik mahamulkar', 'rutikmahamulkar74@gmail.com', '$2b$10$rOFizZM/Y3j2yQbD5pV4rOLC580wiVxTPtpdEjKFWLTl0RPD1cgzm', '8459827009', 'Satara', 'Maharashtra', 'Karanje, Satara', '2025-11-28 10:26:23', '2025-12-02 12:55:06', 'user'),
(6, 'Shivam Sawant', 'shivam.sawant@gmail.com', '$2b$10$to//oVk398.nDRGO3uJRNegN8GWLWFQ8XCJtbxj1zscB3sTn5CNA.', '9876543210', 'Koparde', 'Maharashtra', 'Koparde, Satara District', '2025-11-30 05:38:23', '2025-12-02 12:55:34', 'user'),
(7, 'Matyur Sankpal', 'mayur445@gmail.com', '$2b$10$TKreak/qXVVjpOTrS9VvbO561n5UtXbm4wB5Hqt2TfQZc1YYnRNaK', '9876543211', 'Koparde', 'Maharashtra', 'Koparde, Satara District', '2025-11-29 01:25:39', '2025-12-02 12:56:03', 'user'),
(8, 'shravan mane', 'shravan.mane@gmail.com', '$2b$10$EBpQ35jNgHA25I/Cg4IEc.ZPFmdCB2j2NnbV9CupjwDBqjlWOg7Sm', '9876543213', 'Satara', 'Maharashtra', 'Satara City', '2025-11-28 07:10:13', '2025-12-02 12:56:19', 'user'),
(9, 'aditya dhanawade', 'aditya.dhanawade@gmail.com', '$2b$10$2MRkdvK94sDbKJRd20kUD.V32f1ZwXMfhZDAbXoBvqIKj4MVsMp8y', '9876543215', 'Medha', 'Maharashtra', 'Medha, Satara District', '2025-11-28 13:00:50', '2025-12-02 12:56:26', 'user'),
(10, 'vijay jagtap', 'vijay.jagtap@gmail.com', '$2b$10$OXovJ9CRysrMFiofvZ0t6Ok2nGnakEmNBMACm0J9jxaNOlDr3ZzCe', '9876543217', 'Karad', 'Maharashtra', 'Karad, Satara District', '2025-11-27 02:01:18', '2025-12-02 12:56:32', 'user'),
(11, 'prathamesh bansode', 'prathamesh.bansode@gmail.com', '$2b$10$tvYNeWLFo9Z5F7iez7wYfezwfaIWH9nXxIOdQrgKX5ZRkvVmWljpa', '9876543218', 'Saidaspur', 'Maharashtra', 'Saidaspur, Satara District', '2025-11-28 07:04:15', '2025-12-02 12:56:40', 'user'),
(12, 'vaibhav patil', 'vaibhav.patil@gmail.com', '$2b$10$.wpTv6K2F4NbCcbYMYYxvOM53MMetjHb4ymdpmqx4x3C.JWPJHndq', '9876543219', 'Patan', 'Maharashtra', 'Patan, Satara District', '2025-11-24 21:12:58', '2025-12-02 12:56:47', 'user');

-- --------------------------------------------------------

--
-- Table structure for table `user_profiles`
--

DROP TABLE IF EXISTS `user_profiles`;
CREATE TABLE IF NOT EXISTS `user_profiles` (
  `profile_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `first_name` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `last_name` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `phone` varchar(20) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `address` text COLLATE utf8mb4_general_ci,
  `city` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `state` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `postal_code` varchar(20) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `country` varchar(50) COLLATE utf8mb4_general_ci DEFAULT 'India',
  `date_of_birth` date DEFAULT NULL,
  `gender` enum('male','female','other') COLLATE utf8mb4_general_ci DEFAULT NULL,
  `avatar` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`profile_id`),
  UNIQUE KEY `user_id` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `wishlist`
--

DROP TABLE IF EXISTS `wishlist`;
CREATE TABLE IF NOT EXISTS `wishlist` (
  `wishlist_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `product_id` int NOT NULL,
  `added_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`wishlist_id`),
  UNIQUE KEY `unique_user_product` (`user_id`,`product_id`),
  KEY `user_id` (`user_id`),
  KEY `product_id` (`product_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `wishlist`
--

INSERT INTO `wishlist` (`wishlist_id`, `user_id`, `product_id`, `added_at`) VALUES
(1, 1, 5, '2025-11-30 12:33:54');

--
-- Constraints for dumped tables
--

--
-- Constraints for table `appointments`
--
ALTER TABLE `appointments`
  ADD CONSTRAINT `appointments_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `cart`
--
ALTER TABLE `cart`
  ADD CONSTRAINT `cart_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `cart_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`) ON DELETE CASCADE;

--
-- Constraints for table `custom_appointments`
--
ALTER TABLE `custom_appointments`
  ADD CONSTRAINT `custom_appointments_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `custom_orders`
--
ALTER TABLE `custom_orders`
  ADD CONSTRAINT `custom_orders_ibfk_1` FOREIGN KEY (`appointment_id`) REFERENCES `custom_appointments` (`appointment_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `custom_orders_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `memberships`
--
ALTER TABLE `memberships`
  ADD CONSTRAINT `memberships_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`) ON DELETE CASCADE;

--
-- Constraints for table `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `products_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`category_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `products_ibfk_2` FOREIGN KEY (`subcategory_id`) REFERENCES `subcategories` (`subcategory_id`) ON DELETE CASCADE;

--
-- Constraints for table `product_reviews`
--
ALTER TABLE `product_reviews`
  ADD CONSTRAINT `product_reviews_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `product_reviews_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `subcategories`
--
ALTER TABLE `subcategories`
  ADD CONSTRAINT `subcategories_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`category_id`) ON DELETE CASCADE;

--
-- Constraints for table `user_profiles`
--
ALTER TABLE `user_profiles`
  ADD CONSTRAINT `user_profiles_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `wishlist`
--
ALTER TABLE `wishlist`
  ADD CONSTRAINT `wishlist_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `wishlist_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

SET FOREIGN_KEY_CHECKS = 1;
