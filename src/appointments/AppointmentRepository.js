export class AppointmentRepository {
  constructor() {
    this.storageKey = 'aurum_appointments';
  }

  // Retrieve all appointments
  getAll() {
    return JSON.parse(localStorage.getItem(this.storageKey) || '[]');
  }

  // Overwrite the entire dataset
  saveAll(appointments) {
    localStorage.setItem(this.storageKey, JSON.stringify(appointments));
  }

  // Find appointment by ID
  findById(id) {
    const list = this.getAll();
    return list.find(apt => apt.id === id);
  }

  // Insert a new appointment
  add(appointment) {
    const list = this.getAll();
    list.push(appointment);
    this.saveAll(list);
    return appointment;
  }

  // Update specific fields of an appointment
  update(id, updatedFields) {
    const list = this.getAll();
    const index = list.findIndex(apt => apt.id === id);
    if (index !== -1) {
      list[index] = { ...list[index], ...updatedFields };
      this.saveAll(list);
      return list[index];
    }
    return null;
  }
}
