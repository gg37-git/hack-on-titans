import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

const specialties = ['General Physician', 'Cardiologist', 'Dermatologist', 'Pediatrician', 'Orthopedist', 'Gynecologist', 'Neurologist', 'Endocrinologist', 'ENT Specialist', 'Oncologist', 'Psychiatrist', 'Pulmonologist', 'Gastroenterologist', 'Urologist', 'Ophthalmologist'];

const statesAndDistricts = [
  { state: 'Maharashtra', districts: ['Mumbai', 'Pune', 'Nagpur', 'Thane', 'Nashik'] },
  { state: 'Karnataka', districts: ['Bangalore Urban', 'Mysore', 'Hubballi', 'Mangalore', 'Belagavi'] },
  { state: 'Delhi', districts: ['New Delhi', 'South Delhi', 'North Delhi', 'West Delhi', 'East Delhi'] },
  { state: 'Tamil Nadu', districts: ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem'] },
  { state: 'Telangana', districts: ['Hyderabad', 'Warangal', 'Nizamabad', 'Karimnagar', 'Khammam'] },
  { state: 'Gujarat', districts: ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar'] },
  { state: 'Uttar Pradesh', districts: ['Lucknow', 'Kanpur', 'Agra', 'Varanasi', 'Prayagraj'] },
  { state: 'West Bengal', districts: ['Kolkata', 'Howrah', 'Darjeeling', 'Siliguri', 'Asansol'] },
  { state: 'Rajasthan', districts: ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Bikaner'] },
  { state: 'Kerala', districts: ['Thiruvananthapuram', 'Kochi', 'Kozhikode', 'Thrissur', 'Kollam'] },
];

const indianFirstNames = ['Rajesh', 'Priya', 'Amit', 'Neha', 'Suresh', 'Anita', 'Rahul', 'Sneha', 'Vikram', 'Pooja', 'Anand', 'Kavita', 'Sanjay', 'Meenakshi', 'Arun', 'Roshni', 'Vivek', 'Divya', 'Ravi', 'Aarti'];
const indianLastNames = ['Sharma', 'Patel', 'Kumar', 'Singh', 'Gupta', 'Rao', 'Iyer', 'Menon', 'Jain', 'Reddy', 'Chawla', 'Agarwal', 'Verma', 'Nair', 'Bhat', 'Desai', 'Joshi', 'Kapoor', 'Das', 'Sen'];
const hospitalSuffixes = ['Care Hospital', 'Super Specialty', 'Healthcare Hub', 'Medical Center', 'General Hospital', 'Clinic', 'Wellness Center'];

function getRandomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomRating() {
  return (Math.random() * (5.0 - 3.5) + 3.5).toFixed(1);
}

async function seedMassive() {
  try {
    console.log('⏳ Creating tables if they don\'t exist...');
    
    // Create Hospitals Table First
    await pool.query(`
      CREATE TABLE IF NOT EXISTS hospitals (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        address TEXT NOT NULL,
        state VARCHAR(50),
        district VARCHAR(50),
        phone VARCHAR(20),
        emergency_available BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create Doctors Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS doctors (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(20),
        specialty VARCHAR(100),
        qualifications TEXT,
        experience_years INTEGER,
        clinic_name VARCHAR(255),
        clinic_address TEXT,
        state VARCHAR(50),
        district VARCHAR(50),
        locality VARCHAR(100),
        consultation_fee DECIMAL(10,2) DEFAULT 500.00,
        rating DECIMAL(3,2),
        verified BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('🧹 Truncating existing doctors and hospitals to ensure perfect generation...');
    await pool.query('TRUNCATE TABLE doctors CASCADE;');
    await pool.query('TRUNCATE TABLE hospitals CASCADE;');

    console.log('🚀 Generating 3,000+ Hospitals...');
    let hospitalCount = 0;
    while (hospitalCount < 3050) {
      const stateObj = statesAndDistricts[getRandomInt(0, statesAndDistricts.length - 1)];
      const district = stateObj.districts[getRandomInt(0, stateObj.districts.length - 1)];
      const docName = indianLastNames[getRandomInt(0, indianLastNames.length - 1)];
      const name = `${district} ${docName} ${hospitalSuffixes[getRandomInt(0, hospitalSuffixes.length - 1)]}`;
      const hasEmergency = Math.random() > 0.4;
      
      await pool.query(
        'INSERT INTO hospitals (name, address, state, district, phone, emergency_available) VALUES ($1,$2,$3,$4,$5,$6)',
        [name, `Plot ${getRandomInt(1, 999)}, Main Road, ${district}`, stateObj.state, district, `+91 1800-${getRandomInt(100,999)}-${getRandomInt(1000,9999)}`, hasEmergency]
      );
      hospitalCount++;
      if (hospitalCount % 500 === 0) console.log(`   Added ${hospitalCount} hospitals...`);
    }

    console.log('🚀 Generating 1,500+ Doctors...');
    let doctorCount = 0;
    while (doctorCount < 1550) {
      const stateObj = statesAndDistricts[getRandomInt(0, statesAndDistricts.length - 1)];
      const district = stateObj.districts[getRandomInt(0, stateObj.districts.length - 1)];
      const fname = indianFirstNames[getRandomInt(0, indianFirstNames.length - 1)];
      const lname = indianLastNames[getRandomInt(0, indianLastNames.length - 1)];
      const name = `Dr. ${fname} ${lname}`;
      const email = `dr.${fname.toLowerCase()}.${lname.toLowerCase()}${doctorCount}@example.com`;
      const specialty = specialties[getRandomInt(0, specialties.length - 1)];
      const rating = getRandomRating();
      
      await pool.query(
        'INSERT INTO doctors (name, email, phone, specialty, qualifications, experience_years, clinic_name, clinic_address, state, district, locality, rating, verified) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,true)',
        [name, email, `+91 9${getRandomInt(100000000, 999999999)}`, specialty, 'MBBS, MD', getRandomInt(2, 35), `${lname} Clinic`, `Street ${getRandomInt(1, 100)}, ${district}`, stateObj.state, district, district, rating]
      );
      doctorCount++;
      if (doctorCount % 250 === 0) console.log(`   Added ${doctorCount} doctors...`);
    }

    console.log('✅ Success! Database massively scaled to production levels.');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding massive database:', error);
    process.exit(1);
  }
}

seedMassive();
