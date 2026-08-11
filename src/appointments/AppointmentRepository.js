// Detectar automáticamente si estamos en Live Server o en el servidor Node
const API_BASE_URL = window.location.port === '4000' ? '/api' : 'http://localhost:4000/api';

export class AppointmentRepository {
  constructor() {
    // Ya no necesitamos una clave de storage, ahora interactuamos con una API.
  }

  // Obtener todas las citas desde el backend
  async getAll() {
    try {
      const response = await fetch(`${API_BASE_URL}/citas`);
      if (!response.ok) throw new Error('Error al obtener las citas');
      return await response.json();
    } catch (error) {
      console.error('Error en AppointmentRepository.getAll:', error);
      return []; // Devuelve un array vacío en caso de error para no romper la UI.
    }
  }

  // Encontrar una cita por su ID
  async findById(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/citas/${id}`);
      if (!response.ok) return null;
      return await response.json();
    } catch (error) {
      console.error('Error en AppointmentRepository.findById:', error);
      return null;
    }
  }

  // Añadir una nueva cita
  async add(appointmentData) {
    const response = await fetch(`${API_BASE_URL}/citas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(appointmentData),
    });
    return await response.json();
  }

  // Actualizar una cita existente
  async update(id, updatedFields) {
    const response = await fetch(`${API_BASE_URL}/citas/${id}`, {
      method: 'PUT', // O 'PATCH' dependiendo de tu diseño de API
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedFields),
    });
    return await response.json();
  }
}
