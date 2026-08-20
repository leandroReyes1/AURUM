import { AppointmentRepository } from './AppointmentRepository.js';

export class AppointmentService {
  constructor() {
    this.repository = new AppointmentRepository();
    this.appointments = []; // Caché local para evitar llamadas repetidas a la API
  }

  // Carga o recarga todas las citas desde la API y las guarda en el caché
  async fetchAppointments() {
    this.appointments = await this.repository.getAll();
    return this.appointments;
  }

  // Cargar lista de estudios desde la API
  async fetchEstudios() {
    try {
      const API_BASE_URL = '/api';
      const response = await fetch(`${API_BASE_URL}/estudios`);
      if (response.ok) {
        return await response.json();
      }
      return [];
    } catch (e) {
      console.error(e);
      return [];
    }
  }

  // Retrieve all appointments
  getAllAppointments() {
    return this.appointments;
  }

  // Find appointment by ID
  getAppointmentById(id) {
    return this.appointments.find(apt => apt.id === id);
  }

  // Update status (validates new value)
  async updateStatus(id, newStatus) {
    const validStatuses = ['Pendiente', 'Confirmada', 'Completada', 'Cancelada'];
    if (!validStatuses.includes(newStatus)) {
      throw new Error(`Estado inválido: ${newStatus}`);
    }
    // El backend espera el nombre de columna 'estado'
    const updated = await this.repository.update(id, { estado: newStatus });
    await this.fetchAppointments(); // Recargar el caché
    return updated;
  }

  // Save internal notes
  async updateNotes(id, notes) {
    // El backend espera el nombre de columna 'notas_admin'
    const updated = await this.repository.update(id, { notas_admin: notes ? notes.trim() : '' });
    await this.fetchAppointments(); // Recargar el caché
    return updated;
  }

  // Reschedule date and time (automatically confirms the appointment)
  async reschedule(id, newDate, newTime) {
    if (!newDate || !newTime) {
      throw new Error('Debe proveer una nueva fecha y horario.');
    }
    const updated = await this.repository.update(id, {
      fecha_cita: newDate,
      hora_cita: newTime,
      estado: 'Confirmada' // Reagendar también confirma la cita
    });
    await this.fetchAppointments(); // Recargar el caché
    return updated;
  }

  // Calculate stats KPIs
  getMetrics() {
    const appointments = this.getAllAppointments();
    const total = appointments.length;
    const pending = appointments.filter(a => a.estado === 'Pendiente').length;
    const confirmed = appointments.filter(a => a.estado === 'Confirmada').length;
    const completed = appointments.filter(a => a.estado === 'Completada').length;
    
    // Confirmation rate: (Confirmed + Completed) / (Total - Cancelled)
    const activeTotal = appointments.filter(a => a.estado !== 'Cancelada').length;
    const confirmedTotal = confirmed + completed;
    
    const rate = activeTotal > 0 ? Math.round((confirmedTotal / activeTotal) * 100) : 0;

    return { total, pending, confirmed, rate };
  }

  // Get frequency of appointments grouped by study type
  getStudyDistribution() {
    const appointments = this.getAllAppointments();
    // Obtenemos los nombres de los estudios dinámicamente
    const studies = [...new Set(appointments.map(a => a.estudio))];
    const counts = {};
    
    studies.forEach(s => counts[s] = 0);
    appointments.forEach(apt => {
      if (counts[apt.estudio] !== undefined) {
        counts[apt.estudio]++;
      }
    });

    return counts;
  }
}
