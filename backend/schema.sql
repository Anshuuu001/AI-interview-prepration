-- =========================================================================
-- ElevateAI MySQL Schema & Relational Connections
-- Defines the complete schema for Users, Login Security, Proctoring Logs,
-- Interviews, and Aptitude tests, along with core proctor-connecting queries.
-- =========================================================================

-- Create and Select Database
CREATE DATABASE IF NOT EXISTS elevate_db;
USE elevate_db;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('student', 'admin') DEFAULT 'student',
    title VARCHAR(100) DEFAULT 'Graduate Candidate',
    skills TEXT, -- Comma-separated list of skills
    bio TEXT,
    readiness_score INT DEFAULT 0,
    resume_score INT DEFAULT 0,
    aptitude_score INT DEFAULT 0,
    failed_attempts INT DEFAULT 0,
    lockout_until BIGINT DEFAULT NULL,
    suspended_until BIGINT DEFAULT NULL,
    suspended_reason TEXT DEFAULT NULL,
    is_banned BOOLEAN DEFAULT FALSE,
    session_id VARCHAR(50) DEFAULT NULL,
    avatar TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Remembered Devices Table (Linked to Users)
CREATE TABLE IF NOT EXISTS user_devices (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    device_id VARCHAR(255) NOT NULL,
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_device (user_id, device_id)
);

-- 3. Login History Table (Audit log for logins, brute force checks)
CREATE TABLE IF NOT EXISTS login_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    timestamp BIGINT NOT NULL,
    ip VARCHAR(45) NOT NULL,
    device VARCHAR(255) NOT NULL,
    status ENUM('success', 'failed', 'locked') NOT NULL,
    suspicious BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 4. User Suspensions History Table (Proctoring suspensions logs)
