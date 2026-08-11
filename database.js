import mysql from 'mysql2/promise';

// ESTE ES EL ÚNICO LUGAR DONDE DEBES PONER TUS CREDENCIALES
const dbConfig = {
  host: '127.0.0.1',
  user: 'root',
  // ¡IMPORTANTE! Si tu base de datos MySQL tiene contraseña, ponla aquí. Si no, déjalo en blanco ('').
  password: 'lean',
  database: 'clinicaaurum',
  port: 4406,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

const pool = mysql.createPool(dbConfig);

export default pool;