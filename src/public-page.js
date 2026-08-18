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
const sexSelect = document.getElementById('form-sexo');

if (appointmentForm) {
  // Inicializar Choices.js para selects premium
  const choicesConfig = {
    searchEnabled: false,
    itemSelectText: '',
    shouldSort: false,
    position: 'bottom'
  };
  
  let studyChoices, timeChoices;
  try {
    studyChoices = new Choices(studySelect, choicesConfig);
    timeChoices = new Choices(timeSelect, choicesConfig);
    if (sexSelect) new Choices(sexSelect, choicesConfig);
  } catch (error) {
    console.warn("No se pudo cargar Choices.js. Se usarán selects nativos.", error);
  }

  // Remover 'required' para evitar que el navegador bloquee silenciosamente el submit
  studySelect.removeAttribute('required');
  timeSelect.removeAttribute('required');
  if (sexSelect) sexSelect.removeAttribute('required');
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
      
      const studyOptions = [{ value: '', label: 'Selecciona un estudio', placeholder: true }];
      studies.forEach(study => {
        studyOptions.push({ value: study.nombre_estudio, label: study.nombre_estudio });
      });
      
      studyChoices.setChoices(studyOptions, 'value', 'label', true);
      studyChoices.enable();
    } catch (error) {
      console.error("Error al cargar estudios:", error);
      studyChoices.setChoices([{ value: '', label: 'Error al cargar estudios', placeholder: true }], 'value', 'label', true);
    }
  };

  // 1. Inicializar el calendario (Flatpickr con estilo premium)
  if (typeof window.flatpickr !== 'undefined') {
    window.flatpickr(dateInput, {
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

      timeChoices.disable();
      timeChoices.clearStore();
      timeChoices.setChoices([{ value: '', label: 'Selecciona un horario', placeholder: true }], 'value', 'label', true);

      try {
        // 2. Consultar a la API los horarios ocupados
        const response = await fetch(`${API_BASE_URL}/horarios-disponibles?fecha=${dateStr}`);
        const bookedTimesArray = await response.json(); // e.g., ["09:30", "11:00"]

        // 3. Filtrar para obtener solo los horarios libres
        const freeTimes = ALL_AVAILABLE_TIMES.filter(time => !bookedTimesArray.includes(time));

        if (freeTimes.length > 0) {
          const timeOptions = [{ value: '', label: 'Selecciona un horario', placeholder: true }];
          freeTimes.forEach(time => timeOptions.push({ value: time, label: time }));
          timeChoices.clearStore();
          timeChoices.setChoices(timeOptions, 'value', 'label', true);
          timeChoices.enable();
        } else {
          timeChoices.clearStore();
          timeChoices.setChoices([{ value: '', label: 'No hay horarios libres', placeholder: true }], 'value', 'label', true);
        }
      } catch (error) {
        console.error("Error al cargar horarios:", error);
        timeChoices.clearStore();
        timeChoices.setChoices([{ value: '', label: 'Error al cargar', placeholder: true }], 'value', 'label', true);
      }
    }
  });
  } else {
    console.error("Flatpickr no cargó correctamente desde el CDN.");
  }

  // 4. Manejar el envío del formulario
  appointmentForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    submitButton.disabled = true;
    submitButton.textContent = 'Enviando...';

    const formData = {
      nombre_completo: document.getElementById('form-nombre').value,
      telefono: document.getElementById('form-telefono').value,
      edad: document.getElementById('form-edad').value,
      sexo: sexSelect ? sexSelect.value : '',
      correo: document.getElementById('form-correo').value,
      fecha_cita: dateInput.value,
      hora_cita: timeSelect.value,
      estudio: studySelect.value,
    };

    // Validación manual para los selects de Choices.js
    if (!formData.estudio || !formData.hora_cita) {
      alert("Por favor, asegúrate de seleccionar un Estudio y un Horario.");
      submitButton.disabled = false;
      submitButton.textContent = 'Confirmar Cita';
      return;
    }

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