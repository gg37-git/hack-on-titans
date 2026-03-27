const { Pool } = require('pg');
require('dotenv').config({ path: './backend/.env' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function reset() {
    try {
        console.log('Clearing doctors table...');
        await pool.query('DELETE FROM doctors');
        console.log('Doctors table cleared.');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
reset();
