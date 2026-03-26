CREATE TABLE IF NOT EXISTS doctors (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    specialty VARCHAR(100),
    qualifications VARCHAR(255),
    experience_years INTEGER,
    clinic_name VARCHAR(255),
    clinic_address TEXT,
    state VARCHAR(100),
    district VARCHAR(100),
    locality VARCHAR(100),
    rating DECIMAL(3,2) DEFAULT 0,
    verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