CREATE TABLE IF NOT EXISTS suspension_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    start_time BIGINT NOT NULL,
    end_time BIGINT NOT NULL,
    reason TEXT NOT NULL,
    warnings_count INT NOT NULL,
    ip VARCHAR(45) NOT NULL,
    device VARCHAR(255) NOT NULL,
    browser VARCHAR(255) NOT NULL,
    os VARCHAR(255) NOT NULL,
    status ENUM('active', 'expired', 'lifted') DEFAULT 'active',
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 5. Proctor Warnings Table (Proctor alert incidents)
CREATE TABLE IF NOT EXISTS warning_logs (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    template_id VARCHAR(50) NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'tab', 'copy', 'devtools', 'fullscreen', etc.
    message TEXT NOT NULL,
    warning_count INT NOT NULL,
    timestamp BIGINT NOT NULL,
    ip VARCHAR(45) NOT NULL,
    device VARCHAR(255) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 6. Proctor Activities Table (Lobby, Camera Checks, Exam Lifecycles)
CREATE TABLE IF NOT EXISTS activity_logs (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    template_id VARCHAR(50) NOT NULL,
    action VARCHAR(50) NOT NULL, -- 'login', 'submitted', 'camera_verified', etc.
    details TEXT NOT NULL,
    timestamp BIGINT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 7. Completed Interviews Table
CREATE TABLE IF NOT EXISTS interview_reports (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    role_title VARCHAR(100) NOT NULL,
    date VARCHAR(50) NOT NULL,
    duration INT NOT NULL, -- in seconds
    overall_score INT NOT NULL,
    technical_score INT NOT NULL,
    behavioral_score INT NOT NULL,
    presence_score INT NOT NULL,
    integrity_score INT DEFAULT 100,
    warnings_count INT DEFAULT 0,
    cheating_risk ENUM('Low', 'Medium', 'High', 'Critical') DEFAULT 'Low',
    feedback TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 8. Interview Q&A List Table (Detailed answer ratings)
CREATE TABLE IF NOT EXISTS interview_qa (
    id INT AUTO_INCREMENT PRIMARY KEY,
    report_id VARCHAR(50) NOT NULL,
    question TEXT NOT NULL,
    user_answer TEXT NOT NULL,
    score INT NOT NULL,
    correctness TEXT,
    technical_knowledge TEXT,
    FOREIGN KEY (report_id) REFERENCES interview_reports(id) ON DELETE CASCADE
);

-- 9. Aptitude Results Table
CREATE TABLE IF NOT EXISTS aptitude_results (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    date VARCHAR(50) NOT NULL,
    percentage INT NOT NULL,
    correct_answers INT NOT NULL,
    total_questions INT NOT NULL,
    duration VARCHAR(50) NOT NULL,
    details TEXT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);


-- =========================================================================
-- CORE PROCTORING DATA QUERIES
-- Connecting candidate profiles, security status, warning logs and reports
-- =========================================================================

-- QUERY 1: Fetch Candidate Roster with Lockout & Suspension Details
-- Used by the recruiter dashboard to display active state.
SELECT 
    u.id, 
    u.name, 
    u.email, 
    u.role, 
    u.title AS target_title,
    u.is_banned,
    (u.lockout_until IS NOT NULL AND u.lockout_until > UNIX_TIMESTAMP() * 1000) AS is_locked,
    (u.suspended_until IS NOT NULL AND u.suspended_until > UNIX_TIMESTAMP() * 1000) AS is_suspended,
    u.suspended_reason
FROM users u;

-- QUERY 2: Recruiter Assessments Grid with Integrity Scores & Warnings
-- Connects the candidate's profile to their completed exams and cheating risks.
SELECT 
    r.id AS report_id,
    r.date AS exam_date,
    u.name AS candidate_name,
    u.email AS candidate_email,
    r.role_title,
    r.overall_score,
    r.integrity_score,
    r.warnings_count,
    r.cheating_risk
FROM interview_reports r
INNER JOIN users u ON r.user_id = u.id
ORDER BY r.date DESC;

-- QUERY 3: Detailed Warnings Report for a Particular Interview
-- Returns all anti-cheat warning alerts triggered by the candidate in a session.
SELECT 
    w.timestamp,
    w.type AS violation_type,
    w.message AS violation_details,
    w.warning_count AS strike_number,
    w.ip AS client_ip,
    w.device AS client_user_agent
FROM warning_logs w
WHERE w.user_id = 'user-id-placeholder' AND w.template_id = 'template-id-placeholder'
ORDER BY w.timestamp ASC;

-- QUERY 4: Audit Feed for Recruiter Admin
-- Merges warning counts, suspensions, and registration actions chronologically.
SELECT 
    a.timestamp,
    u.name AS candidate_name,
    a.action,
    a.details
FROM activity_logs a
INNER JOIN users u ON a.user_id = u.id
UNION ALL
SELECT 
    w.timestamp,
    u.name AS candidate_name,
    CONCAT('warning_', w.type) AS action,
    w.message AS details
FROM warning_logs w
INNER JOIN users u ON w.user_id = u.id
ORDER BY timestamp DESC
LIMIT 100;


-- =========================================================================
-- ALTER TABLE QUERIES (IF TABLES ALREADY EXIST)
-- Commented out to prevent syntax errors on clean imports since they are
-- already included in the CREATE TABLE statements above.
-- =========================================================================

-- -- Add security columns to existing 'users' table:
-- ALTER TABLE users 
-- ADD COLUMN failed_attempts INT DEFAULT 0,
-- ADD COLUMN lockout_until BIGINT DEFAULT NULL,
-- ADD COLUMN suspended_until BIGINT DEFAULT NULL,
-- ADD COLUMN suspended_reason TEXT DEFAULT NULL,
-- ADD COLUMN is_banned BOOLEAN DEFAULT FALSE,
-- ADD COLUMN session_id VARCHAR(50) DEFAULT NULL;

-- -- Add proctor columns to existing 'interview_reports' table:
-- ALTER TABLE interview_reports 
-- ADD COLUMN integrity_score INT DEFAULT 100,
-- ADD COLUMN warnings_count INT DEFAULT 0,
-- ADD COLUMN cheating_risk ENUM('Low', 'Medium', 'High', 'Critical') DEFAULT 'Low';


-- =========================================================================
-- NEXUS AI EVOLUTION SYSTEM TABLES
-- Personal Memory, Learning Engine Logs, and System Configuration.
-- =========================================================================

-- 10. Personal Memories Table (Linked to Users)
CREATE TABLE IF NOT EXISTS personal_memories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL UNIQUE,
    resume TEXT,
    skills TEXT,
    career_goal VARCHAR(255) DEFAULT 'Graduate Candidate',
    weak_topics TEXT,
    strong_topics TEXT,
    preferred_language VARCHAR(50) DEFAULT 'English',
    learning_style VARCHAR(100) DEFAULT 'Practical & Example-Driven',
    notes TEXT,
    uploaded_pdfs TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 11. Learning Engine Interaction Logs
CREATE TABLE IF NOT EXISTS learning_logs (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    question TEXT,
    rating ENUM('helpful', 'unhelpful') DEFAULT 'helpful',
    time_taken INT DEFAULT 10,
    difficulty ENUM('Easy', 'Medium', 'Hard') DEFAULT 'Medium',
    topic VARCHAR(100) DEFAULT 'General Technical',
    outcome ENUM('Correct', 'Incorrect') DEFAULT 'Correct',
    timestamp BIGINT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 12. Nexus AI System Configuration
CREATE TABLE IF NOT EXISTS nexus_config (
    id INT AUTO_INCREMENT PRIMARY KEY,
    active_model VARCHAR(100) DEFAULT 'qwen3-8b',
    active_version VARCHAR(50) DEFAULT 'Nexus AI v1.0',
    ollama_url VARCHAR(255) DEFAULT 'http://localhost:11434',
    is_finetuning BOOLEAN DEFAULT FALSE,
    finetune_progress INT DEFAULT 0,
    finetune_logs TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
