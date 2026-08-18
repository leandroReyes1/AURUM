import pool from './database.js';

async function testApiLogic() {
  const connection = await pool.getConnection();
  try {
    const telefono = '0000000001'; // un telefono nuevo
    const correo = 'test@example.com'; // correo que asumo existe de la prueba anterior
    const nombre_completo = 'Test User 2';
    const edad = 25;
    const sexo = 'Masculino';

    let [pacientes] = await connection.execute(
      'SELECT id FROM pacientes WHERE telefono = ? OR (email = ? AND email IS NOT NULL AND email != "") LIMIT 1', 
      [telefono, correo || null]
    );
    let pacienteId;
    if (pacientes.length > 0) {
      pacienteId = pacientes[0].id;
      await connection.execute('UPDATE pacientes SET edad = ?, sexo = ? WHERE id = ?', [edad || null, sexo || null, pacienteId]);
      console.log('Paciente encontrado por email, ID:', pacienteId);
    } else {
      const [result] = await connection.execute('INSERT INTO pacientes (nombre_completo, telefono, edad, sexo, email) VALUES (?, ?, ?, ?, ?)', [nombre_completo, telefono, edad || null, sexo || null, correo || null]);
      pacienteId = result.insertId;
      console.log('Paciente insertado, ID:', pacienteId);
    }
  } catch (e) {
    console.error('Logic error:', e.message);
  } finally {
    connection.release();
    process.exit();
  }
}
testApiLogic();
