
fetch('http://localhost:4000/api/citas', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    nombre_completo: 'Test User',
    telefono: '1234567890',
    correo: 'test@example.com',
    estudio: 'Ultrasonido Mamario',
    fecha_cita: '2026-08-20',
    hora_cita: '09:00'
  })
}).then(r => r.json().then(d => console.log(r.status, d))).catch(console.error);

