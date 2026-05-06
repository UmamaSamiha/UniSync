-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Apr 10, 2026 at 12:16 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `unisync`
--

-- --------------------------------------------------------

--
-- Table structure for table `document_feedback`
--

CREATE TABLE `document_feedback` (
  `id` int(11) NOT NULL,
  `document_id` int(11) NOT NULL,
  `faculty_id` int(11) NOT NULL,
  `comment` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `document_feedback`
--

INSERT INTO `document_feedback` (`id`, `document_id`, `faculty_id`, `comment`, `created_at`) VALUES
(1, 1, 1, 'Good introduction. Please expand the methodology section and add more references.', '2026-04-09 20:25:55');

-- --------------------------------------------------------

--
-- Table structure for table `faculty`
--

CREATE TABLE `faculty` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `department` varchar(100) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `faculty`
--

INSERT INTO `faculty` (`id`, `name`, `email`, `department`, `created_at`) VALUES
(1, 'Dr. Rahman', 'rahman@unisync.edu', 'Computer Science', '2026-04-09 20:15:07'),
(2, 'Dr. Akter', 'akter@unisync.edu', 'Software Engineering', '2026-04-09 20:15:07'),
(3, 'Prof. Islam', 'islam@unisync.edu', 'Information Systems', '2026-04-09 20:15:07');

-- --------------------------------------------------------

--
-- Table structure for table `students`
--

CREATE TABLE `students` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `student_id` varchar(20) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `students`
--

INSERT INTO `students` (`id`, `name`, `email`, `student_id`, `created_at`) VALUES
(1, 'Neha', 'neha@student.edu', 'STU-001', '2026-04-09 20:24:56'),
(2, 'Priti', 'priti@student.edu', 'STU-002', '2026-04-09 20:24:56'),
(3, 'Jennie', 'jeni@student.edu', 'STU-003', '2026-04-09 20:24:56');

-- --------------------------------------------------------

--
-- Table structure for table `study_groups`
--

CREATE TABLE `study_groups` (
  `id` int(11) NOT NULL,
  `name` varchar(150) NOT NULL,
  `subject` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `created_by` varchar(100) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `study_groups`
--

INSERT INTO `study_groups` (`id`, `name`, `subject`, `description`, `created_by`, `created_at`) VALUES
(1, 'Data Structures Squad', 'Computer Science', 'Covering trees, graphs, and sorting algorithms.', 'Neha', '2026-04-09 20:25:11'),
(2, 'Web Dev Warriors', 'Software Engineering', 'Full-stack projects and code reviews.', 'Priti', '2026-04-09 20:25:11');

-- --------------------------------------------------------

--
-- Table structure for table `thesis_documents`
--

CREATE TABLE `thesis_documents` (
  `id` int(11) NOT NULL,
  `proposal_id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `version_label` varchar(50) NOT NULL,
  `original_filename` varchar(255) NOT NULL,
  `stored_filename` varchar(255) NOT NULL,
  `file_path` varchar(500) NOT NULL,
  `file_size` int(11) DEFAULT NULL,
  `mime_type` varchar(100) DEFAULT NULL,
  `uploaded_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `thesis_documents`
--

INSERT INTO `thesis_documents` (`id`, `proposal_id`, `student_id`, `version_label`, `original_filename`, `stored_filename`, `file_path`, `file_size`, `mime_type`, `uploaded_at`) VALUES
(1, 1, 1, 'Draft 1', 'thesis_draft1.pdf', 'uuid-abc123.pdf', 'uploads/thesis/uuid-abc123.pdf', 204800, 'application/pdf', '2026-04-09 20:25:45');

-- --------------------------------------------------------

--
-- Table structure for table `thesis_proposals`
--

CREATE TABLE `thesis_proposals` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `subject_area` varchar(100) NOT NULL,
  `student_id` int(11) NOT NULL,
  `faculty_id` int(11) NOT NULL,
  `status` enum('pending','accepted','rejected') DEFAULT 'pending',
  `faculty_note` text DEFAULT NULL,
  `submitted_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `reviewed_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `thesis_proposals`
--

INSERT INTO `thesis_proposals` (`id`, `title`, `description`, `subject_area`, `student_id`, `faculty_id`, `status`, `faculty_note`, `submitted_at`, `reviewed_at`) VALUES
(1, 'AI-Based Traffic Management', 'Using ML to optimize city traffic flow in real time.', 'Machine Learning', 1, 1, 'accepted', NULL, '2026-04-09 20:25:36', NULL),
(2, 'Blockchain for Academic Records', 'Secure, tamper-proof storage of university credentials.', 'Cybersecurity', 2, 2, 'pending', NULL, '2026-04-09 20:25:36', NULL),
(3, 'AR Campus Navigation App', 'Augmented reality wayfinding system for new students.', 'Mobile Development', 3, 3, 'pending', NULL, '2026-04-09 20:25:36', NULL);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `document_feedback`
--
ALTER TABLE `document_feedback`
  ADD PRIMARY KEY (`id`),
  ADD KEY `document_id` (`document_id`),
  ADD KEY `faculty_id` (`faculty_id`);

--
-- Indexes for table `faculty`
--
ALTER TABLE `faculty`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `students`
--
ALTER TABLE `students`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `study_groups`
--
ALTER TABLE `study_groups`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `thesis_documents`
--
ALTER TABLE `thesis_documents`
  ADD PRIMARY KEY (`id`),
  ADD KEY `proposal_id` (`proposal_id`),
  ADD KEY `student_id` (`student_id`);

--
-- Indexes for table `thesis_proposals`
--
ALTER TABLE `thesis_proposals`
  ADD PRIMARY KEY (`id`),
  ADD KEY `student_id` (`student_id`),
  ADD KEY `faculty_id` (`faculty_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `document_feedback`
--
ALTER TABLE `document_feedback`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `faculty`
--
ALTER TABLE `faculty`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `students`
--
ALTER TABLE `students`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `study_groups`
--
ALTER TABLE `study_groups`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `thesis_documents`
--
ALTER TABLE `thesis_documents`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `thesis_proposals`
--
ALTER TABLE `thesis_proposals`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `document_feedback`
--
ALTER TABLE `document_feedback`
  ADD CONSTRAINT `document_feedback_ibfk_1` FOREIGN KEY (`document_id`) REFERENCES `thesis_documents` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `document_feedback_ibfk_2` FOREIGN KEY (`faculty_id`) REFERENCES `faculty` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `thesis_documents`
--
ALTER TABLE `thesis_documents`
  ADD CONSTRAINT `thesis_documents_ibfk_1` FOREIGN KEY (`proposal_id`) REFERENCES `thesis_proposals` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `thesis_documents_ibfk_2` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `thesis_proposals`
--
ALTER TABLE `thesis_proposals`
  ADD CONSTRAINT `thesis_proposals_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `thesis_proposals_ibfk_2` FOREIGN KEY (`faculty_id`) REFERENCES `faculty` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
