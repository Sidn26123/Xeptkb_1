-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Nov 16, 2025 at 07:19 PM
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
-- Database: `school_management`
--

-- --------------------------------------------------------

--
-- Table structure for table `academicyears`
--

CREATE TABLE `academicyears` (
  `id` int(11) NOT NULL,
  `year_code` varchar(50) NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `status` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `academicyears`
--

INSERT INTO `academicyears` (`id`, `year_code`, `start_date`, `end_date`, `status`) VALUES
(1, '2025-2026', '2025-09-01', '2026-06-30', 'upcoming'),
(2, '2024-2025', '2024-09-01', '2025-06-30', 'finished'),
(3, '2023-2024', '2023-09-01', '2024-06-30', 'finished');

-- --------------------------------------------------------

--
-- Table structure for table `activitivelog`
--

CREATE TABLE `activitivelog` (
  `id` int(11) NOT NULL,
  `account_id` varchar(100) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `buildings`
--

CREATE TABLE `buildings` (
  `id` int(11) NOT NULL,
  `campus_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `floor_count` int(11) DEFAULT NULL,
  `code` varchar(50) NOT NULL,
  `location` varchar(255) DEFAULT NULL,
  `status` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `buildings`
--

INSERT INTO `buildings` (`id`, `campus_id`, `name`, `floor_count`, `code`, `location`, `status`) VALUES
(1, 1, 'Tòa A1', 4, 'TSCH-A', '11 Nguyễn Đình Chiểu, phường Sài Gòn, TP. Hồ Chí Minh', 'active'),
(2, 1, 'Tòa B1', 4, 'TSCH-B', '11 Nguyễn Đình Chiểu, phường Sài Gòn, TP. Hồ Chí Minh', 'active'),
(3, 1, 'Tòa C1', 3, 'TSCH-C', '11 Nguyễn Đình Chiểu, phường Sài Gòn, TP. Hồ Chí Minh', 'active'),
(4, 1, 'Tòa D1', 2, 'TSCH-D', '11 Nguyễn Đình Chiểu, phường Sài Gòn, TP. Hồ Chí Minh', 'active'),
(5, 1, 'Sân E1', 2, 'TSCH-E', '11 Nguyễn Đình Chiểu, phường Sài Gòn, TP. Hồ Chí Minh', 'active'),
(6, 2, 'Tòa A2', 4, 'CSDT-A', '97 Man Thiện, phường Tăng Nhơn Phú, TP. Hồ Chí Minh', 'active'),
(7, 2, 'Tòa B2', 4, 'CSDT-B', '97 Man Thiện, phường Tăng Nhơn Phú, TP. Hồ Chí Minh', 'active'),
(8, 2, 'Tòa C2', 3, 'CSDT-C', '97 Man Thiện, phường Tăng Nhơn Phú, TP. Hồ Chí Minh', 'active'),
(9, 2, 'Tòa D2', 2, 'CSDT-D', '97 Man Thiện, phường Tăng Nhơn Phú, TP. Hồ Chí Minh', 'active'),
(10, 2, 'Sân E2', 2, 'CSDT-E', '11 Nguyễn Đình Chiểu, phường Sài Gòn, TP. Hồ Chí Minh', 'active');

-- --------------------------------------------------------

--
-- Table structure for table `campus`
--

CREATE TABLE `campus` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `code` varchar(50) NOT NULL,
  `status` varchar(50) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `campus`
--

INSERT INTO `campus` (`id`, `name`, `code`, `status`, `address`, `location`, `created_at`, `updated_at`) VALUES
(1, 'Trụ sở chính', 'TSCH', 'active', '11 Nguyễn Đình Chiểu, phường Sài Gòn, TP. Hồ Chí Minh', 'TP. Hồ Chí Minh', '2025-11-16 04:56:58', '2025-11-16 04:56:58'),
(2, 'Cơ sở đào tạo', 'CSDT', 'active', '97 Man Thiện, phường Tăng Nhơn Phú, TP. Hồ Chí Minh', 'TP. Hồ Chí Minh', '2025-11-16 04:56:58', '2025-11-16 04:56:58');

-- --------------------------------------------------------

--
-- Table structure for table `classes`
--

CREATE TABLE `classes` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `training_type_id` int(11) NOT NULL,
  `faculty_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `classes`
--

INSERT INTO `classes` (`id`, `name`, `training_type_id`, `faculty_id`) VALUES
(1, 'D21CQCN01-N', 1, 1),
(2, 'D21CQHT01-N', 1, 2);

-- --------------------------------------------------------

--
-- Table structure for table `constraints`
--

CREATE TABLE `constraints` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `code` varchar(50) NOT NULL,
  `weight` int(11) NOT NULL DEFAULT 0,
  `type` enum('H','S') NOT NULL DEFAULT 'S'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `courseclasses`
--

CREATE TABLE `courseclasses` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `subject_id` int(11) NOT NULL,
  `class_id` int(11) NOT NULL,
  `semester_id` int(11) NOT NULL,
  `teacher_id` int(11) NOT NULL,
  `slot` int(11) DEFAULT NULL,
  `session_per_week` int(11) DEFAULT NULL,
  `duration_per_session` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `courseclasses`
--

INSERT INTO `courseclasses` (`id`, `name`, `subject_id`, `class_id`, `semester_id`, `teacher_id`, `slot`, `session_per_week`, `duration_per_session`) VALUES
(1, 'IT', 2, 1, 5, 3, 1, 2, 4),
(2, 'IT1', 1, 2, 5, 2, 1, 2, 4),
(3, 'AI', 3, 1, 5, 1, 2, 3, 4),
(4, 'Databases', 2, 2, 5, 2, 1, 2, 4),
(5, 'Networks', 1, 1, 6, 3, 2, 2, 4),
(6, 'Web Development', 3, 2, 6, 1, 3, 3, 4);

-- --------------------------------------------------------

--
-- Table structure for table `days`
--

CREATE TABLE `days` (
  `id` int(11) NOT NULL,
  `name` varchar(50) NOT NULL,
  `idx` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `days`
--

INSERT INTO `days` (`id`, `name`, `idx`) VALUES
(1, 'Thứ Hai', 1),
(2, 'Thứ Ba', 2),
(3, 'Thứ Tư', 3),
(4, 'Thứ Năm', 4),
(5, 'Thứ Sáu', 6),
(6, 'Thứ Bảy', 7),
(7, 'Chủ Nhật', 8);

-- --------------------------------------------------------

--
-- Table structure for table `equipments`
--

CREATE TABLE `equipments` (
  `id` int(11) NOT NULL,
  `code` varchar(50) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `total` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `equipments`
--

INSERT INTO `equipments` (`id`, `code`, `name`, `description`, `total`) VALUES
(1, 'EQ001', 'Máy chiếu', NULL, 0),
(2, 'EQ002', 'TV', NULL, 0),
(3, 'EQ003', 'Loa', NULL, 0),
(4, 'EQ004', 'Micro', NULL, 0),
(5, 'EQ005', 'Bảng thông minh', NULL, 0),
(6, 'EQ006', 'Máy tính', NULL, 0),
(7, 'EQ007', 'Bộ đồ điện', NULL, 0),
(8, 'EQ008', 'Đồng hồ vạn năng', NULL, 0),
(9, 'EQ009', 'Bộ thực hành điện', NULL, 0),
(10, 'EQ010', 'Nguồn DC', NULL, 0),
(11, 'EQ011', 'Biến áp thực hành', NULL, 0),
(12, 'EQ012', 'Đèn', NULL, 0);

-- --------------------------------------------------------

--
-- Table structure for table `faculty`
--

CREATE TABLE `faculty` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `faculty_id` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `faculty`
--

INSERT INTO `faculty` (`id`, `name`, `faculty_id`) VALUES
(1, 'Công nghệ thông tin', 'CNTT'),
(2, 'Hệ thống thông tin', 'HTTT'),
(3, 'Khoa học máy tính', 'KHMT'),
(4, 'Kỹ thuật máy tính', 'KTMT'),
(5, 'Thương mại điện tử', 'TMDT');

-- --------------------------------------------------------

--
-- Table structure for table `holidayactual`
--

CREATE TABLE `holidayactual` (
  `id` int(11) NOT NULL,
  `semester_id` int(11) NOT NULL,
  `rule_id` int(11) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `holidayrule`
--

CREATE TABLE `holidayrule` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `day_start` varchar(5) DEFAULT NULL,
  `day_end` varchar(5) DEFAULT NULL,
  `is_lunar` tinyint(1) DEFAULT 0,
  `recurring` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `holidayrule`
--

INSERT INTO `holidayrule` (`id`, `name`, `description`, `day_start`, `day_end`, `is_lunar`, `recurring`) VALUES
(1, 'Tết Dương lịch', 'Nghỉ Tết Dương lịch', '01-01', '01-01', 0, 1),
(2, 'Tết Nguyên Đán', 'Nghỉ Tết Nguyên đán (Mùng 1 - Mùng 5 tháng Giêng âm lịch)', '01-01', '05-01', 1, 1),
(3, 'Giỗ Tổ Hùng Vương', 'Giỗ Tổ Hùng Vương (10/3 âm lịch)', '10-03', '10-03', 1, 1),
(4, 'Ngày Giải phóng miền Nam', 'Ngày giải phóng miền Nam 30/4', '30-04', '30-04', 0, 1),
(5, 'Quốc tế Lao động', 'Ngày Quốc tế Lao động 1/5', '01-05', '01-05', 0, 1),
(6, 'Quốc khánh Việt Nam', 'Ngày Quốc khánh 2/9 (nghỉ 2 ngày)', '02-09', '03-09', 0, 1);

-- --------------------------------------------------------

--
-- Table structure for table `instructorsunavailabletime`
--

CREATE TABLE `instructorsunavailabletime` (
  `day_id` int(11) NOT NULL,
  `teacher_id` int(11) NOT NULL,
  `time_slot_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `rooms`
--

CREATE TABLE `rooms` (
  `id` int(11) NOT NULL,
  `code` varchar(50) NOT NULL,
  `name` varchar(255) NOT NULL,
  `type` varchar(100) DEFAULT NULL,
  `capacity_max` int(11) DEFAULT NULL,
  `capacity_optimal` int(11) DEFAULT NULL,
  `floor_number` int(11) DEFAULT NULL,
  `status` varchar(50) DEFAULT NULL,
  `buildings_id` int(11) NOT NULL,
  `metadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`metadata`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `rooms`
--

INSERT INTO `rooms` (`id`, `code`, `name`, `type`, `capacity_max`, `capacity_optimal`, `floor_number`, `status`, `buildings_id`, `metadata`, `created_at`, `updated_at`) VALUES
(1, '1A01', 'Phòng TSCH-A - Tầng trệt - 01', 'Lý thuyết', 60, 40, 0, 'active', 1, NULL, '2025-11-16 04:56:58', '2025-11-16 04:56:58'),
(2, '1A02', 'Phòng TSCH-A - Tầng trệt - 02', 'Thực hành', 30, 25, 0, 'active', 1, NULL, '2025-11-16 04:56:58', '2025-11-16 04:56:58'),
(3, '1A03', 'Phòng TSCH-A - Tầng trệt - 03', 'Lý thuyết', 60, 40, 0, 'active', 1, NULL, '2025-11-16 04:56:58', '2025-11-16 04:56:58'),
(4, '1A04', 'Phòng TSCH-A - Tầng trệt - 04', 'Thực hành', 30, 25, 0, 'active', 1, NULL, '2025-11-16 04:56:58', '2025-11-16 04:56:58'),
(5, '1A11', 'Phòng TSCH-A - Tầng 1 - 01', 'Lý thuyết', 60, 40, 1, 'active', 1, NULL, '2025-11-16 04:56:58', '2025-11-16 04:56:58'),
(6, '1A12', 'Phòng TSCH-A - Tầng 1 - 02', 'Thực hành', 30, 25, 1, 'active', 1, NULL, '2025-11-16 04:56:58', '2025-11-16 04:56:58'),
(7, '1A13', 'Phòng TSCH-A - Tầng 1 - 03', 'Lý thuyết', 60, 40, 1, 'active', 1, NULL, '2025-11-16 04:56:58', '2025-11-16 04:56:58'),
(8, '1A21', 'Phòng TSCH-A - Tầng 2 - 01', 'Lý thuyết', 60, 40, 2, 'active', 1, NULL, '2025-11-16 04:56:58', '2025-11-16 04:56:58'),
(9, '1A22', 'Phòng TSCH-A - Tầng 2 - 02', 'Thực hành', 30, 25, 2, 'active', 1, NULL, '2025-11-16 04:56:58', '2025-11-16 04:56:58'),
(10, '1A23', 'Phòng TSCH-A - Tầng 2 - 03', 'Lý thuyết', 60, 40, 2, 'active', 1, NULL, '2025-11-16 04:56:58', '2025-11-16 04:56:58'),
(11, '1A24', 'Phòng TSCH-A - Tầng 2 - 04', 'Thực hành', 30, 25, 2, 'active', 1, NULL, '2025-11-16 04:56:58', '2025-11-16 04:56:58'),
(12, '1A31', 'Phòng TSCH-A - Tầng 3 - 01', 'Lý thuyết', 60, 40, 3, 'active', 1, NULL, '2025-11-16 04:56:58', '2025-11-16 04:56:58'),
(13, '1A32', 'Phòng TSCH-A - Tầng 3 - 02', 'Thực hành', 30, 25, 3, 'active', 1, NULL, '2025-11-16 04:56:58', '2025-11-16 04:56:58'),
(14, '1A33', 'Phòng TSCH-A - Tầng 3 - 03', 'Lý thuyết', 60, 40, 3, 'active', 1, NULL, '2025-11-16 04:56:58', '2025-11-16 04:56:58'),
(15, '1B01', 'Phòng TSCH-B - Tầng trệt - 01', 'Lý thuyết', 60, 40, 0, 'active', 2, NULL, '2025-11-16 04:56:58', '2025-11-16 04:56:58'),
(16, '1B02', 'Phòng TSCH-B - Tầng trệt - 02', 'Thực hành', 30, 25, 0, 'active', 2, NULL, '2025-11-16 04:56:58', '2025-11-16 04:56:58'),
(17, '1B03', 'Phòng TSCH-B - Tầng trệt - 03', 'Lý thuyết', 60, 40, 0, 'active', 2, NULL, '2025-11-16 04:56:58', '2025-11-16 04:56:58'),
(18, '1B04', 'Phòng TSCH-B - Tầng trệt - 04', 'Thực hành', 30, 25, 0, 'active', 2, NULL, '2025-11-16 04:56:58', '2025-11-16 04:56:58'),
(19, '1B11', 'Phòng TSCH-B - Tầng 1 - 01', 'Lý thuyết', 60, 40, 1, 'active', 2, NULL, '2025-11-16 04:56:58', '2025-11-16 04:56:58'),
(20, '1B12', 'Phòng TSCH-B - Tầng 1 - 02', 'Thực hành', 30, 25, 1, 'active', 2, NULL, '2025-11-16 04:56:58', '2025-11-16 04:56:58'),
(21, '1B13', 'Phòng TSCH-B - Tầng 1 - 03', 'Lý thuyết', 60, 40, 1, 'active', 2, NULL, '2025-11-16 04:56:58', '2025-11-16 04:56:58'),
(22, '1B21', 'Phòng TSCH-B - Tầng 2 - 01', 'Lý thuyết', 60, 40, 2, 'active', 2, NULL, '2025-11-16 04:56:58', '2025-11-16 04:56:58'),
(23, '1B22', 'Phòng TSCH-B - Tầng 2 - 02', 'Thực hành', 30, 25, 2, 'active', 2, NULL, '2025-11-16 04:56:58', '2025-11-16 04:56:58'),
(24, '1B23', 'Phòng TSCH-B - Tầng 2 - 03', 'Lý thuyết', 60, 40, 2, 'active', 2, NULL, '2025-11-16 04:56:58', '2025-11-16 04:56:58'),
(25, '1B24', 'Phòng TSCH-B - Tầng 2 - 04', 'Thực hành', 30, 25, 2, 'active', 2, NULL, '2025-11-16 04:56:58', '2025-11-16 04:56:58'),
(26, '1B31', 'Phòng TSCH-B - Tầng 3 - 01', 'Lý thuyết', 60, 40, 3, 'active', 2, NULL, '2025-11-16 04:56:58', '2025-11-16 04:56:58'),
(27, '1B32', 'Phòng TSCH-B - Tầng 3 - 02', 'Thực hành', 30, 25, 3, 'active', 2, NULL, '2025-11-16 04:56:58', '2025-11-16 04:56:58'),
(28, '1B33', 'Phòng TSCH-B - Tầng 3 - 03', 'Lý thuyết', 60, 40, 3, 'active', 2, NULL, '2025-11-16 04:56:58', '2025-11-16 04:56:58'),
(29, '1C01', 'Phòng TSCH-C - Tầng trệt - 01', 'Lý thuyết', 60, 40, 0, 'active', 3, NULL, '2025-11-16 04:56:58', '2025-11-16 04:56:58'),
(30, '1C02', 'Phòng TSCH-C - Tầng trệt - 02', 'Thực hành', 30, 25, 0, 'active', 3, NULL, '2025-11-16 04:56:58', '2025-11-16 04:56:58'),
(31, '1C03', 'Phòng TSCH-C - Tầng trệt - 03', 'Lý thuyết', 60, 40, 0, 'active', 3, NULL, '2025-11-16 04:56:58', '2025-11-16 04:56:58'),
(32, '1C11', 'Phòng TSCH-C - Tầng 1 - 01', 'Lý thuyết', 60, 40, 1, 'active', 3, NULL, '2025-11-16 04:56:58', '2025-11-16 04:56:58'),
(33, '1C12', 'Phòng TSCH-C - Tầng 1 - 02', 'Thực hành', 30, 25, 1, 'active', 3, NULL, '2025-11-16 04:56:58', '2025-11-16 04:56:58'),
(34, '1C13', 'Phòng TSCH-C - Tầng 1 - 03', 'Lý thuyết', 60, 40, 1, 'active', 3, NULL, '2025-11-16 04:56:58', '2025-11-16 04:56:58'),
(35, '1C21', 'Phòng TSCH-C - Tầng 2 - 01', 'Lý thuyết', 60, 40, 2, 'active', 3, NULL, '2025-11-16 04:56:58', '2025-11-16 04:56:58'),
(36, '1C22', 'Phòng TSCH-C - Tầng 2 - 02', 'Thực hành', 30, 25, 2, 'active', 3, NULL, '2025-11-16 04:56:58', '2025-11-16 04:56:58'),
(37, '1C23', 'Phòng TSCH-C - Tầng 2 - 03', 'Lý thuyết', 60, 40, 2, 'active', 3, NULL, '2025-11-16 04:56:58', '2025-11-16 04:56:58'),
(38, '1D01', 'Phòng TSCH-D - Tầng trệt - 01', 'Lý thuyết', 60, 40, 0, 'active', 4, NULL, '2025-11-16 04:56:58', '2025-11-16 04:56:58'),
(39, '1D02', 'Phòng TSCH-D - Tầng trệt - 02', 'Thực hành', 30, 25, 0, 'active', 4, NULL, '2025-11-16 04:56:58', '2025-11-16 04:56:58'),
(40, '1D03', 'Phòng TSCH-D - Tầng trệt - 03', 'Lý thuyết', 60, 40, 0, 'active', 4, NULL, '2025-11-16 04:56:58', '2025-11-16 04:56:58'),
(41, '1D11', 'Phòng TSCH-D - Tầng 1 - 01', 'Lý thuyết', 60, 40, 1, 'active', 4, NULL, '2025-11-16 04:56:58', '2025-11-16 04:56:58'),
(42, '1D12', 'Phòng TSCH-D - Tầng 1 - 02', 'Thực hành', 30, 25, 1, 'active', 4, NULL, '2025-11-16 04:56:58', '2025-11-16 04:56:58'),
(43, '1E01', 'Sân TSCH-E - Tầng trệt - 01', 'Sân', 0, 0, 0, 'active', 5, NULL, '2025-11-16 04:56:58', '2025-11-16 04:56:58'),
(44, '1E02', 'Sân TSCH-E - Tầng trệt - 02', 'Sân', 0, 0, 0, 'active', 5, NULL, '2025-11-16 04:56:58', '2025-11-16 04:56:58'),
(45, '2A01', 'Phòng CSDT-A - Tầng trệt - 01', 'Lý thuyết', 60, 40, 0, 'active', 6, NULL, '2025-11-16 04:56:58', '2025-11-16 04:56:58'),
(46, '2A02', 'Phòng CSDT-A - Tầng trệt - 02', 'Thực hành', 30, 25, 0, 'active', 6, NULL, '2025-11-16 04:56:58', '2025-11-16 04:56:58'),
(47, '2A03', 'Phòng CSDT-A - Tầng trệt - 03', 'Lý thuyết', 60, 40, 0, 'active', 6, NULL, '2025-11-16 04:56:58', '2025-11-16 04:56:58'),
(48, '2A04', 'Phòng CSDT-A - Tầng trệt - 04', 'Thực hành', 30, 25, 0, 'active', 6, NULL, '2025-11-16 04:56:58', '2025-11-16 04:56:58'),
(49, '2A11', 'Phòng CSDT-A - Tầng 1 - 01', 'Lý thuyết', 60, 40, 1, 'active', 6, NULL, '2025-11-16 04:56:58', '2025-11-16 04:56:58'),
(50, '2A12', 'Phòng CSDT-A - Tầng 1 - 02', 'Thực hành', 30, 25, 1, 'active', 6, NULL, '2025-11-16 04:56:58', '2025-11-16 04:56:58'),
(51, '2A13', 'Phòng CSDT-A - Tầng 1 - 03', 'Lý thuyết', 60, 40, 1, 'active', 6, NULL, '2025-11-16 04:56:58', '2025-11-16 04:56:58'),
(52, '2A21', 'Phòng CSDT-A - Tầng 2 - 01', 'Lý thuyết', 60, 40, 2, 'active', 6, NULL, '2025-11-16 04:56:58', '2025-11-16 04:56:58'),
(53, '2A22', 'Phòng CSDT-A - Tầng 2 - 02', 'Thực hành', 30, 25, 2, 'active', 6, NULL, '2025-11-16 04:56:58', '2025-11-16 04:56:58'),
(54, '2A23', 'Phòng CSDT-A - Tầng 2 - 03', 'Lý thuyết', 60, 40, 2, 'active', 6, NULL, '2025-11-16 04:56:58', '2025-11-16 04:56:58'),
(55, '2A24', 'Phòng CSDT-A - Tầng 2 - 04', 'Thực hành', 30, 25, 2, 'active', 6, NULL, '2025-11-16 04:56:58', '2025-11-16 04:56:58'),
(56, '2A31', 'Phòng CSDT-A - Tầng 3 - 01', 'Lý thuyết', 60, 40, 3, 'active', 6, NULL, '2025-11-16 04:56:58', '2025-11-16 04:56:58'),
(57, '2A32', 'Phòng CSDT-A - Tầng 3 - 02', 'Thực hành', 30, 25, 3, 'active', 6, NULL, '2025-11-16 04:56:58', '2025-11-16 04:56:58'),
(58, '2A33', 'Phòng CSDT-A - Tầng 3 - 03', 'Lý thuyết', 60, 40, 3, 'active', 6, NULL, '2025-11-16 04:56:58', '2025-11-16 04:56:58'),
(59, '2B01', 'Phòng CSDT-B - Tầng trệt - 01', 'Lý thuyết', 60, 40, 0, 'active', 7, NULL, '2025-11-16 04:56:58', '2025-11-16 04:56:58'),
(60, '2B02', 'Phòng CSDT-B - Tầng trệt - 02', 'Thực hành', 30, 25, 0, 'active', 7, NULL, '2025-11-16 04:56:58', '2025-11-16 04:56:58'),
(61, '2B03', 'Phòng CSDT-B - Tầng trệt - 03', 'Lý thuyết', 60, 40, 0, 'active', 7, NULL, '2025-11-16 04:56:58', '2025-11-16 04:56:58'),
(62, '2B04', 'Phòng CSDT-B - Tầng trệt - 04', 'Thực hành', 30, 25, 0, 'active', 7, NULL, '2025-11-16 04:56:58', '2025-11-16 04:56:58'),
(63, '2B11', 'Phòng CSDT-B - Tầng 1 - 01', 'Lý thuyết', 60, 40, 1, 'active', 7, NULL, '2025-11-16 04:56:58', '2025-11-16 04:56:58'),
(64, '2B12', 'Phòng CSDT-B - Tầng 1 - 02', 'Thực hành', 30, 25, 1, 'active', 7, NULL, '2025-11-16 04:56:58', '2025-11-16 04:56:58'),
(65, '2B13', 'Phòng CSDT-B - Tầng 1 - 03', 'Lý thuyết', 60, 40, 1, 'active', 7, NULL, '2025-11-16 04:56:58', '2025-11-16 04:56:58'),
(66, '2B21', 'Phòng CSDT-B - Tầng 2 - 01', 'Lý thuyết', 60, 40, 2, 'active', 7, NULL, '2025-11-16 04:56:58', '2025-11-16 04:56:58'),
(67, '2B22', 'Phòng CSDT-B - Tầng 2 - 02', 'Thực hành', 30, 25, 2, 'active', 7, NULL, '2025-11-16 04:56:58', '2025-11-16 04:56:58'),
(68, '2B23', 'Phòng CSDT-B - Tầng 2 - 03', 'Lý thuyết', 60, 40, 2, 'active', 7, NULL, '2025-11-16 04:56:58', '2025-11-16 04:56:58'),
(69, '2B24', 'Phòng CSDT-B - Tầng 2 - 04', 'Thực hành', 30, 25, 2, 'active', 7, NULL, '2025-11-16 04:56:58', '2025-11-16 04:56:58'),
(70, '2B31', 'Phòng CSDT-B - Tầng 3 - 01', 'Lý thuyết', 60, 40, 3, 'active', 7, NULL, '2025-11-16 04:56:58', '2025-11-16 04:56:58'),
(71, '2B32', 'Phòng CSDT-B - Tầng 3 - 02', 'Thực hành', 30, 25, 3, 'active', 7, NULL, '2025-11-16 04:56:58', '2025-11-16 04:56:58'),
(72, '2B33', 'Phòng CSDT-B - Tầng 3 - 03', 'Lý thuyết', 60, 40, 3, 'active', 7, NULL, '2025-11-16 04:56:58', '2025-11-16 04:56:58'),
(73, '2C01', 'Phòng CSDT-C - Tầng trệt - 01', 'Lý thuyết', 60, 40, 0, 'active', 8, NULL, '2025-11-16 04:56:58', '2025-11-16 04:56:58'),
(74, '2C02', 'Phòng CSDT-C - Tầng trệt - 02', 'Thực hành', 30, 25, 0, 'active', 8, NULL, '2025-11-16 04:56:58', '2025-11-16 04:56:58'),
(75, '2C03', 'Phòng CSDT-C - Tầng trệt - 03', 'Lý thuyết', 60, 40, 0, 'active', 8, NULL, '2025-11-16 04:56:58', '2025-11-16 04:56:58'),
(76, '2C11', 'Phòng CSDT-C - Tầng 1 - 01', 'Lý thuyết', 60, 40, 1, 'active', 8, NULL, '2025-11-16 04:56:58', '2025-11-16 04:56:58'),
(77, '2C12', 'Phòng CSDT-C - Tầng 1 - 02', 'Thực hành', 30, 25, 1, 'active', 8, NULL, '2025-11-16 04:56:58', '2025-11-16 04:56:58'),
(78, '2C13', 'Phòng CSDT-C - Tầng 1 - 03', 'Lý thuyết', 60, 40, 1, 'active', 8, NULL, '2025-11-16 04:56:58', '2025-11-16 04:56:58'),
(79, '2C21', 'Phòng CSDT-C - Tầng 2 - 01', 'Lý thuyết', 60, 40, 2, 'active', 8, NULL, '2025-11-16 04:56:58', '2025-11-16 04:56:58'),
(80, '2C22', 'Phòng CSDT-C - Tầng 2 - 02', 'Thực hành', 30, 25, 2, 'active', 8, NULL, '2025-11-16 04:56:58', '2025-11-16 04:56:58'),
(81, '2C23', 'Phòng CSDT-C - Tầng 2 - 03', 'Lý thuyết', 60, 40, 2, 'active', 8, NULL, '2025-11-16 04:56:58', '2025-11-16 04:56:58'),
(82, '2D01', 'Phòng CSDT-D - Tầng trệt - 01', 'Lý thuyết', 60, 40, 0, 'active', 9, NULL, '2025-11-16 04:56:58', '2025-11-16 04:56:58'),
(83, '2D02', 'Phòng CSDT-D - Tầng trệt - 02', 'Thực hành', 30, 25, 0, 'active', 9, NULL, '2025-11-16 04:56:58', '2025-11-16 04:56:58'),
(84, '2D03', 'Phòng CSDT-D - Tầng trệt - 03', 'Lý thuyết', 60, 40, 0, 'active', 9, NULL, '2025-11-16 04:56:58', '2025-11-16 04:56:58'),
(85, '2D11', 'Phòng CSDT-D - Tầng 1 - 01', 'Lý thuyết', 60, 40, 1, 'active', 9, NULL, '2025-11-16 04:56:58', '2025-11-16 04:56:58'),
(86, '2D12', 'Phòng CSDT-D - Tầng 1 - 02', 'Thực hành', 30, 25, 1, 'active', 9, NULL, '2025-11-16 04:56:58', '2025-11-16 04:56:58'),
(87, '2E01', 'Sân CSDT-E - Tầng trệt - 01', 'Sân', 0, 0, 0, 'active', 10, NULL, '2025-11-16 04:56:58', '2025-11-16 04:56:58'),
(88, '2E02', 'Sân CSDT-E - Tầng trệt - 02', 'Sân', 0, 0, 0, 'active', 10, NULL, '2025-11-16 04:56:58', '2025-11-16 04:56:58');

-- --------------------------------------------------------

--
-- Table structure for table `roomsequipments`
--

CREATE TABLE `roomsequipments` (
  `id` int(11) NOT NULL,
  `equipment_id` int(11) NOT NULL,
  `room_id` int(11) NOT NULL,
  `equipment_quantity` int(11) DEFAULT 0,
  `status` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `schedules`
--

CREATE TABLE `schedules` (
  `id` int(11) NOT NULL,
  `course_class_id` int(11) NOT NULL,
  `teacher_id` int(11) DEFAULT NULL,
  `room_id` int(11) DEFAULT NULL,
  `day_id` int(11) NOT NULL,
  `time_slot_id` int(11) DEFAULT NULL,
  `scheduler` varchar(255) DEFAULT NULL,
  `num_of_period` int(11) DEFAULT 1,
  `week_start` int(11) DEFAULT NULL,
  `week_end` int(11) DEFAULT NULL,
  `generation_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `schedules`
--

INSERT INTO `schedules` (`id`, `course_class_id`, `teacher_id`, `room_id`, `day_id`, `time_slot_id`, `scheduler`, `num_of_period`, `week_start`, `week_end`, `generation_id`) VALUES
(1, 1, 3, 12, 3, 3, 'genetic_algorithm', 4, 11, 20, 1),
(2, 1, 3, 12, 7, 7, 'genetic_algorithm', 4, 11, 20, 1),
(3, 2, 2, 8, 3, 6, 'genetic_algorithm', 4, 10, 19, 1),
(4, 2, 2, 8, 3, 5, 'genetic_algorithm', 4, 10, 19, 1),
(5, 3, 1, 4, 4, 2, 'genetic_algorithm', 4, 2, 11, 1),
(6, 3, 1, 4, 5, 4, 'genetic_algorithm', 4, 2, 11, 1),
(7, 3, 1, 4, 6, 2, 'genetic_algorithm', 4, 2, 11, 1),
(8, 4, 2, 1, 7, 9, 'genetic_algorithm', 4, 6, 15, 1),
(9, 4, 2, 1, 5, 4, 'genetic_algorithm', 4, 6, 15, 1),
(10, 5, 3, 8, 2, 5, 'genetic_algorithm', 4, 1, 10, 1),
(11, 5, 3, 8, 4, 7, 'genetic_algorithm', 4, 1, 10, 1),
(12, 6, 1, 3, 7, 2, 'genetic_algorithm', 4, 4, 13, 1),
(13, 6, 1, 3, 3, 5, 'genetic_algorithm', 4, 4, 13, 1),
(14, 6, 1, 3, 7, 8, 'genetic_algorithm', 4, 4, 13, 1);

-- --------------------------------------------------------

--
-- Table structure for table `schedule_generations`
--

CREATE TABLE `schedule_generations` (
  `id` int(11) NOT NULL,
  `semester` varchar(50) DEFAULT NULL,
  `semester_id` int(11) DEFAULT NULL,
  `total_weeks` int(11) DEFAULT NULL,
  `week_start` int(11) DEFAULT NULL,
  `week_end` int(11) DEFAULT NULL,
  `days_per_week` int(11) DEFAULT NULL,
  `sessions_per_day` int(11) DEFAULT NULL,
  `session_duration` int(11) DEFAULT NULL,
  `generated_at` datetime DEFAULT current_timestamp(),
  `fitness_score` double DEFAULT NULL,
  `penalty_breakdown` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`penalty_breakdown`)),
  `raw_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`raw_json`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `schedule_generations`
--

INSERT INTO `schedule_generations` (`id`, `semester`, `semester_id`, `total_weeks`, `week_start`, `week_end`, `days_per_week`, `sessions_per_day`, `session_duration`, `generated_at`, `fitness_score`, `penalty_breakdown`, `raw_json`) VALUES
(1, NULL, 1, 20, 1, 17, 6, 14, 4, '2025-11-16 04:57:08', 2150, '{\"SOFT_CONCURRENT_OVERLOAD\":2000,\"SOFT_WEEKLY_IMBALANCE\":150}', '{\"courses\":[{\"class_id\":1,\"course_id\":2,\"end_week\":20,\"room_id\":12,\"start_week\":11,\"student_count\":1,\"teacher_id\":3,\"weekly_slots\":[{\"day\":3,\"duration\":4,\"period\":3},{\"day\":7,\"duration\":4,\"period\":7}],\"weeks_needed\":10},{\"class_id\":2,\"course_id\":1,\"end_week\":19,\"room_id\":8,\"start_week\":10,\"student_count\":1,\"teacher_id\":2,\"weekly_slots\":[{\"day\":3,\"duration\":4,\"period\":6},{\"day\":3,\"duration\":4,\"period\":5}],\"weeks_needed\":10},{\"class_id\":3,\"course_id\":3,\"end_week\":11,\"room_id\":4,\"start_week\":2,\"student_count\":2,\"teacher_id\":1,\"weekly_slots\":[{\"day\":4,\"duration\":4,\"period\":2},{\"day\":5,\"duration\":4,\"period\":4},{\"day\":6,\"duration\":4,\"period\":2}],\"weeks_needed\":10},{\"class_id\":4,\"course_id\":2,\"end_week\":15,\"room_id\":1,\"start_week\":6,\"student_count\":1,\"teacher_id\":2,\"weekly_slots\":[{\"day\":7,\"duration\":4,\"period\":9},{\"day\":5,\"duration\":4,\"period\":4}],\"weeks_needed\":10},{\"class_id\":5,\"course_id\":1,\"end_week\":10,\"room_id\":8,\"start_week\":1,\"student_count\":2,\"teacher_id\":3,\"weekly_slots\":[{\"day\":2,\"duration\":4,\"period\":5},{\"day\":4,\"duration\":4,\"period\":7}],\"weeks_needed\":10},{\"class_id\":6,\"course_id\":3,\"end_week\":13,\"room_id\":3,\"start_week\":4,\"student_count\":3,\"teacher_id\":1,\"weekly_slots\":[{\"day\":7,\"duration\":4,\"period\":2},{\"day\":3,\"duration\":4,\"period\":5},{\"day\":7,\"duration\":4,\"period\":8}],\"weeks_needed\":10}],\"fitness\":2150,\"generations\":1,\"penalty_breakdown\":{\"SOFT_CONCURRENT_OVERLOAD\":2000,\"SOFT_WEEKLY_IMBALANCE\":150},\"schedule_summary\":{\"concurrent_load\":{\"1\":1,\"2\":2,\"3\":2,\"4\":3,\"5\":3,\"6\":4,\"7\":4,\"8\":4,\"9\":4,\"10\":5,\"11\":5,\"12\":4,\"13\":4,\"14\":3,\"15\":3,\"16\":2,\"17\":2,\"18\":2,\"19\":2,\"20\":1},\"total_courses\":6,\"weeks_used\":[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20]},\"semester\":{\"max_concurrent_courses\":4,\"start_week\":1,\"end_week\":20,\"sessions_per_day\":14,\"session_duration\":4,\"days_per_week\":6,\"semester_id\":1},\"success\":true}');

-- --------------------------------------------------------

--
-- Table structure for table `schedule_instances`
--

CREATE TABLE `schedule_instances` (
  `id` int(11) NOT NULL,
  `schedule_id` int(11) NOT NULL,
  `date` date NOT NULL,
  `time_slot_id` int(11) DEFAULT NULL,
  `room_id` int(11) DEFAULT NULL,
  `teacher_id` int(11) DEFAULT NULL,
  `status` varchar(50) DEFAULT 'scheduled',
  `cancel_reason` text DEFAULT NULL,
  `replaced_by_instance_id` int(11) DEFAULT NULL,
  `origin` varchar(50) DEFAULT 'auto',
  `metadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`metadata`)),
  `createdAt` datetime NOT NULL DEFAULT current_timestamp(),
  `updatedAt` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `schedule_instances`
--

INSERT INTO `schedule_instances` (`id`, `schedule_id`, `date`, `time_slot_id`, `room_id`, `teacher_id`, `status`, `cancel_reason`, `replaced_by_instance_id`, `origin`, `metadata`, `createdAt`, `updatedAt`) VALUES
(1, 1, '2025-11-11', 3, 12, 3, 'scheduled', NULL, NULL, 'auto', '{\"generated_from\":\"pattern\",\"generation_id\":1}', '2025-11-16 04:57:08', '2025-11-16 04:57:08'),
(2, 1, '2025-11-18', 3, 12, 3, 'scheduled', NULL, NULL, 'auto', '{\"generated_from\":\"pattern\",\"generation_id\":1}', '2025-11-16 04:57:08', '2025-11-16 04:57:08'),
(3, 1, '2025-11-25', 3, 12, 3, 'scheduled', NULL, NULL, 'auto', '{\"generated_from\":\"pattern\",\"generation_id\":1}', '2025-11-16 04:57:08', '2025-11-16 04:57:08'),
(4, 1, '2025-12-02', 3, 12, 3, 'scheduled', NULL, NULL, 'auto', '{\"generated_from\":\"pattern\",\"generation_id\":1}', '2025-11-16 04:57:08', '2025-11-16 04:57:08'),
(5, 1, '2025-12-09', 3, 12, 3, 'scheduled', NULL, NULL, 'auto', '{\"generated_from\":\"pattern\",\"generation_id\":1}', '2025-11-16 04:57:08', '2025-11-16 04:57:08'),
(6, 1, '2025-12-16', 3, 12, 3, 'scheduled', NULL, NULL, 'auto', '{\"generated_from\":\"pattern\",\"generation_id\":1}', '2025-11-16 04:57:08', '2025-11-16 04:57:08'),
(7, 1, '2025-12-23', 3, 12, 3, 'scheduled', NULL, NULL, 'auto', '{\"generated_from\":\"pattern\",\"generation_id\":1}', '2025-11-16 04:57:08', '2025-11-16 04:57:08'),
(8, 1, '2025-12-30', 3, 12, 3, 'scheduled', NULL, NULL, 'auto', '{\"generated_from\":\"pattern\",\"generation_id\":1}', '2025-11-16 04:57:08', '2025-11-16 04:57:08'),
(9, 1, '2026-01-06', 3, 12, 3, 'scheduled', NULL, NULL, 'auto', '{\"generated_from\":\"pattern\",\"generation_id\":1}', '2025-11-16 04:57:08', '2025-11-16 04:57:08'),
(10, 1, '2026-01-13', 3, 12, 3, 'scheduled', NULL, NULL, 'auto', '{\"generated_from\":\"pattern\",\"generation_id\":1}', '2025-11-16 04:57:08', '2025-11-16 04:57:08'),
(11, 2, '2025-11-15', 7, 12, 3, 'scheduled', NULL, NULL, 'auto', '{\"generated_from\":\"pattern\",\"generation_id\":1}', '2025-11-16 04:57:08', '2025-11-16 04:57:08'),
(12, 2, '2025-11-22', 7, 12, 3, 'scheduled', NULL, NULL, 'auto', '{\"generated_from\":\"pattern\",\"generation_id\":1}', '2025-11-16 04:57:08', '2025-11-16 04:57:08'),
(13, 2, '2025-11-29', 7, 12, 3, 'scheduled', NULL, NULL, 'auto', '{\"generated_from\":\"pattern\",\"generation_id\":1}', '2025-11-16 04:57:08', '2025-11-16 04:57:08'),
(14, 2, '2025-12-06', 7, 12, 3, 'scheduled', NULL, NULL, 'auto', '{\"generated_from\":\"pattern\",\"generation_id\":1}', '2025-11-16 04:57:08', '2025-11-16 04:57:08'),
(15, 2, '2025-12-13', 7, 12, 3, 'scheduled', NULL, NULL, 'auto', '{\"generated_from\":\"pattern\",\"generation_id\":1}', '2025-11-16 04:57:08', '2025-11-16 04:57:08'),
(16, 2, '2025-12-20', 7, 12, 3, 'scheduled', NULL, NULL, 'auto', '{\"generated_from\":\"pattern\",\"generation_id\":1}', '2025-11-16 04:57:08', '2025-11-16 04:57:08'),
(17, 2, '2025-12-27', 7, 12, 3, 'scheduled', NULL, NULL, 'auto', '{\"generated_from\":\"pattern\",\"generation_id\":1}', '2025-11-16 04:57:08', '2025-11-16 04:57:08'),
(18, 2, '2026-01-03', 7, 12, 3, 'scheduled', NULL, NULL, 'auto', '{\"generated_from\":\"pattern\",\"generation_id\":1}', '2025-11-16 04:57:08', '2025-11-16 04:57:08'),
(19, 2, '2026-01-10', 7, 12, 3, 'scheduled', NULL, NULL, 'auto', '{\"generated_from\":\"pattern\",\"generation_id\":1}', '2025-11-16 04:57:08', '2025-11-16 04:57:08'),
(20, 3, '2025-11-04', 6, 8, 2, 'scheduled', NULL, NULL, 'auto', '{\"generated_from\":\"pattern\",\"generation_id\":1}', '2025-11-16 04:57:08', '2025-11-16 04:57:08'),
(21, 3, '2025-11-11', 6, 8, 2, 'scheduled', NULL, NULL, 'auto', '{\"generated_from\":\"pattern\",\"generation_id\":1}', '2025-11-16 04:57:08', '2025-11-16 04:57:08'),
(22, 3, '2025-11-18', 6, 8, 2, 'scheduled', NULL, NULL, 'auto', '{\"generated_from\":\"pattern\",\"generation_id\":1}', '2025-11-16 04:57:08', '2025-11-16 04:57:08'),
(23, 3, '2025-11-25', 6, 8, 2, 'scheduled', NULL, NULL, 'auto', '{\"generated_from\":\"pattern\",\"generation_id\":1}', '2025-11-16 04:57:08', '2025-11-16 04:57:08'),
(24, 3, '2025-12-02', 6, 8, 2, 'scheduled', NULL, NULL, 'auto', '{\"generated_from\":\"pattern\",\"generation_id\":1}', '2025-11-16 04:57:08', '2025-11-16 04:57:08'),
(25, 3, '2025-12-09', 6, 8, 2, 'scheduled', NULL, NULL, 'auto', '{\"generated_from\":\"pattern\",\"generation_id\":1}', '2025-11-16 04:57:08', '2025-11-16 04:57:08'),
(26, 3, '2025-12-16', 6, 8, 2, 'scheduled', NULL, NULL, 'auto', '{\"generated_from\":\"pattern\",\"generation_id\":1}', '2025-11-16 04:57:08', '2025-11-16 04:57:08'),
(27, 3, '2025-12-23', 6, 8, 2, 'scheduled', NULL, NULL, 'auto', '{\"generated_from\":\"pattern\",\"generation_id\":1}', '2025-11-16 04:57:08', '2025-11-16 04:57:08'),
(28, 3, '2025-12-30', 6, 8, 2, 'scheduled', NULL, NULL, 'auto', '{\"generated_from\":\"pattern\",\"generation_id\":1}', '2025-11-16 04:57:08', '2025-11-16 04:57:08'),
(29, 3, '2026-01-06', 6, 8, 2, 'scheduled', NULL, NULL, 'auto', '{\"generated_from\":\"pattern\",\"generation_id\":1}', '2025-11-16 04:57:08', '2025-11-16 04:57:08'),
(30, 4, '2025-11-04', 5, 8, 2, 'scheduled', NULL, NULL, 'auto', '{\"generated_from\":\"pattern\",\"generation_id\":1}', '2025-11-16 04:57:08', '2025-11-16 04:57:08'),
(31, 4, '2025-11-11', 5, 8, 2, 'scheduled', NULL, NULL, 'auto', '{\"generated_from\":\"pattern\",\"generation_id\":1}', '2025-11-16 04:57:08', '2025-11-16 04:57:08'),
(32, 4, '2025-11-18', 5, 8, 2, 'scheduled', NULL, NULL, 'auto', '{\"generated_from\":\"pattern\",\"generation_id\":1}', '2025-11-16 04:57:08', '2025-11-16 04:57:08'),
(33, 4, '2025-11-25', 5, 8, 2, 'scheduled', NULL, NULL, 'auto', '{\"generated_from\":\"pattern\",\"generation_id\":1}', '2025-11-16 04:57:08', '2025-11-16 04:57:08'),
(34, 4, '2025-12-02', 5, 8, 2, 'scheduled', NULL, NULL, 'auto', '{\"generated_from\":\"pattern\",\"generation_id\":1}', '2025-11-16 04:57:08', '2025-11-16 04:57:08'),
(35, 4, '2025-12-09', 5, 8, 2, 'scheduled', NULL, NULL, 'auto', '{\"generated_from\":\"pattern\",\"generation_id\":1}', '2025-11-16 04:57:08', '2025-11-16 04:57:08'),
(36, 4, '2025-12-16', 5, 8, 2, 'scheduled', NULL, NULL, 'auto', '{\"generated_from\":\"pattern\",\"generation_id\":1}', '2025-11-16 04:57:08', '2025-11-16 04:57:08'),
(37, 4, '2025-12-23', 5, 8, 2, 'scheduled', NULL, NULL, 'auto', '{\"generated_from\":\"pattern\",\"generation_id\":1}', '2025-11-16 04:57:08', '2025-11-16 04:57:08'),
(38, 4, '2025-12-30', 5, 8, 2, 'scheduled', NULL, NULL, 'auto', '{\"generated_from\":\"pattern\",\"generation_id\":1}', '2025-11-16 04:57:08', '2025-11-16 04:57:08'),
(39, 4, '2026-01-06', 5, 8, 2, 'scheduled', NULL, NULL, 'auto', '{\"generated_from\":\"pattern\",\"generation_id\":1}', '2025-11-16 04:57:08', '2025-11-16 04:57:08'),
(40, 5, '2025-09-10', 2, 4, 1, 'scheduled', NULL, NULL, 'auto', '{\"generated_from\":\"pattern\",\"generation_id\":1}', '2025-11-16 04:57:08', '2025-11-16 04:57:08'),
(41, 5, '2025-09-17', 2, 4, 1, 'scheduled', NULL, NULL, 'auto', '{\"generated_from\":\"pattern\",\"generation_id\":1}', '2025-11-16 04:57:08', '2025-11-16 04:57:08'),
(42, 5, '2025-09-24', 2, 4, 1, 'scheduled', NULL, NULL, 'auto', '{\"generated_from\":\"pattern\",\"generation_id\":1}', '2025-11-16 04:57:08', '2025-11-16 04:57:08'),
(43, 5, '2025-10-01', 2, 4, 1, 'scheduled', NULL, NULL, 'auto', '{\"generated_from\":\"pattern\",\"generation_id\":1}', '2025-11-16 04:57:08', '2025-11-16 04:57:08'),
(44, 5, '2025-10-08', 2, 4, 1, 'scheduled', NULL, NULL, 'auto', '{\"generated_from\":\"pattern\",\"generation_id\":1}', '2025-11-16 04:57:08', '2025-11-16 04:57:08'),
(45, 5, '2025-10-15', 2, 4, 1, 'scheduled', NULL, NULL, 'auto', '{\"generated_from\":\"pattern\",\"generation_id\":1}', '2025-11-16 04:57:08', '2025-11-16 04:57:08'),
(46, 5, '2025-10-22', 2, 4, 1, 'scheduled', NULL, NULL, 'auto', '{\"generated_from\":\"pattern\",\"generation_id\":1}', '2025-11-16 04:57:08', '2025-11-16 04:57:08'),
(47, 5, '2025-10-29', 2, 4, 1, 'scheduled', NULL, NULL, 'auto', '{\"generated_from\":\"pattern\",\"generation_id\":1}', '2025-11-16 04:57:08', '2025-11-16 04:57:08'),
(48, 5, '2025-11-05', 2, 4, 1, 'scheduled', NULL, NULL, 'auto', '{\"generated_from\":\"pattern\",\"generation_id\":1}', '2025-11-16 04:57:08', '2025-11-16 04:57:08'),
(49, 5, '2025-11-12', 2, 4, 1, 'scheduled', NULL, NULL, 'auto', '{\"generated_from\":\"pattern\",\"generation_id\":1}', '2025-11-16 04:57:08', '2025-11-16 04:57:08'),
(50, 6, '2025-09-11', 4, 4, 1, 'scheduled', NULL, NULL, 'auto', '{\"generated_from\":\"pattern\",\"generation_id\":1}', '2025-11-16 04:57:08', '2025-11-16 04:57:08'),
(51, 6, '2025-09-18', 4, 4, 1, 'scheduled', NULL, NULL, 'auto', '{\"generated_from\":\"pattern\",\"generation_id\":1}', '2025-11-16 04:57:08', '2025-11-16 04:57:08'),
(52, 6, '2025-09-25', 4, 4, 1, 'scheduled', NULL, NULL, 'auto', '{\"generated_from\":\"pattern\",\"generation_id\":1}', '2025-11-16 04:57:08', '2025-11-16 04:57:08'),
(53, 6, '2025-10-02', 4, 4, 1, 'scheduled', NULL, NULL, 'auto', '{\"generated_from\":\"pattern\",\"generation_id\":1}', '2025-11-16 04:57:08', '2025-11-16 04:57:08'),
(54, 6, '2025-10-09', 4, 4, 1, 'scheduled', NULL, NULL, 'auto', '{\"generated_from\":\"pattern\",\"generation_id\":1}', '2025-11-16 04:57:08', '2025-11-16 04:57:08'),
(55, 6, '2025-10-16', 4, 4, 1, 'scheduled', NULL, NULL, 'auto', '{\"generated_from\":\"pattern\",\"generation_id\":1}', '2025-11-16 04:57:08', '2025-11-16 04:57:08'),
(56, 6, '2025-10-23', 4, 4, 1, 'scheduled', NULL, NULL, 'auto', '{\"generated_from\":\"pattern\",\"generation_id\":1}', '2025-11-16 04:57:08', '2025-11-16 04:57:08'),
(57, 6, '2025-10-30', 4, 4, 1, 'scheduled', NULL, NULL, 'auto', '{\"generated_from\":\"pattern\",\"generation_id\":1}', '2025-11-16 04:57:08', '2025-11-16 04:57:08'),
(58, 6, '2025-11-06', 4, 4, 1, 'scheduled', NULL, NULL, 'auto', '{\"generated_from\":\"pattern\",\"generation_id\":1}', '2025-11-16 04:57:08', '2025-11-16 04:57:08'),
(59, 6, '2025-11-13', 4, 4, 1, 'scheduled', NULL, NULL, 'auto', '{\"generated_from\":\"pattern\",\"generation_id\":1}', '2025-11-16 04:57:08', '2025-11-16 04:57:08'),
(60, 7, '2025-09-12', 2, 4, 1, 'scheduled', NULL, NULL, 'auto', '{\"generated_from\":\"pattern\",\"generation_id\":1}', '2025-11-16 04:57:08', '2025-11-16 04:57:08'),
(61, 7, '2025-09-19', 2, 4, 1, 'scheduled', NULL, NULL, 'auto', '{\"generated_from\":\"pattern\",\"generation_id\":1}', '2025-11-16 04:57:08', '2025-11-16 04:57:08'),
(62, 7, '2025-09-26', 2, 4, 1, 'scheduled', NULL, NULL, 'auto', '{\"generated_from\":\"pattern\",\"generation_id\":1}', '2025-11-16 04:57:08', '2025-11-16 04:57:08'),
(63, 7, '2025-10-03', 2, 4, 1, 'scheduled', NULL, NULL, 'auto', '{\"generated_from\":\"pattern\",\"generation_id\":1}', '2025-11-16 04:57:08', '2025-11-16 04:57:08'),
(64, 7, '2025-10-10', 2, 4, 1, 'scheduled', NULL, NULL, 'auto', '{\"generated_from\":\"pattern\",\"generation_id\":1}', '2025-11-16 04:57:08', '2025-11-16 04:57:08'),
(65, 7, '2025-10-17', 2, 4, 1, 'scheduled', NULL, NULL, 'auto', '{\"generated_from\":\"pattern\",\"generation_id\":1}', '2025-11-16 04:57:08', '2025-11-16 04:57:08'),
(66, 7, '2025-10-24', 2, 4, 1, 'scheduled', NULL, NULL, 'auto', '{\"generated_from\":\"pattern\",\"generation_id\":1}', '2025-11-16 04:57:08', '2025-11-16 04:57:08'),
(67, 7, '2025-10-31', 2, 4, 1, 'scheduled', NULL, NULL, 'auto', '{\"generated_from\":\"pattern\",\"generation_id\":1}', '2025-11-16 04:57:08', '2025-11-16 04:57:08'),
(68, 7, '2025-11-07', 2, 4, 1, 'scheduled', NULL, NULL, 'auto', '{\"generated_from\":\"pattern\",\"generation_id\":1}', '2025-11-16 04:57:08', '2025-11-16 04:57:08'),
(69, 7, '2025-11-14', 2, 4, 1, 'scheduled', NULL, NULL, 'auto', '{\"generated_from\":\"pattern\",\"generation_id\":1}', '2025-11-16 04:57:08', '2025-11-16 04:57:08'),
(70, 8, '2025-10-11', 9, 1, 2, 'scheduled', NULL, NULL, 'auto', '{\"generated_from\":\"pattern\",\"generation_id\":1}', '2025-11-16 04:57:08', '2025-11-16 04:57:08'),
(71, 8, '2025-10-18', 9, 1, 2, 'scheduled', NULL, NULL, 'auto', '{\"generated_from\":\"pattern\",\"generation_id\":1}', '2025-11-16 04:57:08', '2025-11-16 04:57:08'),
(72, 8, '2025-10-25', 9, 1, 2, 'scheduled', NULL, NULL, 'auto', '{\"generated_from\":\"pattern\",\"generation_id\":1}', '2025-11-16 04:57:08', '2025-11-16 04:57:08'),
(73, 8, '2025-11-01', 9, 1, 2, 'scheduled', NULL, NULL, 'auto', '{\"generated_from\":\"pattern\",\"generation_id\":1}', '2025-11-16 04:57:08', '2025-11-16 04:57:08'),
(74, 8, '2025-11-08', 9, 1, 2, 'scheduled', NULL, NULL, 'auto', '{\"generated_from\":\"pattern\",\"generation_id\":1}', '2025-11-16 04:57:08', '2025-11-16 04:57:08'),
(75, 8, '2025-11-15', 9, 1, 2, 'scheduled', NULL, NULL, 'auto', '{\"generated_from\":\"pattern\",\"generation_id\":1}', '2025-11-16 04:57:08', '2025-11-16 04:57:08'),
(76, 8, '2025-11-22', 9, 1, 2, 'scheduled', NULL, NULL, 'auto', '{\"generated_from\":\"pattern\",\"generation_id\":1}', '2025-11-16 04:57:08', '2025-11-16 04:57:08'),
(77, 8, '2025-11-29', 9, 1, 2, 'scheduled', NULL, NULL, 'auto', '{\"generated_from\":\"pattern\",\"generation_id\":1}', '2025-11-16 04:57:08', '2025-11-16 04:57:08'),
(78, 8, '2025-12-06', 9, 1, 2, 'scheduled', NULL, NULL, 'auto', '{\"generated_from\":\"pattern\",\"generation_id\":1}', '2025-11-16 04:57:08', '2025-11-16 04:57:08'),
(79, 8, '2025-12-13', 9, 1, 2, 'scheduled', NULL, NULL, 'auto', '{\"generated_from\":\"pattern\",\"generation_id\":1}', '2025-11-16 04:57:08', '2025-11-16 04:57:08'),
(80, 9, '2025-10-09', 4, 1, 2, 'scheduled', NULL, NULL, 'auto', '{\"generated_from\":\"pattern\",\"generation_id\":1}', '2025-11-16 04:57:08', '2025-11-16 04:57:08'),
(81, 9, '2025-10-16', 4, 1, 2, 'scheduled', NULL, NULL, 'auto', '{\"generated_from\":\"pattern\",\"generation_id\":1}', '2025-11-16 04:57:08', '2025-11-16 04:57:08'),
(82, 9, '2025-10-23', 4, 1, 2, 'scheduled', NULL, NULL, 'auto', '{\"generated_from\":\"pattern\",\"generation_id\":1}', '2025-11-16 04:57:08', '2025-11-16 04:57:08'),
(83, 9, '2025-10-30', 4, 1, 2, 'scheduled', NULL, NULL, 'auto', '{\"generated_from\":\"pattern\",\"generation_id\":1}', '2025-11-16 04:57:08', '2025-11-16 04:57:08'),
(84, 9, '2025-11-06', 4, 1, 2, 'scheduled', NULL, NULL, 'auto', '{\"generated_from\":\"pattern\",\"generation_id\":1}', '2025-11-16 04:57:08', '2025-11-16 04:57:08'),
(85, 9, '2025-11-11', 4, 1, 2, 'scheduled', NULL, NULL, 'auto', '{\"generated_from\":\"pattern\",\"generation_id\":1}', '2025-11-16 04:57:08', '2025-11-16 05:44:54'),
(86, 9, '2025-11-20', 4, 1, 2, 'scheduled', NULL, NULL, 'auto', '{\"generated_from\":\"pattern\",\"generation_id\":1}', '2025-11-16 04:57:08', '2025-11-16 04:57:08'),
(87, 9, '2025-11-27', 4, 1, 2, 'scheduled', NULL, NULL, 'auto', '{\"generated_from\":\"pattern\",\"generation_id\":1}', '2025-11-16 04:57:08', '2025-11-16 04:57:08'),
(88, 9, '2025-12-04', 4, 1, 2, 'scheduled', NULL, NULL, 'auto', '{\"generated_from\":\"pattern\",\"generation_id\":1}', '2025-11-16 04:57:08', '2025-11-16 04:57:08'),
(89, 9, '2025-12-11', 4, 1, 2, 'scheduled', NULL, NULL, 'auto', '{\"generated_from\":\"pattern\",\"generation_id\":1}', '2025-11-16 04:57:08', '2025-11-16 04:57:08'),
(90, 10, '2025-09-01', 5, 8, 3, 'scheduled', NULL, NULL, 'auto', '{\"generated_from\":\"pattern\",\"generation_id\":1}', '2025-11-16 04:57:08', '2025-11-16 04:57:08'),
(91, 10, '2025-09-08', 5, 8, 3, 'scheduled', NULL, NULL, 'auto', '{\"generated_from\":\"pattern\",\"generation_id\":1}', '2025-11-16 04:57:08', '2025-11-16 04:57:08'),
(92, 10, '2025-09-15', 5, 8, 3, 'scheduled', NULL, NULL, 'auto', '{\"generated_from\":\"pattern\",\"generation_id\":1}', '2025-11-16 04:57:08', '2025-11-16 04:57:08'),
(93, 10, '2025-09-22', 5, 8, 3, 'scheduled', NULL, NULL, 'auto', '{\"generated_from\":\"pattern\",\"generation_id\":1}', '2025-11-16 04:57:08', '2025-11-16 04:57:08'),
(94, 10, '2025-09-29', 5, 8, 3, 'scheduled', NULL, NULL, 'auto', '{\"generated_from\":\"pattern\",\"generation_id\":1}', '2025-11-16 04:57:08', '2025-11-16 04:57:08'),
(95, 10, '2025-10-06', 5, 8, 3, 'scheduled', NULL, NULL, 'auto', '{\"generated_from\":\"pattern\",\"generation_id\":1}', '2025-11-16 04:57:08', '2025-11-16 04:57:08'),
(96, 10, '2025-10-13', 5, 8, 3, 'scheduled', NULL, NULL, 'auto', '{\"generated_from\":\"pattern\",\"generation_id\":1}', '2025-11-16 04:57:08', '2025-11-16 04:57:08'),
(97, 10, '2025-10-20', 5, 8, 3, 'scheduled', NULL, NULL, 'auto', '{\"generated_from\":\"pattern\",\"generation_id\":1}', '2025-11-16 04:57:08', '2025-11-16 04:57:08'),
(98, 10, '2025-10-27', 5, 8, 3, 'scheduled', NULL, NULL, 'auto', '{\"generated_from\":\"pattern\",\"generation_id\":1}', '2025-11-16 04:57:08', '2025-11-16 04:57:08'),
(99, 10, '2025-11-03', 5, 8, 3, 'scheduled', NULL, NULL, 'auto', '{\"generated_from\":\"pattern\",\"generation_id\":1}', '2025-11-16 04:57:08', '2025-11-16 04:57:08'),
(100, 11, '2025-09-03', 7, 8, 3, 'scheduled', NULL, NULL, 'auto', '{\"generated_from\":\"pattern\",\"generation_id\":1}', '2025-11-16 04:57:08', '2025-11-16 04:57:08'),
(101, 11, '2025-09-10', 7, 8, 3, 'scheduled', NULL, NULL, 'auto', '{\"generated_from\":\"pattern\",\"generation_id\":1}', '2025-11-16 04:57:08', '2025-11-16 04:57:08'),
(102, 11, '2025-09-17', 7, 8, 3, 'scheduled', NULL, NULL, 'auto', '{\"generated_from\":\"pattern\",\"generation_id\":1}', '2025-11-16 04:57:08', '2025-11-16 04:57:08'),
(103, 11, '2025-09-24', 7, 8, 3, 'scheduled', NULL, NULL, 'auto', '{\"generated_from\":\"pattern\",\"generation_id\":1}', '2025-11-16 04:57:08', '2025-11-16 04:57:08'),
(104, 11, '2025-10-01', 7, 8, 3, 'scheduled', NULL, NULL, 'auto', '{\"generated_from\":\"pattern\",\"generation_id\":1}', '2025-11-16 04:57:08', '2025-11-16 04:57:08'),
(105, 11, '2025-10-08', 7, 8, 3, 'scheduled', NULL, NULL, 'auto', '{\"generated_from\":\"pattern\",\"generation_id\":1}', '2025-11-16 04:57:08', '2025-11-16 04:57:08'),
(106, 11, '2025-10-15', 7, 8, 3, 'scheduled', NULL, NULL, 'auto', '{\"generated_from\":\"pattern\",\"generation_id\":1}', '2025-11-16 04:57:08', '2025-11-16 04:57:08'),
(107, 11, '2025-10-22', 7, 8, 3, 'scheduled', NULL, NULL, 'auto', '{\"generated_from\":\"pattern\",\"generation_id\":1}', '2025-11-16 04:57:08', '2025-11-16 04:57:08'),
(108, 11, '2025-10-29', 7, 8, 3, 'scheduled', NULL, NULL, 'auto', '{\"generated_from\":\"pattern\",\"generation_id\":1}', '2025-11-16 04:57:08', '2025-11-16 04:57:08'),
(109, 11, '2025-11-05', 7, 8, 3, 'scheduled', NULL, NULL, 'auto', '{\"generated_from\":\"pattern\",\"generation_id\":1}', '2025-11-16 04:57:08', '2025-11-16 04:57:08'),
(110, 12, '2025-09-27', 2, 3, 1, 'scheduled', NULL, NULL, 'auto', '{\"generated_from\":\"pattern\",\"generation_id\":1}', '2025-11-16 04:57:08', '2025-11-16 04:57:08'),
(111, 12, '2025-10-04', 2, 3, 1, 'scheduled', NULL, NULL, 'auto', '{\"generated_from\":\"pattern\",\"generation_id\":1}', '2025-11-16 04:57:08', '2025-11-16 04:57:08'),
(112, 12, '2025-10-11', 2, 3, 1, 'scheduled', NULL, NULL, 'auto', '{\"generated_from\":\"pattern\",\"generation_id\":1}', '2025-11-16 04:57:08', '2025-11-16 04:57:08'),
(113, 12, '2025-10-18', 2, 3, 1, 'scheduled', NULL, NULL, 'auto', '{\"generated_from\":\"pattern\",\"generation_id\":1}', '2025-11-16 04:57:08', '2025-11-16 04:57:08'),
(114, 12, '2025-10-25', 2, 3, 1, 'scheduled', NULL, NULL, 'auto', '{\"generated_from\":\"pattern\",\"generation_id\":1}', '2025-11-16 04:57:08', '2025-11-16 04:57:08'),
(115, 12, '2025-11-01', 2, 3, 1, 'scheduled', NULL, NULL, 'auto', '{\"generated_from\":\"pattern\",\"generation_id\":1}', '2025-11-16 04:57:08', '2025-11-16 04:57:08'),
(116, 12, '2025-11-08', 2, 3, 1, 'scheduled', NULL, NULL, 'auto', '{\"generated_from\":\"pattern\",\"generation_id\":1}', '2025-11-16 04:57:08', '2025-11-16 04:57:08'),
(117, 12, '2025-11-15', 2, 3, 1, 'scheduled', NULL, NULL, 'auto', '{\"generated_from\":\"pattern\",\"generation_id\":1}', '2025-11-16 04:57:08', '2025-11-16 04:57:08'),
(118, 12, '2025-11-22', 2, 3, 1, 'scheduled', NULL, NULL, 'auto', '{\"generated_from\":\"pattern\",\"generation_id\":1}', '2025-11-16 04:57:08', '2025-11-16 04:57:08'),
(119, 12, '2025-11-29', 2, 3, 1, 'scheduled', NULL, NULL, 'auto', '{\"generated_from\":\"pattern\",\"generation_id\":1}', '2025-11-16 04:57:08', '2025-11-16 04:57:08'),
(120, 13, '2025-09-23', 5, 3, 1, 'scheduled', NULL, NULL, 'auto', '{\"generated_from\":\"pattern\",\"generation_id\":1}', '2025-11-16 04:57:08', '2025-11-16 04:57:08'),
(121, 13, '2025-09-30', 5, 3, 1, 'scheduled', NULL, NULL, 'auto', '{\"generated_from\":\"pattern\",\"generation_id\":1}', '2025-11-16 04:57:08', '2025-11-16 04:57:08'),
(122, 13, '2025-10-07', 5, 3, 1, 'scheduled', NULL, NULL, 'auto', '{\"generated_from\":\"pattern\",\"generation_id\":1}', '2025-11-16 04:57:08', '2025-11-16 04:57:08'),
(123, 13, '2025-10-14', 5, 3, 1, 'scheduled', NULL, NULL, 'auto', '{\"generated_from\":\"pattern\",\"generation_id\":1}', '2025-11-16 04:57:08', '2025-11-16 04:57:08'),
(124, 13, '2025-10-21', 5, 3, 1, 'scheduled', NULL, NULL, 'auto', '{\"generated_from\":\"pattern\",\"generation_id\":1}', '2025-11-16 04:57:08', '2025-11-16 04:57:08'),
(125, 13, '2025-10-28', 5, 3, 1, 'scheduled', NULL, NULL, 'auto', '{\"generated_from\":\"pattern\",\"generation_id\":1}', '2025-11-16 04:57:08', '2025-11-16 04:57:08'),
(126, 13, '2025-11-04', 5, 3, 1, 'scheduled', NULL, NULL, 'auto', '{\"generated_from\":\"pattern\",\"generation_id\":1}', '2025-11-16 04:57:08', '2025-11-16 04:57:08'),
(127, 13, '2025-11-11', 5, 3, 1, 'scheduled', NULL, NULL, 'auto', '{\"generated_from\":\"pattern\",\"generation_id\":1}', '2025-11-16 04:57:08', '2025-11-16 04:57:08'),
(128, 13, '2025-11-18', 5, 3, 1, 'scheduled', NULL, NULL, 'auto', '{\"generated_from\":\"pattern\",\"generation_id\":1}', '2025-11-16 04:57:08', '2025-11-16 04:57:08'),
(129, 13, '2025-11-25', 5, 3, 1, 'scheduled', NULL, NULL, 'auto', '{\"generated_from\":\"pattern\",\"generation_id\":1}', '2025-11-16 04:57:08', '2025-11-16 04:57:08'),
(130, 14, '2025-09-27', 8, 3, 1, 'scheduled', NULL, NULL, 'auto', '{\"generated_from\":\"pattern\",\"generation_id\":1}', '2025-11-16 04:57:08', '2025-11-16 04:57:08'),
(131, 14, '2025-10-04', 8, 3, 1, 'scheduled', NULL, NULL, 'auto', '{\"generated_from\":\"pattern\",\"generation_id\":1}', '2025-11-16 04:57:08', '2025-11-16 04:57:08'),
(132, 14, '2025-10-11', 8, 3, 1, 'scheduled', NULL, NULL, 'auto', '{\"generated_from\":\"pattern\",\"generation_id\":1}', '2025-11-16 04:57:08', '2025-11-16 04:57:08'),
(133, 14, '2025-10-18', 8, 3, 1, 'scheduled', NULL, NULL, 'auto', '{\"generated_from\":\"pattern\",\"generation_id\":1}', '2025-11-16 04:57:08', '2025-11-16 04:57:08'),
(134, 14, '2025-10-25', 8, 3, 1, 'scheduled', NULL, NULL, 'auto', '{\"generated_from\":\"pattern\",\"generation_id\":1}', '2025-11-16 04:57:08', '2025-11-16 04:57:08'),
(135, 14, '2025-11-01', 8, 3, 1, 'scheduled', NULL, NULL, 'auto', '{\"generated_from\":\"pattern\",\"generation_id\":1}', '2025-11-16 04:57:08', '2025-11-16 04:57:08'),
(136, 14, '2025-11-08', 8, 3, 1, 'scheduled', NULL, NULL, 'auto', '{\"generated_from\":\"pattern\",\"generation_id\":1}', '2025-11-16 04:57:08', '2025-11-16 04:57:08'),
(137, 14, '2025-11-15', 8, 3, 1, 'scheduled', NULL, NULL, 'auto', '{\"generated_from\":\"pattern\",\"generation_id\":1}', '2025-11-16 04:57:08', '2025-11-16 04:57:08'),
(138, 14, '2025-11-22', 8, 3, 1, 'scheduled', NULL, NULL, 'auto', '{\"generated_from\":\"pattern\",\"generation_id\":1}', '2025-11-16 04:57:08', '2025-11-16 04:57:08'),
(139, 14, '2025-11-29', 8, 3, 1, 'scheduled', NULL, NULL, 'auto', '{\"generated_from\":\"pattern\",\"generation_id\":1}', '2025-11-16 04:57:08', '2025-11-16 04:57:08');

-- --------------------------------------------------------

--
-- Table structure for table `semesters`
--

CREATE TABLE `semesters` (
  `id` int(11) NOT NULL,
  `AcademicYearsid` int(11) NOT NULL,
  `code` varchar(50) NOT NULL,
  `name` varchar(255) NOT NULL,
  `start` date NOT NULL,
  `end` date NOT NULL,
  `status` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `semesters`
--

INSERT INTO `semesters` (`id`, `AcademicYearsid`, `code`, `name`, `start`, `end`, `status`) VALUES
(1, 1, 'HK1 2025-2026', 'Học kỳ 1 2025-2026', '2025-09-01', '2026-01-15', 'upcoming'),
(2, 1, 'HK2 2025-2026', 'Học kỳ 2 2025-2026', '2026-02-01', '2026-06-30', 'upcoming'),
(3, 2, 'HK1 2024-2025', 'Học kỳ 1 2024-2025', '2024-09-01', '2025-01-15', 'finished'),
(4, 2, 'HK2 2024-2025', 'Học kỳ 2 2024-2025', '2025-02-01', '2025-06-30', 'finished'),
(5, 3, 'HK1 2023-2024', 'Học kỳ 1 2023-2024', '2023-09-01', '2024-01-15', 'finished'),
(6, 3, 'HK2 2023-2024', 'Học kỳ 2 2023-2024', '2024-02-01', '2024-06-30', 'finished');

-- --------------------------------------------------------

--
-- Table structure for table `softcontraist`
--

CREATE TABLE `softcontraist` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `students`
--

CREATE TABLE `students` (
  `id` int(11) NOT NULL,
  `class_id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `student_identifier` varchar(50) NOT NULL,
  `date_of_birth` date DEFAULT NULL,
  `gender` varchar(20) DEFAULT NULL,
  `status` varchar(50) DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `id_number` varchar(100) DEFAULT NULL,
  `ethnicity` varchar(100) DEFAULT NULL,
  `religion` varchar(100) DEFAULT NULL,
  `place_of_birth` varchar(255) DEFAULT NULL,
  `nationality` varchar(100) DEFAULT 'Việt Nam',
  `email_school` varchar(255) DEFAULT NULL,
  `email_personal` varchar(255) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `students`
--

INSERT INTO `students` (`id`, `class_id`, `user_id`, `name`, `student_identifier`, `date_of_birth`, `gender`, `status`, `phone`, `id_number`, `ethnicity`, `religion`, `place_of_birth`, `nationality`, `email_school`, `email_personal`, `address`, `created_at`, `updated_at`) VALUES
(1, 1, 4, 'Nguyễn Văn An', 'B21DCCN001', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Việt Nam', 'b21dccn001@student.example.edu.vn', NULL, NULL, '2025-11-16 11:56:58', '2025-11-16 11:56:58'),
(2, 1, 5, 'Trần Thị Bình', 'B21DCCN002', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Việt Nam', 'b21dccn002@student.example.edu.vn', NULL, NULL, '2025-11-16 11:56:58', '2025-11-16 11:56:58'),
(3, 2, 6, 'Lê Văn Cường', 'B21DCAT001', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Việt Nam', 'b21dcat001@student.example.edu.vn', NULL, NULL, '2025-11-16 11:56:58', '2025-11-16 11:56:58');

-- --------------------------------------------------------

--
-- Table structure for table `subjectrequiresequipment`
--

CREATE TABLE `subjectrequiresequipment` (
  `id` int(11) NOT NULL,
  `subject_id` int(11) NOT NULL,
  `equipment_id` int(11) NOT NULL,
  `require_quantity_per_person` int(11) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `subjects`
--

CREATE TABLE `subjects` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `training_type_id` int(11) NOT NULL,
  `code` varchar(50) NOT NULL,
  `theory_hours` int(11) DEFAULT 0,
  `self_study_hours` int(11) DEFAULT 0,
  `practice_hours` int(11) DEFAULT 0,
  `credits` int(11) DEFAULT 0,
  `requires_lab` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `subjects`
--

INSERT INTO `subjects` (`id`, `name`, `training_type_id`, `code`, `theory_hours`, `self_study_hours`, `practice_hours`, `credits`, `requires_lab`) VALUES
(1, 'Lập trình Cơ bản', 1, 'MH001', 30, 15, 15, 0, 0),
(2, 'Cơ sở dữ liệu', 1, 'MH002', 30, 15, 15, 0, 1),
(3, 'Trí tuệ nhân tạo', 1, 'MH003', 45, 20, 20, 0, 1);

-- --------------------------------------------------------

--
-- Table structure for table `systemconfigs`
--

CREATE TABLE `systemconfigs` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `value` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `teachers`
--

CREATE TABLE `teachers` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `academic_title` varchar(255) DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  `gender` varchar(20) DEFAULT NULL,
  `status` varchar(50) DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `id_number` varchar(100) DEFAULT NULL,
  `ethnicity` varchar(100) DEFAULT NULL,
  `religion` varchar(100) DEFAULT NULL,
  `place_of_birth` varchar(255) DEFAULT NULL,
  `nationality` varchar(100) DEFAULT 'Việt Nam',
  `email_school` varchar(255) DEFAULT NULL,
  `email_personal` varchar(255) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `teacher_identifier` varchar(50) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `faculty_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `teachers`
--

INSERT INTO `teachers` (`id`, `name`, `academic_title`, `date_of_birth`, `gender`, `status`, `phone`, `id_number`, `ethnicity`, `religion`, `place_of_birth`, `nationality`, `email_school`, `email_personal`, `address`, `created_at`, `updated_at`, `teacher_identifier`, `user_id`, `faculty_id`) VALUES
(1, 'Nguyễn Văn A', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Việt Nam', 'gv001@teacher.example.edu.vn', NULL, NULL, '2025-11-16 11:56:58', '2025-11-16 11:56:58', 'GV001', 7, 1),
(2, 'Trần Thị B', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Việt Nam', 'gv002@teacher.example.edu.vn', NULL, NULL, '2025-11-16 11:56:58', '2025-11-16 11:56:58', 'GV002', 8, 2),
(3, 'Lê Văn C', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Việt Nam', 'gv003@teacher.example.edu.vn', NULL, NULL, '2025-11-16 11:56:58', '2025-11-16 11:56:58', 'GV003', 9, 3);

-- --------------------------------------------------------

--
-- Table structure for table `teachings`
--

CREATE TABLE `teachings` (
  `id` int(11) NOT NULL,
  `course_class_id` int(11) NOT NULL,
  `teacher_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `timeslots`
--

CREATE TABLE `timeslots` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `idx` int(11) NOT NULL,
  `start_hour` int(11) DEFAULT NULL,
  `start_min` int(11) DEFAULT NULL,
  `end_hour` int(11) DEFAULT NULL,
  `end_min` int(11) DEFAULT NULL,
  `is_break` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `timeslots`
--

INSERT INTO `timeslots` (`id`, `name`, `idx`, `start_hour`, `start_min`, `end_hour`, `end_min`, `is_break`) VALUES
(1, 'Tiết 1', 1, 7, 0, 7, 50, 0),
(2, 'Tiết 2', 2, 8, 0, 8, 50, 0),
(3, 'Tiết 3', 3, 9, 0, 9, 50, 0),
(4, 'Tiết 4', 4, 10, 0, 10, 50, 0),
(5, 'Tiết 5', 5, 11, 0, 11, 50, 0),
(6, 'Tiết 6', 6, 12, 0, 12, 50, 1),
(7, 'Tiết 7', 7, 13, 0, 13, 50, 0),
(8, 'Tiết 8', 8, 14, 0, 14, 50, 0),
(9, 'Tiết 9', 9, 15, 0, 15, 50, 0),
(10, 'Tiết 10', 10, 16, 0, 16, 50, 0),
(11, 'Tiết 11', 11, 17, 0, 17, 50, 0),
(12, 'Tiết 12', 12, 18, 0, 18, 50, 0),
(13, 'Tiết 13', 13, 19, 0, 19, 50, 0),
(14, 'Tiết 14', 14, 20, 0, 20, 50, 0);

-- --------------------------------------------------------

--
-- Table structure for table `trainingtypes`
--

CREATE TABLE `trainingtypes` (
  `id` int(11) NOT NULL,
  `code` varchar(50) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `trainingtypes`
--

INSERT INTO `trainingtypes` (`id`, `code`, `name`, `description`) VALUES
(1, 'CQ', 'Chính quy', 'Đào tạo chính quy tập trung'),
(2, 'VB2', 'Văn bằng 2', 'Đào tạo văn bằng 2'),
(3, 'TX', 'Từ xa', 'Đào tạo từ xa');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `password`, `role`) VALUES
(1, 'admin', '$2b$10$UeuaTxM8s3BvisLYv1FrPOvTgLWq9agcyCw3wx9BoSRfVQbM74mv2', 'admin'),
(4, 'b21dccn001@student.example.edu.vn', '$2b$10$.UTu/1KReX2/sCoAcQE/KeHO4jWmI7XsyT.rZvQCw1uQyoALYsGf2', 'student'),
(5, 'b21dccn002@student.example.edu.vn', '$2b$10$.UTu/1KReX2/sCoAcQE/KeHO4jWmI7XsyT.rZvQCw1uQyoALYsGf2', 'student'),
(6, 'b21dcat001@student.example.edu.vn', '$2b$10$.UTu/1KReX2/sCoAcQE/KeHO4jWmI7XsyT.rZvQCw1uQyoALYsGf2', 'student'),
(7, 'gv001@teacher.example.edu.vn', '$2b$10$.UTu/1KReX2/sCoAcQE/KeHO4jWmI7XsyT.rZvQCw1uQyoALYsGf2', 'teacher'),
(8, 'gv002@teacher.example.edu.vn', '$2b$10$.UTu/1KReX2/sCoAcQE/KeHO4jWmI7XsyT.rZvQCw1uQyoALYsGf2', 'teacher'),
(9, 'gv003@teacher.example.edu.vn', '$2b$10$.UTu/1KReX2/sCoAcQE/KeHO4jWmI7XsyT.rZvQCw1uQyoALYsGf2', 'teacher');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `academicyears`
--
ALTER TABLE `academicyears`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `year_code` (`year_code`);

--
-- Indexes for table `activitivelog`
--
ALTER TABLE `activitivelog`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `buildings`
--
ALTER TABLE `buildings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`),
  ADD KEY `campus_id` (`campus_id`),
  ADD KEY `buildings_campus_id` (`campus_id`);

--
-- Indexes for table `campus`
--
ALTER TABLE `campus`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`);

--
-- Indexes for table `classes`
--
ALTER TABLE `classes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `training_type_id` (`training_type_id`),
  ADD KEY `faculty_id` (`faculty_id`),
  ADD KEY `classes_training_type_id` (`training_type_id`),
  ADD KEY `classes_faculty_id` (`faculty_id`);

--
-- Indexes for table `constraints`
--
ALTER TABLE `constraints`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`);

--
-- Indexes for table `courseclasses`
--
ALTER TABLE `courseclasses`
  ADD PRIMARY KEY (`id`),
  ADD KEY `subject_id` (`subject_id`),
  ADD KEY `class_id` (`class_id`),
  ADD KEY `semester_id` (`semester_id`),
  ADD KEY `teacher_id` (`teacher_id`),
  ADD KEY `courseclasses_subject_id` (`subject_id`),
  ADD KEY `courseclasses_class_id` (`class_id`),
  ADD KEY `courseclasses_semester_id` (`semester_id`),
  ADD KEY `courseclasses_teacher_id` (`teacher_id`);

--
-- Indexes for table `days`
--
ALTER TABLE `days`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `equipments`
--
ALTER TABLE `equipments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`);

--
-- Indexes for table `faculty`
--
ALTER TABLE `faculty`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `faculty_id` (`faculty_id`),
  ADD KEY `faculty_faculty_id` (`faculty_id`);

--
-- Indexes for table `holidayactual`
--
ALTER TABLE `holidayactual`
  ADD PRIMARY KEY (`id`),
  ADD KEY `semester_id` (`semester_id`),
  ADD KEY `rule_id` (`rule_id`),
  ADD KEY `holidayactual_rule_id` (`rule_id`),
  ADD KEY `holidayactual_semester_id` (`semester_id`);

--
-- Indexes for table `holidayrule`
--
ALTER TABLE `holidayrule`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `instructorsunavailabletime`
--
ALTER TABLE `instructorsunavailabletime`
  ADD PRIMARY KEY (`day_id`,`teacher_id`,`time_slot_id`),
  ADD KEY `teacher_id` (`teacher_id`),
  ADD KEY `time_slot_id` (`time_slot_id`);

--
-- Indexes for table `rooms`
--
ALTER TABLE `rooms`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`),
  ADD KEY `buildings_id` (`buildings_id`),
  ADD KEY `rooms_buildings_id` (`buildings_id`);

--
-- Indexes for table `roomsequipments`
--
ALTER TABLE `roomsequipments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `equipment_id` (`equipment_id`),
  ADD KEY `room_id` (`room_id`),
  ADD KEY `roomsequipments_equipment_id` (`equipment_id`),
  ADD KEY `roomsequipments_room_id` (`room_id`);

--
-- Indexes for table `schedules`
--
ALTER TABLE `schedules`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `schedules_generation_id_course_class_id_day_id_time_slot_id` (`generation_id`,`course_class_id`,`day_id`,`time_slot_id`),
  ADD KEY `course_class_id` (`course_class_id`),
  ADD KEY `teacher_id` (`teacher_id`),
  ADD KEY `room_id` (`room_id`),
  ADD KEY `day_id` (`day_id`),
  ADD KEY `time_slot_id` (`time_slot_id`),
  ADD KEY `generation_id` (`generation_id`);

--
-- Indexes for table `schedule_generations`
--
ALTER TABLE `schedule_generations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `semester_id` (`semester_id`);

--
-- Indexes for table `schedule_instances`
--
ALTER TABLE `schedule_instances`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `schedule_instances_schedule_id_date` (`schedule_id`,`date`),
  ADD KEY `schedule_id` (`schedule_id`),
  ADD KEY `time_slot_id` (`time_slot_id`),
  ADD KEY `room_id` (`room_id`),
  ADD KEY `teacher_id` (`teacher_id`),
  ADD KEY `replaced_by_instance_id` (`replaced_by_instance_id`);

--
-- Indexes for table `semesters`
--
ALTER TABLE `semesters`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`),
  ADD KEY `AcademicYearsid` (`AcademicYearsid`),
  ADD KEY `semesters__academic_yearsid` (`AcademicYearsid`);

--
-- Indexes for table `softcontraist`
--
ALTER TABLE `softcontraist`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `students`
--
ALTER TABLE `students`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `student_identifier` (`student_identifier`),
  ADD UNIQUE KEY `students_user_id` (`user_id`),
  ADD UNIQUE KEY `students_email_school` (`email_school`),
  ADD KEY `class_id` (`class_id`),
  ADD KEY `students_class_id` (`class_id`);

--
-- Indexes for table `subjectrequiresequipment`
--
ALTER TABLE `subjectrequiresequipment`
  ADD PRIMARY KEY (`id`),
  ADD KEY `subject_id` (`subject_id`),
  ADD KEY `equipment_id` (`equipment_id`),
  ADD KEY `subjectrequiresequipment_subject_id` (`subject_id`),
  ADD KEY `subjectrequiresequipment_equipment_id` (`equipment_id`);

--
-- Indexes for table `subjects`
--
ALTER TABLE `subjects`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`),
  ADD KEY `training_type_id` (`training_type_id`),
  ADD KEY `subjects_training_type_id` (`training_type_id`);

--
-- Indexes for table `systemconfigs`
--
ALTER TABLE `systemconfigs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `teachers`
--
ALTER TABLE `teachers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `teacher_identifier` (`teacher_identifier`),
  ADD UNIQUE KEY `teachers_user_id` (`user_id`),
  ADD UNIQUE KEY `teachers_email_school` (`email_school`),
  ADD KEY `faculty_id` (`faculty_id`),
  ADD KEY `teachers_faculty_id` (`faculty_id`);

--
-- Indexes for table `teachings`
--
ALTER TABLE `teachings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `course_class_id` (`course_class_id`),
  ADD KEY `teacher_id` (`teacher_id`),
  ADD KEY `teachings_course_class_id` (`course_class_id`),
  ADD KEY `teachings_teacher_id` (`teacher_id`);

--
-- Indexes for table `timeslots`
--
ALTER TABLE `timeslots`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `trainingtypes`
--
ALTER TABLE `trainingtypes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `academicyears`
--
ALTER TABLE `academicyears`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `activitivelog`
--
ALTER TABLE `activitivelog`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `buildings`
--
ALTER TABLE `buildings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `campus`
--
ALTER TABLE `campus`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `classes`
--
ALTER TABLE `classes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `constraints`
--
ALTER TABLE `constraints`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `courseclasses`
--
ALTER TABLE `courseclasses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `days`
--
ALTER TABLE `days`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `equipments`
--
ALTER TABLE `equipments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `faculty`
--
ALTER TABLE `faculty`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `holidayactual`
--
ALTER TABLE `holidayactual`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `holidayrule`
--
ALTER TABLE `holidayrule`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `rooms`
--
ALTER TABLE `rooms`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=89;

--
-- AUTO_INCREMENT for table `roomsequipments`
--
ALTER TABLE `roomsequipments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `schedules`
--
ALTER TABLE `schedules`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `schedule_generations`
--
ALTER TABLE `schedule_generations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `schedule_instances`
--
ALTER TABLE `schedule_instances`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=140;

--
-- AUTO_INCREMENT for table `semesters`
--
ALTER TABLE `semesters`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `softcontraist`
--
ALTER TABLE `softcontraist`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `students`
--
ALTER TABLE `students`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `subjectrequiresequipment`
--
ALTER TABLE `subjectrequiresequipment`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `subjects`
--
ALTER TABLE `subjects`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `systemconfigs`
--
ALTER TABLE `systemconfigs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `teachers`
--
ALTER TABLE `teachers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `teachings`
--
ALTER TABLE `teachings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `timeslots`
--
ALTER TABLE `timeslots`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `trainingtypes`
--
ALTER TABLE `trainingtypes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- Constraints for dumped tables
--

-- Indexes to speed up schedule conflict checks (date + room/teacher + status)
CREATE INDEX `idx_si_date_room_status` ON `schedule_instances` (`date`, `room_id`, `status`);
CREATE INDEX `idx_si_date_teacher_status` ON `schedule_instances` (`date`, `teacher_id`, `status`);

--
-- Constraints for table `buildings`
--
ALTER TABLE `buildings`
  ADD CONSTRAINT `buildings_ibfk_1` FOREIGN KEY (`campus_id`) REFERENCES `campus` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `classes`
--
ALTER TABLE `classes`
  ADD CONSTRAINT `classes_ibfk_1` FOREIGN KEY (`training_type_id`) REFERENCES `trainingtypes` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `classes_ibfk_2` FOREIGN KEY (`faculty_id`) REFERENCES `faculty` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `courseclasses`
--
ALTER TABLE `courseclasses`
  ADD CONSTRAINT `courseclasses_ibfk_1` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `courseclasses_ibfk_2` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `courseclasses_ibfk_3` FOREIGN KEY (`semester_id`) REFERENCES `semesters` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `courseclasses_ibfk_4` FOREIGN KEY (`teacher_id`) REFERENCES `teachers` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `holidayactual`
--
ALTER TABLE `holidayactual`
  ADD CONSTRAINT `holidayactual_ibfk_1` FOREIGN KEY (`rule_id`) REFERENCES `holidayrule` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `holidayactual_ibfk_2` FOREIGN KEY (`semester_id`) REFERENCES `semesters` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `instructorsunavailabletime`
--
ALTER TABLE `instructorsunavailabletime`
  ADD CONSTRAINT `instructorsunavailabletime_ibfk_1` FOREIGN KEY (`day_id`) REFERENCES `days` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `instructorsunavailabletime_ibfk_2` FOREIGN KEY (`teacher_id`) REFERENCES `teachers` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `instructorsunavailabletime_ibfk_3` FOREIGN KEY (`time_slot_id`) REFERENCES `timeslots` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `rooms`
--
ALTER TABLE `rooms`
  ADD CONSTRAINT `rooms_ibfk_1` FOREIGN KEY (`buildings_id`) REFERENCES `buildings` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `roomsequipments`
--
ALTER TABLE `roomsequipments`
  ADD CONSTRAINT `roomsequipments_ibfk_1` FOREIGN KEY (`equipment_id`) REFERENCES `equipments` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `roomsequipments_ibfk_2` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `schedules`
--
ALTER TABLE `schedules`
  ADD CONSTRAINT `schedules_ibfk_1` FOREIGN KEY (`course_class_id`) REFERENCES `courseclasses` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `schedules_ibfk_2` FOREIGN KEY (`day_id`) REFERENCES `days` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `schedules_ibfk_3` FOREIGN KEY (`time_slot_id`) REFERENCES `timeslots` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `schedules_ibfk_4` FOREIGN KEY (`generation_id`) REFERENCES `schedule_generations` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `schedules_ibfk_5` FOREIGN KEY (`teacher_id`) REFERENCES `teachers` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `schedules_ibfk_6` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `schedule_generations`
--
ALTER TABLE `schedule_generations`
  ADD CONSTRAINT `schedule_generations_ibfk_1` FOREIGN KEY (`semester_id`) REFERENCES `semesters` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `schedule_instances`
--
ALTER TABLE `schedule_instances`
  ADD CONSTRAINT `schedule_instances_ibfk_1` FOREIGN KEY (`schedule_id`) REFERENCES `schedules` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `schedule_instances_ibfk_2` FOREIGN KEY (`time_slot_id`) REFERENCES `timeslots` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `schedule_instances_ibfk_3` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `schedule_instances_ibfk_4` FOREIGN KEY (`teacher_id`) REFERENCES `teachers` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `schedule_instances_ibfk_5` FOREIGN KEY (`replaced_by_instance_id`) REFERENCES `schedule_instances` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `semesters`
--
ALTER TABLE `semesters`
  ADD CONSTRAINT `semesters_ibfk_1` FOREIGN KEY (`AcademicYearsid`) REFERENCES `academicyears` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `students`
--
ALTER TABLE `students`
  ADD CONSTRAINT `students_ibfk_1` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `students_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `subjectrequiresequipment`
--
ALTER TABLE `subjectrequiresequipment`
  ADD CONSTRAINT `subjectrequiresequipment_ibfk_1` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `subjectrequiresequipment_ibfk_2` FOREIGN KEY (`equipment_id`) REFERENCES `equipments` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `subjects`
--
ALTER TABLE `subjects`
  ADD CONSTRAINT `subjects_ibfk_1` FOREIGN KEY (`training_type_id`) REFERENCES `trainingtypes` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `teachers`
--
ALTER TABLE `teachers`
  ADD CONSTRAINT `teachers_ibfk_1` FOREIGN KEY (`faculty_id`) REFERENCES `faculty` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `teachers_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `teachings`
--
ALTER TABLE `teachings`
  ADD CONSTRAINT `teachings_ibfk_1` FOREIGN KEY (`course_class_id`) REFERENCES `courseclasses` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `teachings_ibfk_2` FOREIGN KEY (`teacher_id`) REFERENCES `teachers` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
