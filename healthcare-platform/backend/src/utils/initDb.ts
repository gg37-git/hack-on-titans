import pool from '../config/database';

export async function initializeDatabase() {
  try {
    // Migration for Phase 3 (if exists but missing columns)
    // Run this BEFORE the main block to ensure columns exist for indexes
    await pool.query(`
      ALTER TABLE doctors ADD COLUMN IF NOT EXISTS state VARCHAR(100);
      ALTER TABLE doctors ADD COLUMN IF NOT EXISTS district VARCHAR(100);
      ALTER TABLE doctors ADD COLUMN IF NOT EXISTS locality VARCHAR(100);
    `);


    await pool.query(`
      -- Users table
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
...
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        full_name VARCHAR(255),
        phone VARCHAR(20),
        profile_completed BOOLEAN DEFAULT FALSE,
        is_premium BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- User Profiles table
      CREATE TABLE IF NOT EXISTS user_profiles (
        id SERIAL PRIMARY KEY,
        user_id INT UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        date_of_birth DATE,
        gender VARCHAR(50),
        height_cm INT,
        weight_kg DECIMAL(5, 2),
        blood_group VARCHAR(10),
        emergency_contact_name VARCHAR(255),
        emergency_contact_phone VARCHAR(20),
        emergency_contact_relationship VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Medical Conditions table
      CREATE TABLE IF NOT EXISTS medical_conditions (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id) ON DELETE CASCADE,
        condition_name VARCHAR(255) NOT NULL,
        diagnosis_date DATE,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Allergies table
      CREATE TABLE IF NOT EXISTS allergies (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id) ON DELETE CASCADE,
        allergy_name VARCHAR(255) NOT NULL,
        severity VARCHAR(50),
        reaction_description TEXT,
        medical_action_required BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Symptom Checks table
      CREATE TABLE IF NOT EXISTS symptom_checks (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id) ON DELETE CASCADE,
        symptoms_text TEXT NOT NULL,
        duration VARCHAR(50),
        intensity INT,
        analysis_result JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Doctors table
      CREATE TABLE IF NOT EXISTS doctors (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(20),
        specialty VARCHAR(255),
        qualifications TEXT,
        experience_years INT,
        clinic_name VARCHAR(255),
        clinic_address TEXT,
        state VARCHAR(100),
        district VARCHAR(100),
        locality VARCHAR(100),
        clinic_phone VARCHAR(20),
        rating DECIMAL(2, 1),
        total_reviews INT DEFAULT 0,
        verified BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Appointments table
      CREATE TABLE IF NOT EXISTS appointments (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id) ON DELETE CASCADE,
        doctor_id INT REFERENCES doctors(id),
        appointment_date TIMESTAMP NOT NULL,
        consultation_mode VARCHAR(50),
        status VARCHAR(50) DEFAULT 'scheduled',
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Chat History table
      CREATE TABLE IF NOT EXISTS chat_history (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id) ON DELETE CASCADE,
        role VARCHAR(50),
        message TEXT NOT NULL,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Health Records table
      CREATE TABLE IF NOT EXISTS health_records (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id) ON DELETE CASCADE,
        record_type VARCHAR(100),
        file_path VARCHAR(255),
        file_name VARCHAR(255),
        test_date DATE,
        clinic_name VARCHAR(255),
        doctor_name VARCHAR(255),
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Create indexes for faster queries
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_medical_conditions_user_id ON medical_conditions(user_id);
      CREATE INDEX IF NOT EXISTS idx_allergies_user_id ON allergies(user_id);
      CREATE INDEX IF NOT EXISTS idx_appointments_user_id ON appointments(user_id);
      CREATE INDEX IF NOT EXISTS idx_symptom_checks_user_id ON symptom_checks(user_id);
      CREATE INDEX IF NOT EXISTS idx_doctors_location ON doctors(state, district, locality);
  
      -- New Tables for Phase 2
      CREATE TABLE IF NOT EXISTS mood_logs (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id) ON DELETE CASCADE,
        mood VARCHAR(50) NOT NULL,
        context TEXT,
        energy_level INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS nutrition_logs (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id) ON DELETE CASCADE,
        meal_type VARCHAR(50),
        food_items TEXT,
        calories INT,
        protein INT,
        carbs INT,
        fats INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS fertility_logs (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id) ON DELETE CASCADE,
        last_period_start DATE,
        cycle_length INT,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS hospitals (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        state VARCHAR(100),
        district VARCHAR(100),
        beds INT,
        emergency_wait_time INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // --- PROCEDURAL GENERATION OF 1500 DOCTORS AND 3000 HOSPITALS ---
    const doctorCount = await pool.query('SELECT COUNT(*) FROM doctors');
    if (parseInt(doctorCount.rows[0].count) < 1500) {
       console.log('Generating 1500+ doctors across India...');
       const specialties = ['Cardiology', 'Neurology', 'Pediatrics', 'Oncology', 'Dermatology', 'Psychiatry', 'General Practice'];
       const states = ['Karnataka', 'Maharashtra', 'Delhi', 'Tamil Nadu', 'Telangana'];
       let docValues = [];
       for(let i=0; i<1500; i++) {
           let rS = states[i % states.length];
           let rSp = specialties[i % specialties.length];
           docValues.push(`('Dr. Expert ${i}', 'dr_mass_${i}@healthcare.local', '${rSp}', ${10 + (i%20)}, '${rS}', 'Metropolis ${i%5}', 'Clinic Network ${i%10}', true)`);
       }
       for(let i=0; i<docValues.length; i+=500) {
           let chunk = docValues.slice(i, i+500).join(',');
           await pool.query(`INSERT INTO doctors (name, email, specialty, experience_years, state, district, clinic_name, verified) VALUES ${chunk} ON CONFLICT DO NOTHING`);
       }
    }

    const hospitalCount = await pool.query('SELECT COUNT(*) FROM hospitals');
    if (parseInt(hospitalCount.rows[0].count) < 3000) {
       console.log('Generating 3000+ regional hospitals...');
       const states = ['Karnataka', 'Maharashtra', 'Delhi', 'Tamil Nadu', 'Telangana'];
       let hospValues = [];
       for(let i=0; i<3000; i++) {
           let rS = states[i % states.length];
           hospValues.push(`('National Medical Center ${i}', '${rS}', 'District ${i%15}', ${50 + (i%500)}, ${5 + (i%45)})`);
       }
       for(let i=0; i<hospValues.length; i+=500) {
           let chunk = hospValues.slice(i, i+500).join(',');
           await pool.query(`INSERT INTO hospitals (name, state, district, beds, emergency_wait_time) VALUES ${chunk}`);
       }
    }


    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
}
