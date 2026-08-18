import pool from './database.js';

async function dropUniqueKeys() {
  try {
    await pool.query('ALTER TABLE pacientes DROP INDEX telefono;');
    console.log("Dropped UNIQUE KEY telefono");
  } catch(e) {
    console.log("Could not drop telefono index:", e.message);
  }
  
  try {
    await pool.query('ALTER TABLE pacientes DROP INDEX email;');
    console.log("Dropped UNIQUE KEY email");
  } catch(e) {
    console.log("Could not drop email index:", e.message);
  }
  
  process.exit();
}
dropUniqueKeys();
