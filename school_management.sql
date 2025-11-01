-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Oct 12, 2025 at 07:19 PM
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
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `year_code` varchar(50) NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `status` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `year_code` (`year_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Table structure for table `activitivelog`
--
CREATE TABLE `activitivelog` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `account_id` varchar(100) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Table structure for table `buildings`
--
CREATE TABLE `buildings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `campus_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `floor_count` int(11) DEFAULT NULL,
  `code` varchar(50) NOT NULL,
  `location` varchar(255) DEFAULT NULL,
  `status` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  KEY `campus_id` (`campus_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table structure for table `campus`
--

CREATE TABLE `campus` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `code` varchar(50) NOT NULL,
  `status` varchar(50) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table structure for table `days`
--

CREATE TABLE `days` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table structure for table `equipments`
--

CREATE TABLE `equipments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `code` varchar(50) NOT NULL,
  `name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table structure for table `faculty`
--

CREATE TABLE `faculty` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `faculty_id` varchar(50) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `faculty_id` (`faculty_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table structure for table `holidayactual`
--


-- --------------------------------------------------------

--
-- Table structure for table `holidayrule`
--

CREATE TABLE `holidayrule` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `day_start` varchar(5) DEFAULT NULL,
  `day_end` varchar(5) DEFAULT NULL,
  `is_lunar` tinyint(1) DEFAULT 0,
  `recurring` tinyint(1) DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table structure for table `softcontraist`
--

CREATE TABLE `softcontraist` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table structure for table `systemconfigs`
--

CREATE TABLE `systemconfigs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `value` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table structure for table `timeslots`
--

CREATE TABLE `timeslots` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `idx` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table structure for table `trainingtypes`
--

CREATE TABLE `trainingtypes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `code` varchar(50) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table structure for table `semesters`
--

CREATE TABLE `semesters` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `AcademicYearsid` int(11) NOT NULL,
  `code` varchar(50) NOT NULL,
  `name` varchar(255) NOT NULL,
  `start` date NOT NULL,
  `end` date NOT NULL,
  `status` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  KEY `AcademicYearsid` (`AcademicYearsid`),
  CONSTRAINT `semesters_ibfk_1` FOREIGN KEY (`AcademicYearsid`) REFERENCES `academicyears` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table structure for table `rooms`
--

CREATE TABLE `rooms` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
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
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  KEY `buildings_id` (`buildings_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table structure for table `instructorsunavailabletime`
--

CREATE TABLE `instructorsunavailabletime` (
  `day_id` int(11) NOT NULL,
  `teacher_id` int(11) NOT NULL,
  `time_slot_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table structure for table `roomsequipments`
--

CREATE TABLE `roomsequipments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `equipment_id` int(11) NOT NULL,
  `room_id` int(11) NOT NULL,
  `equipment_quantity` int(11) DEFAULT 0,
  `status` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `equipment_id` (`equipment_id`),
  KEY `room_id` (`room_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table structure for table `teachers`
--

CREATE TABLE `teachers` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `teacher_identifier` varchar(50) NOT NULL,
  `faculty_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `teacher_identifier` (`teacher_identifier`),
  KEY `faculty_id` (`faculty_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table structure for table `classes`
--

CREATE TABLE `classes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `training_type_id` int(11) NOT NULL,
  `faculty_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `training_type_id` (`training_type_id`),
  KEY `faculty_id` (`faculty_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table structure for table `subjects`
--

CREATE TABLE `subjects` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `training_type_id` int(11) NOT NULL,
  `code` varchar(50) NOT NULL,
  `theory_hours` int(11) DEFAULT 0,
  `self_study_hours` int(11) DEFAULT 0,
  `practice_hours` int(11) DEFAULT 0,
  `requires_lab` tinyint(1) DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  KEY `training_type_id` (`training_type_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table structure for table `holidayactual`
--

CREATE TABLE `holidayactual` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `semester_id` int(11) NOT NULL,
  `rule_id` int(11) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `semester_id` (`semester_id`),
  KEY `rule_id` (`rule_id`),
  CONSTRAINT `holidayactual_ibfk_1` FOREIGN KEY (`rule_id`) REFERENCES `holidayrule` (`id`) ON DELETE SET NULL,
  CONSTRAINT `holidayactual_ibfk_2` FOREIGN KEY (`semester_id`) REFERENCES `semesters` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table structure for table `students`
--

CREATE TABLE `students` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `class_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `student_identifier` varchar(50) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `student_identifier` (`student_identifier`),
  KEY `class_id` (`class_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table structure for table `courseclasses`
--

CREATE TABLE `courseclasses` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `subject_id` int(11) NOT NULL,
  `class_id` int(11) NOT NULL,
  `semester_id` int(11) NOT NULL,
  `teacher_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `subject_id` (`subject_id`),
  KEY `class_id` (`class_id`),
  KEY `semester_id` (`semester_id`),
  KEY `teacher_id` (`teacher_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table structure for table `subjectrequiresequipment`
--

CREATE TABLE `subjectrequiresequipment` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `subject_id` int(11) NOT NULL,
  `equipment_id` int(11) NOT NULL,
  `require_quantity_per_person` int(11) DEFAULT 1,
  PRIMARY KEY (`id`),
  KEY `subject_id` (`subject_id`),
  KEY `equipment_id` (`equipment_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table structure for table `schedules`
--

CREATE TABLE `schedules` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `course_class_id` int(11) NOT NULL,
  `day_id` int(11) NOT NULL,
  `time_slot_id` int(11) DEFAULT NULL,
  `scheduler` varchar(255) DEFAULT NULL,
  `num_of_period` int(11) DEFAULT 1,
  PRIMARY KEY (`id`),
  KEY `course_class_id` (`course_class_id`),
  KEY `day_id` (`day_id`),
  KEY `time_slot_id` (`time_slot_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table structure for table `teachings`
--

CREATE TABLE `teachings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `course_class_id` int(11) NOT NULL,
  `teacher_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `course_class_id` (`course_class_id`),
  KEY `teacher_id` (`teacher_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;



--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `password`, `role`) VALUES
(1, 'admin', '$2b$10$UeuaTxM8s3BvisLYv1FrPOvTgLWq9agcyCw3wx9BoSRfVQbM74mv2', 'admin'),
(2, 'student', '$2b$10$94GkiGkFFjME/I0jHt.BjOF6KhxB.TBHEiTlieFQXEmTrF2WbloTG', 'student'),
(3, 'teacher', '$2b$10$.UTu/1KReX2/sCoAcQE/KeHO4jWmI7XsyT.rZvQCw1uQyoALYsGf2', 'teacher');

-- Sample data for table `campus`
INSERT INTO `campus` (`id`, `name`, `code`, `status`, `address`, `location`) VALUES
  (1, 'Trụ sở chính', 'TSCH', 'active', '11 Nguyễn Đình Chiểu, phường Sài Gòn, TP. Hồ Chí Minh', 'TP. Hồ Chí Minh'),
  (2, 'Cơ sở đào tạo', 'CSDT', 'active', '97 Man Thiện, phường Tăng Nhơn Phú, TP. Hồ Chí Minh', 'TP. Hồ Chí Minh');

-- Sample data for table `buildings` (4 buildings A-D per campus)
INSERT INTO `buildings` (`id`, `campus_id`, `name`, `floor_count`, `code`, `location`, `status`) VALUES
  (1, 1, 'Tòa A1', 4, 'TSCH-A', '11 Nguyễn Đình Chiểu, phường Sài Gòn, TP. Hồ Chí Minh', 'active'),
  (2, 1, 'Tòa B1', 4, 'TSCH-B', '11 Nguyễn Đình Chiểu, phường Sài Gòn, TP. Hồ Chí Minh', 'active'),
  (3, 1, 'Tòa C1', 3, 'TSCH-C', '11 Nguyễn Đình Chiểu, phường Sài Gòn, TP. Hồ Chí Minh', 'active'),
  (4, 1, 'Tòa D1', 2, 'TSCH-D', '11 Nguyễn Đình Chiểu, phường Sài Gòn, TP. Hồ Chí Minh', 'active'),
  (5, 1, 'Sân E1', 2, 'TSCH-E', '11 Nguyễn Đình Chiểu, phường Sài Gòn, TP. Hồ Chí Minh', 'active'),
  (5, 2, 'Tòa A2', 4, 'CSDT-A', '97 Man Thiện, phường Tăng Nhơn Phú, TP. Hồ Chí Minh', 'active'),
  (6, 2, 'Tòa B2', 4, 'CSDT-B', '97 Man Thiện, phường Tăng Nhơn Phú, TP. Hồ Chí Minh', 'active'),
  (7, 2, 'Tòa C2', 3, 'CSDT-C', '97 Man Thiện, phường Tăng Nhơn Phú, TP. Hồ Chí Minh', 'active'),
  (8, 2, 'Tòa D2', 2, 'CSDT-D', '97 Man Thiện, phường Tăng Nhơn Phú, TP. Hồ Chí Minh', 'active'),
  (9, 2, 'Sân E2', 2, 'CSDT-E', '11 Nguyễn Đình Chiểu, phường Sài Gòn, TP. Hồ Chí Minh', 'active');

-- Sample data for table `equipments`
INSERT INTO `equipments` (`id`, `code`, `name`) VALUES
  (1, 'EQ001', 'Máy chiếu'),
  (2, 'EQ002', 'TV'),
  (3, 'EQ003', 'Loa'),
  (4, 'EQ004', 'Micro'),
  (5, 'EQ005', 'Bảng thông minh'),
  (6, 'EQ006', 'Máy tính'),
  (7, 'EQ007', 'Bộ đồ điện'),
  (8, 'EQ008', 'Đồng hồ vạn năng'),
  (9, 'EQ009', 'Bộ thực hành điện'),
  (10, 'EQ010', 'Nguồn DC'),
  (11, 'EQ011', 'Biến áp thực hành'),
  (12, 'EQ012', 'Đèn');

-- Sample data for academic years (3 recent years)
INSERT INTO `academicyears` (`id`, `year_code`, `start_date`, `end_date`, `status`) VALUES
  (1, '2025-2026', '2025-09-01', '2026-06-30', 'upcoming'),
  (2, '2024-2025', '2024-09-01', '2025-06-30', 'finished'),
  (3, '2023-2024', '2023-09-01', '2024-06-30', 'finished');

-- Sample data for semesters (HK1 and HK2 for each academic year)
INSERT INTO `semesters` (`id`, `AcademicYearsid`, `code`, `name`, `start`, `end`, `status`) VALUES
  (1, 1, 'HK1 2025-2026', 'Học kỳ 1 2025-2026', '2025-09-01', '2026-01-15', 'upcoming'),
  (2, 1, 'HK2 2025-2026', 'Học kỳ 2 2025-2026', '2026-02-01', '2026-06-30', 'upcoming'),
  (3, 2, 'HK1 2024-2025', 'Học kỳ 1 2024-2025', '2024-09-01', '2025-01-15', 'finished'),
  (4, 2, 'HK2 2024-2025', 'Học kỳ 2 2024-2025', '2025-02-01', '2025-06-30', 'finished'),
  (5, 3, 'HK1 2023-2024', 'Học kỳ 1 2023-2024', '2023-09-01', '2024-01-15', 'finished'),
  (6, 3, 'HK2 2023-2024', 'Học kỳ 2 2023-2024', '2024-02-01', '2024-06-30', 'finished');

-- Sample holiday rules (recurring holidays within a year)
-- Format: day_start/day_end dạng 'dd-mm' (VD: '01-01' = ngày 1 tháng 1)
-- is_lunar: 0 = dương lịch, 1 = âm lịch
INSERT INTO `holidayrule` (`id`, `name`, `description`, `day_start`, `day_end`, `is_lunar`, `recurring`) VALUES
  (1, 'Tết Dương lịch', 'Nghỉ Tết Dương lịch', '01-01', '01-01', 0, 1),
  (2, 'Tết Nguyên Đán', 'Nghỉ Tết Nguyên đán (Mùng 1 - Mùng 5 tháng Giêng âm lịch)', '01-01', '05-01', 1, 1),
  (3, 'Giỗ Tổ Hùng Vương', 'Giỗ Tổ Hùng Vương (10/3 âm lịch)', '10-03', '10-03', 1, 1),
  (4, 'Ngày Giải phóng miền Nam', 'Ngày giải phóng miền Nam 30/4', '30-04', '30-04', 0, 1),
  (5, 'Quốc tế Lao động', 'Ngày Quốc tế Lao động 1/5', '01-05', '01-05', 0, 1),
  (6, 'Quốc khánh Việt Nam', 'Ngày Quốc khánh 2/9 (nghỉ 2 ngày)', '02-09', '03-09', 0, 1);

-- Dữ liệu mẫu cho bảng faculty (các ngành CNTT)
INSERT INTO `faculty` (`faculty_id`, `name`) VALUES
  ('CNTT', 'Công nghệ thông tin'),
  ('HTTT', 'Hệ thống thông tin'),
  ('KHMT', 'Khoa học máy tính'),
  ('KTMT', 'Kỹ thuật máy tính'),
  ('TMDT', 'Thương mại điện tử');

-- Dữ liệu mẫu cho bảng subjects
INSERT INTO `subjects` (`name`, `training_type_id`, `code`, `theory_hours`, `self_study_hours`, `practice_hours`, `requires_lab`) VALUES
  ('Lập trình Cơ bản', 1, 'MH001', 30, 15, 15, false),
  ('Cơ sở dữ liệu', 1, 'MH002', 30, 15, 15, true),
  ('Trí tuệ nhân tạo', 1, 'MH003', 45, 20, 20, true);

-- Dữ liệu mẫu cho bảng trainingtypes
INSERT INTO `trainingtypes` (`code`, `name`, `description`) VALUES
  ('CQ', 'Chính quy', 'Đào tạo chính quy tập trung'),
  ('VB2', 'Văn bằng 2', 'Đào tạo văn bằng 2'),
  ('TX', 'Từ xa', 'Đào tạo từ xa');

-- Dữ liệu mẫu cho bảng classes
INSERT INTO `classes` (`name`, `training_type_id`, `faculty_id`) VALUES
  ('D21CQCN01-N', 1, 1),
  ('D21CQHT01-N', 1, 2);

-- Dữ liệu mẫu cho bảng teachers
INSERT INTO `teachers` (`id`, `name`, `teacher_identifier`, `faculty_id`) VALUES
  (1, 'Nguyễn Văn A', 'GV001', 1),
  (2, 'Trần Thị B', 'GV002', 2),
  (3, 'Lê Văn C', 'GV003', 3);

-- Dữ liệu mẫu cho bảng students
INSERT INTO `students` (`class_id`, `name`, `student_identifier`) VALUES
  (1, 'Nguyễn Văn An', 'B21DCCN001'),
  (1, 'Trần Thị Bình', 'B21DCCN002'),
  (2, 'Lê Văn Cường', 'B21DCAT001');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `academicyears`
--
-- Đã chuyển PRIMARY KEY và UNIQUE KEY vào CREATE TABLE `academicyears`

--
-- Indexes for table `activitivelog`
--
-- Đã chuyển PRIMARY KEY vào CREATE TABLE `activitivelog`

--
-- Indexes for table `buildings`
--
-- Đã chuyển PRIMARY KEY, UNIQUE KEY và KEY vào CREATE TABLE `buildings`

--
-- Indexes for table `campus`
--
-- Đã chuyển PRIMARY KEY và UNIQUE KEY vào CREATE TABLE `campus`

--
-- Indexes for table `classes`
--
-- Đã chuyển PRIMARY KEY và KEY vào CREATE TABLE `classes`

--
-- Indexes for table `courseclasses`
--
-- Đã chuyển PRIMARY KEY và KEY vào CREATE TABLE `courseclasses`

--
-- Indexes for table `days`
--
-- Đã chuyển PRIMARY KEY vào CREATE TABLE `days`

--
-- Indexes for table `equipments`
--
-- Đã chuyển PRIMARY KEY và UNIQUE KEY vào CREATE TABLE `equipments`

--
-- Indexes for table `faculty`
--
-- Đã chuyển PRIMARY KEY và UNIQUE KEY vào CREATE TABLE `faculty`

--
-- Indexes for table `holidayactual`
--
-- Đã chuyển PRIMARY KEY và KEY vào CREATE TABLE `holidayactual`

--
-- Indexes for table `holidayrule`
--
--
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
-- Đã chuyển PRIMARY KEY, UNIQUE KEY và KEY vào CREATE TABLE `rooms`

--
-- Indexes for table `roomsequipments`
--
-- Đã chuyển PRIMARY KEY và KEY vào CREATE TABLE `roomsequipments`

--
-- Indexes for table `schedules`
--
-- Đã chuyển PRIMARY KEY và KEY vào CREATE TABLE `schedules`

--
-- Indexes for table `semesters`
--
-- Đã chuyển PRIMARY KEY, UNIQUE KEY và KEY vào CREATE TABLE `semesters`

--
-- Indexes for table `softcontraist`
--
-- Đã chuyển PRIMARY KEY vào CREATE TABLE `softcontraist`

--
-- Indexes for table `students`
--
-- Đã chuyển PRIMARY KEY, UNIQUE KEY và KEY vào CREATE TABLE `students`

--
-- Indexes for table `subjectrequiresequipment`
--
-- Đã chuyển PRIMARY KEY và KEY vào CREATE TABLE `subjectrequiresequipment`

--
-- Indexes for table `subjects`
--
-- Đã chuyển PRIMARY KEY, UNIQUE KEY và KEY vào CREATE TABLE `subjects`

--
-- Indexes for table `systemconfigs`
--
-- Đã chuyển PRIMARY KEY và UNIQUE KEY vào CREATE TABLE `systemconfigs`

--
-- Indexes for table `teachers`
--
-- Đã chuyển PRIMARY KEY, UNIQUE KEY và KEY vào CREATE TABLE `teachers`

--
-- Indexes for table `teachings`
--
-- Đã chuyển PRIMARY KEY và KEY vào CREATE TABLE `teachings`

--
-- Indexes for table `timeslots`
--
-- Đã chuyển PRIMARY KEY vào CREATE TABLE `timeslots`

--
-- Indexes for table `trainingtypes`
--
-- Đã chuyển PRIMARY KEY và UNIQUE KEY vào CREATE TABLE `trainingtypes`

--
-- Indexes for table `users`
--
-- Đã chuyển PRIMARY KEY và UNIQUE KEY vào CREATE TABLE `users`

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `academicyears`
--
ALTER TABLE `academicyears`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `activitivelog`
--
ALTER TABLE `activitivelog`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
  
--
-- AUTO_INCREMENT for table `buildings`
--
ALTER TABLE `buildings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `campus`
--
ALTER TABLE `campus`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `classes`
--
ALTER TABLE `classes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `courseclasses`
--
ALTER TABLE `courseclasses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `days`
--
ALTER TABLE `days`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `equipments`
--
ALTER TABLE `equipments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `faculty`
--
ALTER TABLE `faculty`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `holidayactual`
--
ALTER TABLE `holidayactual`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `holidayrule`
--
ALTER TABLE `holidayrule`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `rooms`
--
ALTER TABLE `rooms`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `roomsequipments`
--
ALTER TABLE `roomsequipments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `schedules`
--
ALTER TABLE `schedules`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `semesters`
--
ALTER TABLE `semesters`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `softcontraist`
--
ALTER TABLE `softcontraist`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `students`
--
ALTER TABLE `students`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `subjectrequiresequipment`
--
ALTER TABLE `subjectrequiresequipment`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `subjects`
--
ALTER TABLE `subjects`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `systemconfigs`
--
ALTER TABLE `systemconfigs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `teachers`
--
ALTER TABLE `teachers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `teachings`
--
ALTER TABLE `teachings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `timeslots`
--
ALTER TABLE `timeslots`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `trainingtypes`
--
ALTER TABLE `trainingtypes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Constraints for dumped tables
--

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
-- Đã chuyển CONSTRAINT vào CREATE TABLE `holidayactual`

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
  ADD CONSTRAINT `schedules_ibfk_3` FOREIGN KEY (`time_slot_id`) REFERENCES `timeslots` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `semesters`
--
-- Đã chuyển CONSTRAINT vào CREATE TABLE `semesters`

--
-- Constraints for table `students`
--
ALTER TABLE `students`
  ADD CONSTRAINT `students_ibfk_1` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE CASCADE;

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
  ADD CONSTRAINT `teachers_ibfk_1` FOREIGN KEY (`faculty_id`) REFERENCES `faculty` (`id`) ON DELETE CASCADE;

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