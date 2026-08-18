import pool from './database.js';

async function checkIndex() {
  try {
    const [rows] = await pool.query('SHOW CREATE TABLE pacientes');
    console.log(rows[0]['Create Table']);
  } catch(e) {
    console.error(e);
  } finally {
    process.exit();
  }
}
checkIndex();
