-- Run this once in phpMyAdmin or MySQL CLI before starting UniSync
-- mysql -u root unisync < setup.sql

CREATE DATABASE IF NOT EXISTS unisync;
USE unisync;

-- Users (login/signup)
CREATE TABLE IF NOT EXISTS users (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    name       VARCHAR(100)  NOT NULL,
    email      VARCHAR(255)  NOT NULL UNIQUE,
    password   VARCHAR(255)  NOT NULL,  -- MD5 hashed
    role       ENUM('student','tutor') DEFAULT 'student',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Add role column if the table already existed without it
ALTER TABLE users ADD COLUMN IF NOT EXISTS role ENUM('student','tutor') DEFAULT 'student';

-- Tutors list shown in TutorList
CREATE TABLE IF NOT EXISTS tutors (
    id      INT AUTO_INCREMENT PRIMARY KEY,
    name    VARCHAR(100) NOT NULL,
    email   VARCHAR(255),
    subject VARCHAR(255) NOT NULL,
    rating  DECIMAL(3,1) DEFAULT 4.5,
    bio     TEXT
);

-- Tutoring session requests
CREATE TABLE IF NOT EXISTS tutoring_requests (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    student_name  VARCHAR(100),
    student_email VARCHAR(255) NOT NULL,
    tutor_id      INT NOT NULL,
    course_code   VARCHAR(50)  NOT NULL,
    topic         VARCHAR(255) DEFAULT 'General Discussion',
    status        ENUM('pending','accepted','rejected') DEFAULT 'pending',
    created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tutor_id) REFERENCES tutors(id)
);

-- Seed: default showcase accounts (passwords are MD5)
-- Umama Samiha  -> password: 12345678 -> MD5: 25d55ad283aa400af464c76d713c07ad
-- Miftaul Jannat -> password: 12345   -> MD5: 827ccb0eea8a706c4c34a16891f84e7b
INSERT IGNORE INTO users (id, name, email, password, role) VALUES
    (11, 'Umama Samiha',   'umamasamiha@gmail.com',   '25d55ad283aa400af464c76d713c07ad', 'tutor'),
    (10, 'Miftaul Jannat', 'miftauljannat@gmail.com',  '827ccb0eea8a706c4c34a16891f84e7b', 'student');

-- Seed: Umama as a tutor in the tutors table (id must match hardcoded id=11 in frontend)
INSERT IGNORE INTO tutors (id, name, email, subject, rating, bio) VALUES
    (11, 'Umama Samiha', 'umamasamiha@gmail.com', 'CSE470', 4.9, 'Happy to help with Software Engineering topics!');

-- Study tasks (Umama Samiha's feature)
CREATE TABLE IF NOT EXISTS study_tasks (
    id           INT AUTO_INCREMENT PRIMARY KEY,
    user_id      INT NOT NULL DEFAULT 0,
    title        VARCHAR(255) NOT NULL,
    description  TEXT NULL,
    deadline     DATETIME NULL,
    plan_name    VARCHAR(255) NULL,
    priority     ENUM('high','medium','low') DEFAULT 'medium',
    is_completed TINYINT(1) DEFAULT 0,
    completed_at DATETIME NULL,
    created_at   DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- If study_tasks already existed from the old PHP setup, add the missing user_id column
ALTER TABLE study_tasks ADD COLUMN IF NOT EXISTS user_id INT NOT NULL DEFAULT 0 AFTER id;
