// public-page.js — Lógica del formulario de citas público

// Add bottom padding on mobile for fixed bottom nav
if (window.innerWidth < 768) {
  document.body.style.paddingBottom = '64px';
}
window.addEventListener('resize', () => {
  document.body.style.paddingBottom = window.innerWidth < 768 ? '64px' : '0';
});

// Manejo del formulario de citas con la API
const appointmentForm = document.getElementById('appointment-form');
const successMessage = document.getElementById('form-success-message');
const submitButton = document.getElementById('form-submit-button');
const dateInput = document.getElementById('form-fecha');
const timeSelect = document.getElementById('form-hora');
const studySelect = document.getElementById('form-estudio');

if (appointmentForm) {
  // Horarios de atención disponibles
  const ALL_AVAILABLE_TIMES = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "12:00", "12:30", "13:00", "13:30"
  ];

  // Detectar automáticamente si estamos en Live Server o en el servidor Node
  const API_BASE_URL = window.location.port === '4000' ? '/api' : 'http://localhost:4000/api';

  // Función para cargar estudios desde la API
  const loadStudies = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/estudios`);
      if (!response.ok) throw new Error('No se pudieron cargar los estudios.');

      const studies = await response.json();
      studySelect.innerHTML = '<option value="">Selecciona un estudio</option>'; // Limpiar y poner placeholder
      studies.forEach(study => {
        // Usamos study.nombre_estudio que es lo que el backend espera
        const option = new Option(study.nombre_estudio, study.nombre_estudio);
        studySelect.add(option);
      });
      studySelect.disabled = false;
    } catch (error) {
      console.error("Error al cargar estudios:", error);
      studySelect.innerHTML = '<option value="">Error al cargar estudios</option>';
    }
  };

  // 1. Inicializar el calendario (Flatpickr)
  flatpickr(dateInput, {
    locale: "es",
    minDate: "today",
    dateFormat: "Y-m-d",
    disable: [
      function (date) {
        // Deshabilitar Sábados (6) y Domingos (0)
        return (date.getDay() === 0 || date.getDay() === 6);
      }
    ],
    // Se activa cuando el usuario selecciona una fecha
    onChange: async function (selectedDates, dateStr, instance) {
      if (!dateStr) return;

      timeSelect.disabled = true;
      timeSelect.innerHTML = '<option>Cargando horarios...</option>';

      try {
        // 2. Consultar a la API los horarios ocupados
        const response = await fetch(`${API_BASE_URL}/horarios-disponibles?fecha=${dateStr}`);
        const bookedTimesArray = await response.json(); // e.g., ["09:30", "11:00"]

        // 3. Filtrar para obtener solo los horarios libres
        const freeTimes = ALL_AVAILABLE_TIMES.filter(time => !bookedTimesArray.includes(time));

        timeSelect.innerHTML = ''; // Limpiar opciones

        if (freeTimes.length > 0) {
          timeSelect.innerHTML = '<option value="">Selecciona un horario</option>';
          freeTimes.forEach(time => {
            const option = new Option(time, time);
            timeSelect.add(option);
          });
          timeSelect.disabled = false;
        } else {
          timeSelect.innerHTML = '<option>No hay horarios libres</option>';
        }
      } catch (error) {
        console.error("Error al cargar horarios:", error);
        timeSelect.innerHTML = '<option>Error al cargar</option>';
      }
    },
  });

  // 4. Manejar el envío del formulario
  appointmentForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    submitButton.disabled = true;
    submitButton.textContent = 'Enviando...';

    const formData = {
      nombre_completo: document.getElementById('form-nombre').value,
      telefono: document.getElementById('form-telefono').value,
      edad: document.getElementById('form-edad').value,
      sexo: document.getElementById('form-sexo').value,
      correo: document.getElementById('form-correo').value,
      fecha_cita: dateInput.value,
      hora_cita: timeSelect.value,
      estudio: document.getElementById('form-estudio').value,
    };

    try {
      const response = await fetch(`${API_BASE_URL}/citas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Hubo un problema al enviar la solicitud.');
      }

      // Ocultar formulario y mostrar mensaje de éxito
      appointmentForm.style.display = 'none';
      successMessage.style.display = 'block';

    } catch (error) {
      console.error('Error en el formulario:', error);
      alert('No se pudo enviar la solicitud. Por favor, intenta más tarde.');
      submitButton.disabled = false;
      submitButton.innerHTML = '<i class="fas fa-calendar-check mr-2"></i>Confirmar Cita';
    }
  });

  // Cargar los estudios al iniciar la página
  loadStudies();
}

// -----------------------------------------------------------------------------
// BLOQUEO DE CÓDIGO FUENTE (Protección básica)
// -----------------------------------------------------------------------------

// Bloquear el clic derecho (menú contextual)
document.addEventListener('contextmenu', function(e) {
  e.preventDefault();
});

// Bloquear atajos de teclado comunes para ver código
document.addEventListener('keydown', function(e) {
  // F12
  if (e.key === 'F12' || e.keyCode === 123) {
    e.preventDefault();
  }
  // Ctrl+Shift+I (Herramientas de desarrollo)
  if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.keyCode === 73)) {
    e.preventDefault();
  }
  // Ctrl+Shift+C (Inspector de elementos)
  if (e.ctrlKey && e.shiftKey && (e.key === 'C' || e.key === 'c' || e.keyCode === 67)) {
    e.preventDefault();
  }
  // Ctrl+Shift+J (Consola)
  if (e.ctrlKey && e.shiftKey && (e.key === 'J' || e.key === 'j' || e.keyCode === 74)) {
    e.preventDefault();
  }
  // Ctrl+U (Ver código fuente)
  if (e.ctrlKey && (e.key === 'U' || e.key === 'u' || e.keyCode === 85)) {
    e.preventDefault();
  }
});