import pool from './database.js';
import { sendAppointmentEmail } from './src/lib/email.js';

// OBTENER TODAS las citas
export const getAllCitas = async (req, res) => {
  try {
    const sql = `
      SELECT 
        c.id, c.fecha_cita, c.hora_cita, c.estado, c.notas_admin, c.fecha_creacion,
        p.nombre_completo as nombre_paciente, p.telefono, p.email, p.edad, p.sexo,
        e.nombre_estudio as estudio
      FROM citas c
      JOIN pacientes p ON c.paciente_id = p.id
      JOIN estudios e ON c.estudio_id = e.id
      ORDER BY c.fecha_cita ASC, c.hora_cita ASC
    `;
    const [rows] = await pool.execute(sql);

    // Auto-completar citas confirmadas que ya pasaron por más de 30 minutos
    const now = new Date();
    const idsToComplete = [];

    rows.forEach(row => {
      if (row.estado === 'Confirmada' && row.fecha_cita && row.hora_cita) {
        let dateStr = '';
        if (typeof row.fecha_cita === 'string') {
          dateStr = row.fecha_cita.split('T')[0];
        } else {
          // Extraer fecha local segura (YYYY-MM-DD)
          const year = row.fecha_cita.getFullYear();
          const month = String(row.fecha_cita.getMonth() + 1).padStart(2, '0');
          const day = String(row.fecha_cita.getDate()).padStart(2, '0');
          dateStr = `${year}-${month}-${day}`;
        }

        // Crear fecha/hora de la cita en horario local
        const aptDateTime = new Date(`${dateStr}T${row.hora_cita}`);
        
        // Sumar 30 minutos a la hora de la cita
        aptDateTime.setMinutes(aptDateTime.getMinutes() + 30);

        // Si la hora actual superó la hora de la cita + 30 min, se autocompleta
        if (now > aptDateTime) {
          row.estado = 'Completada';
          idsToComplete.push(row.id);
        }
      }
    });

    // Actualizar en base de datos si hay citas que pasaron el tiempo
    if (idsToComplete.length > 0) {
      const placeholders = idsToComplete.map(() => '?').join(',');
      const updateSql = `UPDATE citas SET estado = 'Completada' WHERE id IN (${placeholders})`;
      // Se ejecuta asíncronamente sin bloquear la respuesta
      pool.execute(updateSql, idsToComplete).catch(err => console.error('Error auto-completando citas:', err));
    }

    res.json(rows);
  } catch (error) {
    console.error('Error al obtener citas:', error);
    res.status(500).json({ message: 'Error interno del servidor al obtener citas.' });
  }
};

// OBTENER UNA SOLA cita por ID
export const getCitaById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.execute('SELECT * FROM citas WHERE id = ?', [id]);
    if (rows.length > 0) {
      res.json(rows[0]);
    } else {
      res.status(404).json({ message: 'Cita no encontrada.' });
    }
  } catch (error) {
    console.error(`Error al obtener la cita ${req.params.id}:`, error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

// CREAR una nueva cita
export const createCita = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { nombre_completo, telefono, edad, sexo, correo, estudio: nombre_estudio, fecha_cita, hora_cita } = req.body;

    if (!nombre_completo || !telefono || !nombre_estudio || !fecha_cita || !hora_cita) {
      return res.status(400).json({ message: 'Faltan datos obligatorios.' });
    }

    await connection.beginTransaction();

    let [pacientes] = await connection.execute(
      'SELECT id FROM pacientes WHERE telefono = ? AND nombre_completo = ? LIMIT 1', 
      [telefono, nombre_completo]
    );
    let pacienteId;
    if (pacientes.length > 0) {
      pacienteId = pacientes[0].id;
      // Actualizamos edad, sexo y email si los proveen nuevos
      await connection.execute('UPDATE pacientes SET edad = ?, sexo = ?, email = ? WHERE id = ?', [edad || null, sexo || null, correo || null, pacienteId]);
    } else {
      const [result] = await connection.execute('INSERT INTO pacientes (nombre_completo, telefono, edad, sexo, email) VALUES (?, ?, ?, ?, ?)', [nombre_completo, telefono, edad || null, sexo || null, correo || null]);
      pacienteId = result.insertId;
    }

    const [estudios] = await connection.execute('SELECT id FROM estudios WHERE nombre_estudio = ?', [nombre_estudio]);
    if (estudios.length === 0) {
      await connection.rollback();
      return res.status(400).json({ message: `El estudio '${nombre_estudio}' no es válido.` });
    }
    const estudioId = estudios[0].id;

    const citaId = `APT-${Date.now().toString().slice(-4)}`;
    await connection.execute(
      'INSERT INTO citas (id, paciente_id, estudio_id, fecha_cita, hora_cita, estado) VALUES (?, ?, ?, ?, ?, ?)',
      [citaId, pacienteId, estudioId, fecha_cita, hora_cita, 'Pendiente']
    );

    await connection.commit();

    const sqlSelect = `
      SELECT 
        c.id, c.fecha_cita, c.hora_cita, c.estado, c.notas_admin, c.fecha_creacion,
        p.nombre_completo as nombre_paciente, p.telefono, p.email, p.edad, p.sexo,
        e.nombre_estudio as estudio
      FROM citas c
      JOIN pacientes p ON c.paciente_id = p.id
      JOIN estudios e ON c.estudio_id = e.id
      WHERE c.id = ?
    `;
    const [newAppointment] = await connection.execute(sqlSelect, [citaId]);
    res.status(201).json(newAppointment[0]);

  } catch (error) {
    await connection.rollback();
    console.error('Error al crear la cita:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'El correo electrónico o teléfono ya se encuentra registrado con otro paciente.' });
    }
    res.status(500).json({ message: 'Error interno del servidor al crear la cita.' });
  } finally {
    connection.release();
  }
};

