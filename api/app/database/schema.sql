-- AutoFlow Database Schema (MySQL 8.x compatible)
CREATE DATABASE IF NOT EXISTS autoflow CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE autoflow;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    role VARCHAR(50) DEFAULT 'owner',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    event_type VARCHAR(50) NOT NULL,
    file_type VARCHAR(50) DEFAULT 'UNKNOWN',
    category VARCHAR(50) DEFAULT 'DOCUMENT',
    normalized_path VARCHAR(500) NOT NULL,
    raw_hash VARCHAR(64) NULL,
    metadata_json TEXT NULL,
    is_privacy_filtered BOOLEAN DEFAULT TRUE,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_event_type (event_type),
    INDEX idx_timestamp (timestamp)
);

CREATE TABLE IF NOT EXISTS patterns (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pattern_code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NULL,
    sequence_json TEXT NOT NULL,
    occurrences INT DEFAULT 1,
    avg_interval_seconds FLOAT DEFAULT 0.0,
    confidence FLOAT DEFAULT 0.0,
    risk_level VARCHAR(20) DEFAULT 'LOW',
    status VARCHAR(50) DEFAULT 'DETECTED',
    detected_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_pattern_code (pattern_code)
);

CREATE TABLE IF NOT EXISTS pattern_events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pattern_id INT NOT NULL,
    event_id INT NULL,
    step_order INT NOT NULL,
    FOREIGN KEY (pattern_id) REFERENCES patterns(id) ON DELETE CASCADE,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS workflows (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pattern_id INT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT NULL,
    trigger_type VARCHAR(100) NOT NULL,
    conditions_json TEXT NULL,
    actions_json TEXT NOT NULL,
    verification_json TEXT NULL,
    risk_level VARCHAR(20) DEFAULT 'LOW',
    confidence FLOAT DEFAULT 0.0,
    status VARCHAR(50) DEFAULT 'PROPOSED',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (pattern_id) REFERENCES patterns(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS workflow_steps (
    id INT AUTO_INCREMENT PRIMARY KEY,
    workflow_id INT NOT NULL,
    step_order INT NOT NULL,
    tool_name VARCHAR(100) NOT NULL,
    tool_params_json TEXT NOT NULL,
    risk_level VARCHAR(20) DEFAULT 'LOW',
    FOREIGN KEY (workflow_id) REFERENCES workflows(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS permissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    action_type VARCHAR(50) NOT NULL UNIQUE,
    risk_level VARCHAR(20) DEFAULT 'LOW',
    is_allowed BOOLEAN DEFAULT TRUE,
    requires_approval BOOLEAN DEFAULT TRUE,
    description VARCHAR(255) NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS executions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    workflow_id INT NOT NULL,
    trigger_event_id INT NULL,
    status VARCHAR(50) DEFAULT 'PENDING',
    is_simulation BOOLEAN DEFAULT FALSE,
    error_message TEXT NULL,
    started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME NULL,
    FOREIGN KEY (workflow_id) REFERENCES workflows(id) ON DELETE CASCADE,
    FOREIGN KEY (trigger_event_id) REFERENCES events(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS execution_steps (
    id INT AUTO_INCREMENT PRIMARY KEY,
    execution_id INT NOT NULL,
    step_order INT NOT NULL,
    tool_name VARCHAR(100) NOT NULL,
    input_data_json TEXT NULL,
    output_data_json TEXT NULL,
    status VARCHAR(50) DEFAULT 'PENDING',
    error_message TEXT NULL,
    executed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (execution_id) REFERENCES executions(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS verification_results (
    id INT AUTO_INCREMENT PRIMARY KEY,
    execution_id INT NOT NULL,
    step_id INT NULL,
    status VARCHAR(50) NOT NULL,
    verification_type VARCHAR(100) NOT NULL,
    details_json TEXT NULL,
    verified_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (execution_id) REFERENCES executions(id) ON DELETE CASCADE,
    FOREIGN KEY (step_id) REFERENCES execution_steps(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS memory (
    id INT AUTO_INCREMENT PRIMARY KEY,
    memory_key VARCHAR(100) NOT NULL,
    memory_type VARCHAR(50) DEFAULT 'WORKFLOW_OUTCOME',
    memory_value_json TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_memory_key (memory_key)
);
