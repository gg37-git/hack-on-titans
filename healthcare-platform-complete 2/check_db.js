const pool = require('./backend/src/config/database').default;

async function check() {
    try {
        const res = await pool.query('SELECT DISTINCT state FROM doctors ORDER BY state');
        console.log('States in DB:', res.rows.map(r => r.state));
        const count = await pool.query('SELECT COUNT(*) FROM doctors');
        console.log('Total count:', count.rows[0].count);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
check();