// ACTUALIZAR una cita
export const updateCita = async (req, res) => {
  try {
    const { id } = req.params;
    const fieldsToUpdate = req.body;
    const fieldNames = Object.keys(fieldsToUpdate);
    if (fieldNames.length === 0) {
      return res.status(400).json({ message: 'No hay campos para actualizar.' });
    }

    // Primero, obtener la cita actual para compararla y saber si se reagendó o canceló
    const [oldRows] = await pool.execute('SELECT * FROM citas WHERE id = ?', [id]);
    if (oldRows.length === 0) return res.status(404).json({ message: 'Cita no encontrada.' });
    const oldCita = oldRows[0];

    const setClause = fieldNames.map(field => `${field} = ?`).join(', ');
    const sql = `UPDATE citas SET ${setClause} WHERE id = ?`;
    const [result] = await pool.execute(sql, [...Object.values(fieldsToUpdate), id]);

    if (result.affectedRows > 0) {
      const sqlSelect = `
        SELECT 
          c.id, c.fecha_cita, c.hora_cita, c.estado, c.notas_admin, c.fecha_creacion,
          p.nombre_completo as nombre_paciente, p.telefono, p.email, p.edad, p.sexo,
          e.nombre_estudio as estudio
        FROM citas c
        JOIN pacientes p ON c.paciente_id = p.id
        JOIN estudios e ON c.estudio_id = e.id
        WHERE c.id = ?
      `;
      const [updatedRows] = await pool.execute(sqlSelect, [id]);
      const citaActualizada = updatedRows[0];

      // Determinar qué tipo de correo enviar (si aplica)
      let emailType = null;
      if (oldCita.estado !== 'Confirmada' && fieldsToUpdate.estado === 'Confirmada') {
        emailType = 'Confirmada';
      } else if (oldCita.estado !== 'Cancelada' && fieldsToUpdate.estado === 'Cancelada') {
        emailType = 'Cancelada';
      } else if (
        (fieldsToUpdate.estado === 'Confirmada' || fieldsToUpdate.estado === 'Pendiente') &&
        ((fieldsToUpdate.fecha_cita && oldCita.fecha_cita.toISOString().split('T')[0] !== fieldsToUpdate.fecha_cita) || 
         (fieldsToUpdate.hora_cita && oldCita.hora_cita.slice(0, 5) !== fieldsToUpdate.hora_cita.slice(0, 5)))
      ) {
        // Si cambia la fecha o la hora y la cita no está cancelada/completada, es un reagendamiento
        emailType = 'Reagendada';
      }

      // Enviar correo si aplica y el paciente tiene correo
      if (emailType && citaActualizada.email) {
        try {
          await sendAppointmentEmail(citaActualizada, emailType);
        } catch (mailError) {
          console.error(`Error al enviar correo de tipo ${emailType}:`, mailError);
        }
      }

      res.json(citaActualizada);
    } else {
      res.status(404).json({ message: 'Cita no encontrada para actualizar.' });
    }
  } catch (error) {
    console.error(`Error al actualizar la cita ${req.params.id}:`, error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

// OBTENER horarios disponibles
export const getHorariosDisponibles = async (req, res) => {
  try {
    const { fecha } = req.query;
    if (!fecha) return res.status(400).json({ message: 'Se requiere una fecha.' });

    const [rows] = await pool.execute("SELECT TRIM(TIME_FORMAT(hora_cita, '%H:%i')) AS hora_cita FROM citas WHERE fecha_cita = ? AND estado != 'Cancelada'", [fecha]);
    const bookedTimes = rows.map(row => row.hora_cita);
    res.json(bookedTimes);
  } catch (error) {
    console.error('Error al obtener horarios:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

// OBTENER TODOS los estudios
export const getAllEstudios = async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT id, nombre_estudio FROM estudios ORDER BY nombre_estudio ASC');
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener estudios:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};