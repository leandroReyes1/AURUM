import { AppointmentRepository } from './AppointmentRepository.js';

export class AppointmentService {
  constructor() {
    this.repository = new AppointmentRepository();
  }

  // Retrieve all appointments
  getAllAppointments() {
    return this.repository.getAll();
  }

  // Find appointment by ID
  getAppointmentById(id) {
    return this.repository.findById(id);
  }

  // Create appointment (validates fields, sets initial values, generates ID)
  createAppointment(data) {
    if (!data.name || !data.phone || !data.email || !data.study || !data.date || !data.time) {
      throw new Error('Todos los campos obligatorios deben ser provistos.');
    }

    const id = `APT-${Math.floor(1000 + Math.random() * 9000)}`;

    const newApt = {
      id,
      name: data.name.trim(),
      phone: data.phone.trim(),
      email: data.email.trim(),
      study: data.study,
      date: data.date,
      time: data.time,
      notes: data.notes ? data.notes.trim() : '',
      status: 'Pendiente',
      createdAt: new Date().toISOString()
    };

    return this.repository.add(newApt);
  }

  // Update status (validates new value)
  updateStatus(id, newStatus) {
    const validStatuses = ['Pendiente', 'Confirmada', 'Completada', 'Cancelada'];
    if (!validStatuses.includes(newStatus)) {
      throw new Error(`Estado inválido: ${newStatus}`);
    }
    return this.repository.update(id, { status: newStatus });
  }

  // Save internal notes
  updateNotes(id, notes) {
    return this.repository.update(id, { notes: notes ? notes.trim() : '' });
  }

  // Reschedule date and time (automatically confirms the appointment)
  reschedule(id, newDate, newTime) {
    if (!newDate || !newTime) {
      throw new Error('Debe proveer una nueva fecha y horario.');
    }
    return this.repository.update(id, {
      date: newDate,
      time: newTime,
      status: 'Confirmada'
    });
  }

  // Calculate stats KPIs
  getMetrics() {
    const appointments = this.repository.getAll();
    const total = appointments.length;
    const pending = appointments.filter(a => a.status === 'Pendiente').length;
    const confirmed = appointments.filter(a => a.status === 'Confirmada').length;
    const completed = appointments.filter(a => a.status === 'Completada').length;
    
    // Confirmation rate: (Confirmed + Completed) / (Total - Cancelled)
    const activeTotal = appointments.filter(a => a.status !== 'Cancelada').length;
    const confirmedTotal = confirmed + completed;
    
    const rate = activeTotal > 0 ? Math.round((confirmedTotal / activeTotal) * 100) : 0;

    return {
      total,
      pending,
      confirmed,
      rate
    };
  }

  // Get frequency of appointments grouped by study type
  getStudyDistribution() {
    const appointments = this.repository.getAll();
    const studies = ['Mastografía', 'Ultrasonido Mamario', 'Resonancia Magnética', 'Tomografía', 'Consulta Oncológica'];
    const counts = {};
    
    studies.forEach(s => counts[s] = 0);
    appointments.forEach(apt => {
      if (counts[apt.study] !== undefined) {
        counts[apt.study]++;
      }
    });

    return counts;
  }
}
