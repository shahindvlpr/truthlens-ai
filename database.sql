CREATE DATABASE IF NOT EXISTS truthlens_db;
USE truthlens_db;

CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS detections (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    news_text TEXT NOT NULL,
    prediction VARCHAR(10) NOT NULL,
    confidence DECIMAL(5,2) NOT NULL,
    toxicity_score DECIMAL(5,2) DEFAULT 0,
    sentiment VARCHAR(20) DEFAULT 'Neutral',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

INSERT INTO users (name, email, password_hash) VALUES 
('Test User', 'test@test.com', '$2a$10$d3x5YqKqKqKqKqKqKqKqKu');