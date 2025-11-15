-- Database schema for Bib-Esprim application

-- Create database
CREATE DATABASE bib_esprim_db;

-- Connect to the database
\c bib_esprim_db;

-- Create tables

-- Users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'student', -- student, faculty, admin
  phone VARCHAR(20), -- For SMS 2FA
  two_factor_enabled BOOLEAN DEFAULT FALSE,
  two_factor_secret VARCHAR(255), -- TOTP secret
  two_factor_method VARCHAR(20) DEFAULT 'app', -- 'app' or 'sms'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Reports table
CREATE TABLE reports (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  author_id INTEGER REFERENCES users(id),
  status VARCHAR(20) DEFAULT 'draft', -- draft, submitted, approved, rejected
  submission_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Catalog table
CREATE TABLE catalog (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(50),
  author VARCHAR(100),
  publication_year INTEGER,
  file_path VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Dashboard stats table
CREATE TABLE dashboard_stats (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  total_reports INTEGER DEFAULT 0,
  approved_reports INTEGER DEFAULT 0,
  pending_reports INTEGER DEFAULT 0,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Consultations table
CREATE TABLE consultations (
  id SERIAL PRIMARY KEY,
  student_id INTEGER REFERENCES users(id),
  faculty_id INTEGER REFERENCES users(id),
  report_id INTEGER REFERENCES reports(id),
  scheduled_date TIMESTAMP,
  status VARCHAR(20) DEFAULT 'scheduled', -- scheduled, completed, cancelled
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notifications table
CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(20) DEFAULT 'info', -- info, warning, success, error
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample data
INSERT INTO users (username, email, password_hash, role, phone, two_factor_enabled, two_factor_method) VALUES
('admin', 'admin@bibesprim.edu', '$2b$10$example.hash', 'admin', '+216259022', TRUE, 'app'),
('faculty1', 'faculty1@bibesprim.edu', '$2b$10$example.hash', 'faculty', '+216259023', TRUE, 'sms'),
('student1', 'student1@bibesprim.edu', '$2b$10$example.hash', 'student', NULL, FALSE, 'app');

INSERT INTO catalog (title, description, category, author, publication_year) VALUES
('Introduction to Academic Writing', 'A comprehensive guide to academic writing', 'Writing', 'Dr. Jane Smith', 2023),
('Research Methodology', 'Fundamentals of research methods', 'Research', 'Prof. John Doe', 2022);

INSERT INTO dashboard_stats (user_id, total_reports, approved_reports, pending_reports) VALUES
(3, 5, 3, 2);
