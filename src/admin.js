import { AppointmentService } from './appointments/AppointmentService.js';

// URL base de la API de autenticación
const API_AUTH_URL = '/api/auth';

// Validar sesión antes de mostrar la página completa
async function checkAuth() {
  try {
    const response = await fetch(`${API_AUTH_URL}/verify`, {
      method: 'GET',
      credentials: 'include' // Envía automáticamente la cookie HTTP-Only segura
    });
    
    if (!response.ok) {
      // Redirigir al login si la sesión es inválida o expiró
      window.location.href = './login.html';
    } else {
      // Sesión válida, mostrar la página
      document.body.style.opacity = '1';
    }
  } catch (error) {
    console.error('Error al verificar sesión:', error);
    window.location.href = './login.html';
  }
}
checkAuth();

document.addEventListener('DOMContentLoaded', async () => {
  const appointmentService = new AppointmentService();
  // DOM Elements - Sidebar & Tabs
  const menuItems = document.querySelectorAll('.menu-item');
  const tabPanes = document.querySelectorAll('.tab-pane');
  const currentDateBadge = document.getElementById('current-date-badge');

  // DOM Elements - Metrics
  const statTotal = document.getElementById('stat-total');
  const statPending = document.getElementById('stat-pending');
  const statConfirmed = document.getElementById('stat-confirmed');
  const statRate = document.getElementById('stat-rate');

  // DOM Elements - Filters
  const searchInput = document.getElementById('search-input');
  const filterStudy = document.getElementById('filter-study');
  const filterStatus = document.getElementById('filter-status');

  // DOM Elements - Table (Panel Principal)
  const appointmentsTbody = document.getElementById('appointments-tbody');
  const noDataMessage = document.getElementById('no-data-message');

  // DOM Elements - Historial Clínico
  const historialTbody = document.getElementById('historial-tbody');
  const historialNoData = document.getElementById('historial-no-data');
  const historialSearchInput = document.getElementById('historial-search-input');
  const historialStatusFilter = document.getElementById('historial-status-filter');
  const historialDateFilter = document.getElementById('historial-date-filter');

  // DOM Elements - Modal
  const detailsModal = document.getElementById('details-modal');
  const btnCloseModal = document.getElementById('btn-close-modal');
  const detailName = document.getElementById('detail-name');
  const detailDatos = document.getElementById('detail-datos');
  const detailContact = document.getElementById('detail-contact');
  const detailStudy = document.getElementById('detail-study');
  const detailDateInput = document.getElementById('detail-date-input');
  const detailTimeInput = document.getElementById('detail-time-input');
  const detailStatusSelect = document.getElementById('detail-status-select');
  const detailNotes = document.getElementById('detail-notes');
  
  const btnSaveAllChanges = document.getElementById('btn-save-all-changes');

  // DOM Elements - New Appointment Modal
  const btnOpenNewApt = document.getElementById('btn-open-new-apt');
  const btnCloseNewApt = document.getElementById('btn-close-new-apt');
  const btnCancelNewApt = document.getElementById('btn-cancel-new-apt');
  const newAppointmentModal = document.getElementById('new-appointment-modal');
  const newAppointmentForm = document.getElementById('new-appointment-form');
  const newAptStudy = document.getElementById('new-apt-study');
  const newAptDate = document.getElementById('new-apt-date');
  const newAptTime = document.getElementById('new-apt-time');
  const newAptSex = document.getElementById('new-apt-sex');
  const btnSubmitNewApt = document.getElementById('btn-submit-new-apt');
  let activeAppointmentId = null;
  let currentHistorialFiltered = []; // Guardará las citas actualmente visibles en el historial
  let newAptSexChoices = null;

  // Inicializar Flatpickr para el input de fecha del modal
  flatpickr('#detail-date-input', {
    locale: "es",
    dateFormat: "Y-m-d"
  });

  // Inicializar Flatpickr para el filtro de historial
  const fpHistorial = flatpickr('#historial-date-filter', {
    locale: "es",
    dateFormat: "Y-m-d",
    onChange: function(selectedDates, dateStr, instance) {
      renderHistorialTable();
    }
  });

  // Configuración base de Choices.js
  const choicesConfig = {
    searchEnabled: false,
    itemSelectText: '',
    shouldSort: false,
    position: 'bottom'
  };

  // Inicializar selectores estáticos con Choices.js
  let filterStudyChoices, newAptStudyChoices, filterStatusChoices, historialStatusChoices;
  let detailTimeChoices, detailStatusChoices, newAptTimeChoices;

  if (filterStudy) filterStudyChoices = new Choices(filterStudy, choicesConfig);
  if (filterStatus) filterStatusChoices = new Choices(filterStatus, choicesConfig);
  if (historialStatusFilter) historialStatusChoices = new Choices(historialStatusFilter, choicesConfig);
  if (newAptStudy) newAptStudyChoices = new Choices(newAptStudy, choicesConfig);
  if (detailTimeInput) detailTimeChoices = new Choices(detailTimeInput, choicesConfig);
  if (detailStatusSelect) detailStatusChoices = new Choices(detailStatusSelect, choicesConfig);
  if (newAptTime) {
    newAptTimeChoices = new Choices(newAptTime, choicesConfig);
    newAptTime.removeAttribute('required');
  }

  // Si hay selects requeridos, quitar el required para no bloquear el submit silenciosamente
  if (newAptStudy) newAptStudy.removeAttribute('required');
  if (newAptSex) {
    newAptSexChoices = new Choices(newAptSex, choicesConfig);
    newAptSex.removeAttribute('required');
  }

  const ALL_AVAILABLE_TIMES = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "12:00", "12:30", "13:00", "13:30"
  ];
  const API_BASE_URL = '/api';

  if (document.getElementById('new-apt-date')) {
    flatpickr('#new-apt-date', {
      locale: "es",
      minDate: "today",
      dateFormat: "Y-m-d",
      disable: [
        function (date) {
          return (date.getDay() === 0 || date.getDay() === 6);
        }
      ],
      onChange: async function (selectedDates, dateStr, instance) {
        if (!dateStr) return;
        newAptTimeChoices.disable();
        newAptTimeChoices.clearStore();
        newAptTimeChoices.setChoices([{ value: '', label: 'Selecciona un horario', placeholder: true }], 'value', 'label', true);

        try {
          const response = await fetch(`${API_BASE_URL}/horarios-disponibles?fecha=${dateStr}`);
          const bookedTimesArray = await response.json();

          const freeTimes = ALL_AVAILABLE_TIMES.filter(time => !bookedTimesArray.includes(time));

          if (freeTimes.length > 0) {
            const timeOptions = [{ value: '', label: 'Selecciona un horario', placeholder: true }];
            freeTimes.forEach(time => timeOptions.push({ value: time, label: time }));
            newAptTimeChoices.clearStore();
            newAptTimeChoices.setChoices(timeOptions, 'value', 'label', true);
            newAptTimeChoices.enable();
          } else {
            newAptTimeChoices.clearStore();
            newAptTimeChoices.setChoices([{ value: '', label: 'No hay horarios libres', placeholder: true }], 'value', 'label', true);
          }
        } catch (error) {
          console.error("Error al cargar horarios:", error);
          newAptTimeChoices.clearStore();
          newAptTimeChoices.setChoices([{ value: '', label: 'Error al cargar', placeholder: true }], 'value', 'label', true);
        }
      }
    });
  }

  // 1. Current Date Header
  const updateCurrentDate = () => {
    if (currentDateBadge) {
      const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      const today = new Date();
      // Capitalize first letter
      let dateString = today.toLocaleDateString('es-ES', options);
      dateString = dateString.charAt(0).toUpperCase() + dateString.slice(1);
      currentDateBadge.textContent = dateString;
    }
  };
  updateCurrentDate();

  // 2. Tab Navigation
  menuItems.forEach(item => {
    item.addEventListener('click', () => {
      const targetTab = item.getAttribute('data-tab');

      // Update sidebar active status
      menuItems.forEach(btn => btn.classList.remove('active'));
      item.classList.add('active');

      // Update tab content active status
      tabPanes.forEach(pane => {
        pane.classList.remove('active');
        if (pane.getAttribute('id') === targetTab) {
          pane.classList.add('active');
        }
      });

      // If switching to analytics, trigger chart animate rendering
      if (targetTab === 'analytics-tab') {
        renderAnalyticsChart();
      }
    });
  });

  // 3. Update Stats & Metrics
  const calculateMetrics = () => {
    const metrics = appointmentService.getMetrics();
    statTotal.textContent = metrics.total;
    statPending.textContent = metrics.pending;
    statConfirmed.textContent = metrics.confirmed;
    statRate.textContent = `${metrics.rate}%`;
  };

  // 4. Render Table Rows with dynamic filters
  const renderTable = () => {
    const appointments = appointmentService.getAllAppointments();
    const query = searchInput.value.toLowerCase().trim();
    const studyFilter = filterStudy.value;
    const statusFilter = filterStatus.value;

    // Filtrar citas
    const filtered = appointments.filter(apt => {
      const matchesSearch = 
        (apt.nombre_paciente && apt.nombre_paciente.toLowerCase().includes(query)) ||
        (apt.telefono && apt.telefono.includes(query)) ||
        (apt.email && apt.email.toLowerCase().includes(query)) ||
        apt.id.toLowerCase().includes(query);

      const matchesStudy = (studyFilter === 'All') || (apt.estudio === studyFilter);
      const matchesStatus = (statusFilter === 'All') || (apt.estado === statusFilter);
      const isDashboardStatus = apt.estado === 'Pendiente' || apt.estado === 'Confirmada';
      
      let isFuture = true;
      if (apt.fecha_cita) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        // split('T')[0] ensures we parse local midnight, avoiding timezone shifts
        const aptDate = new Date(apt.fecha_cita.split('T')[0] + 'T00:00:00'); 
        isFuture = aptDate >= today;
      }

      return matchesSearch && matchesStudy && matchesStatus && isDashboardStatus && isFuture;
    });

    // Limpiar filas anteriores
    appointmentsTbody.innerHTML = '';

    if (filtered.length === 0) {
      noDataMessage.style.display = 'block';
      return;
    }

    noDataMessage.style.display = 'none';

    // Ordenar: citas más próximas primero (por fecha y hora)
    filtered.sort((a, b) => {
      // Manejar valores nulos si los hay
      if (!a.fecha_cita) return 1;
      if (!b.fecha_cita) return -1;
      const dateA = new Date(a.fecha_cita.split('T')[0] + 'T' + a.hora_cita);
      const dateB = new Date(b.fecha_cita.split('T')[0] + 'T' + b.hora_cita);
      return dateA - dateB;
    });

    filtered.forEach(apt => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="font-weight: 700; color: var(--color-primary-light);">${apt.id}</td>
        <td>
          <div style="font-weight: 600;">${apt.nombre_paciente || 'N/A'}</div>
          <div style="font-size: 0.75rem; color: var(--color-text-muted);">${apt.telefono || ''} | ${apt.email || ''}</div>
        </td>
        <td><span style="font-weight: 500;">${apt.estudio}</span></td>
        <td>
          <div style="font-weight: 600;">${formatDateText(apt.fecha_cita)}</div>
          <div style="font-size: 0.75rem; color: var(--color-text-muted);">${formatTime(apt.hora_cita)}</div>
        </td>
        <td>
          <span class="status-badge ${apt.estado.toLowerCase()}">${apt.estado}</span>
        </td>
        <td>
          <div class="action-buttons">
            ${apt.estado === 'Pendiente' ? `
              <button class="btn-action confirm" title="Confirmar Cita" data-id="${apt.id}">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              </button>
            ` : ''}
            ${apt.estado !== 'Cancelada' && apt.estado !== 'Completada' ? `
              <button class="btn-action reschedule" title="Reagendar Cita" data-id="${apt.id}">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8v4l3 3m6-3a9 9 0 11-9-9 9 9 0 019 9z"></path></svg>
              </button>
              <button class="btn-action cancel" title="Cancelar Cita" data-id="${apt.id}">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            ` : ''}
            <button class="btn-action view" title="Ver Detalles y Notas" data-id="${apt.id}">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
            </button>
          </div>
        </td>
      `;
      appointmentsTbody.appendChild(tr);
    });

    // Asignar listeners a los botones de acción
    document.querySelectorAll('.btn-action.confirm').forEach(btn => {
      btn.addEventListener('click', (e) => { e.stopPropagation(); updateAppointmentStatus(btn.getAttribute('data-id'), 'Confirmada'); });
    });

    document.querySelectorAll('.btn-action.reschedule').forEach(btn => {
      btn.addEventListener('click', (e) => { e.stopPropagation();
        openDetailsModal(btn.getAttribute('data-id'));
        // Eliminado la referencia a rescheduleSection ya que el modal de detalles se encarga de esto.
      });
    });

    document.querySelectorAll('.btn-action.cancel').forEach(btn => {
      btn.addEventListener('click', (e) => { e.stopPropagation(); updateAppointmentStatus(btn.getAttribute('data-id'), 'Cancelada'); });
    });

    document.querySelectorAll('.btn-action.view').forEach(btn => {
      btn.addEventListener('click', () => openDetailsModal(btn.getAttribute('data-id')));
    });
  };

  // Helper date text formatter (e.g. "2026-07-30" -> "30 Jul 2026")
  const formatDateText = (dateStr) => {
    if (!dateStr) return 'Fecha no asignada';
    try {
      const dateOnly = dateStr.split('T')[0];
      const [year, month, day] = dateOnly.split('-');
      const date = new Date(year, month - 1, day);
      const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      return `${parseInt(day)} ${months[date.getMonth()]} ${year}`;
    } catch (e) {
      return dateStr;
    }
  };

  // Helper time formatter (e.g. "09:30:00" -> "09:30")
  const formatTime = (timeStr) => {
    if (!timeStr || typeof timeStr !== 'string') return '';
    // Splits "09:30:00" and takes the first two parts
    const parts = timeStr.split(':');
    if (parts.length < 2) return timeStr;
    return `${parts[0]}:${parts[1]}`;
  };

  // 5. Update Status Function
  const updateAppointmentStatus = async (id, newStatus) => {
    const updated = await appointmentService.updateStatus(id, newStatus);
    if (updated) {
      calculateMetrics();
      renderTable();
      renderHistorialTable();
      
      // If modal is currently open with this appointment, update the modal text
      if (detailsModal.classList.contains('open') && activeAppointmentId === id) {
        detailStatusSelect.value = updated.estado;
      }
    }
  };

  // 6. Modal Control
  const openDetailsModal = (id) => {
    const apt = appointmentService.getAppointmentById(id);
    if (apt) {
      activeAppointmentId = id;
      detailName.textContent = apt.nombre_paciente;
      detailDatos.textContent = `${apt.edad ? apt.edad + ' años' : 'Edad N/A'} | ${apt.sexo || 'Sexo N/A'}`;
      detailContact.textContent = `${apt.telefono || ''} | ${apt.email || ''}`;
      detailStudy.textContent = apt.estudio;
      detailDateInput.value = apt.fecha_cita ? apt.fecha_cita.split('T')[0] : '';
      detailTimeInput.value = formatTime(apt.hora_cita);
      detailStatusSelect.value = apt.estado;
      detailNotes.value = apt.notas_admin || '';

      detailsModal.classList.add('open');
    }
  };

  const closeDetailsModal = () => {
    detailsModal.classList.remove('open');
    activeAppointmentId = null;
  };

  if (btnCloseModal) {
    btnCloseModal.addEventListener('click', closeDetailsModal);
  }

  // Click outside to close modal
  window.addEventListener('click', (e) => {
    if (e.target === detailsModal) {
      closeDetailsModal();
    }
  });

  // Save all changes button
  btnSaveAllChanges.addEventListener('click', async () => {
    if (!activeAppointmentId) return;
    
    // Usamos el servicio existente enviando el objeto directo
    // Wait, let's use the API directly since updateStatus only updates 'estado'
    // Let's create an updateAll function inside the listener for simplicity or use appointmentService.updateStatus
    // since we can just send multiple fields using the same endpoint logic if we modify appointmentService!
    const fieldsToUpdate = {
      fecha_cita: detailDateInput.value,
      hora_cita: detailTimeInput.value,
      estado: detailStatusSelect.value,
      notas_admin: detailNotes.value
    };

    try {
      const API_BASE_URL = '/api';
      const response = await fetch(`${API_BASE_URL}/citas/${activeAppointmentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fieldsToUpdate),
      });

      if (response.ok) {
        const updated = await response.json();
        const index = appointmentService.appointments.findIndex(a => a.id === updated.id);
        if (index !== -1) {
          appointmentService.appointments[index] = updated;
        }
        calculateMetrics();
        renderTable();
        renderHistorialTable();
        closeDetailsModal();
      } else {
        console.error('Error al guardar los cambios.');
      }
    } catch (error) {
      console.error(error);
    }
  });

  // 8. Render Dynamic Analytics Chart
  const renderAnalyticsChart = () => {
    const studyChart = document.getElementById('study-chart');
    if (!studyChart) return;

    const counts = appointmentService.getStudyDistribution();
    const studies = Object.keys(counts);
    const maxCount = Math.max(...Object.values(counts), 1); // Avoid division by zero

    studyChart.innerHTML = '';

    studies.forEach(study => {
      const count = counts[study];
      const percent = count > 0 ? Math.max(5, Math.round((count / maxCount) * 100)) : 0; // Mínimo 5% para visibilidad

      const barGroup = document.createElement('div');
      barGroup.className = 'chart-bar-group';
      barGroup.innerHTML = `
        <div class="chart-label-row">
          <span>${study}</span>
          <span style="font-weight: 700; color: var(--color-primary-light);">${count} ${count === 1 ? 'cita' : 'citas'}</span>
        </div>
        <div class="chart-bar-container">
          <div class="chart-bar-fill" style="width: 0%"></div>
        </div>
      `;
      studyChart.appendChild(barGroup);

      // Animate transition on display
      setTimeout(() => {
        const fill = barGroup.querySelector('.chart-bar-fill');
        if (fill) {
          fill.style.width = `${percent}%`;
        }
      }, 100);
    });
  };

  // 9. Attach Filter and Search Event Listeners
  searchInput.addEventListener('input', renderTable);
  filterStudy.addEventListener('change', renderTable);
  filterStatus.addEventListener('change', renderTable);

  if (historialSearchInput) historialSearchInput.addEventListener('input', renderHistorialTable);
  if (historialStatusFilter) historialStatusFilter.addEventListener('change', renderHistorialTable);

  // 10. Clickable Stat Cards for Filtering
  const cardTotal = document.getElementById('card-total');
  const cardPending = document.getElementById('card-pending');
  const cardConfirmed = document.getElementById('card-confirmed');

  if (cardTotal) {
    cardTotal.addEventListener('click', () => {
      // Al cliquear total, solo filtramos pendientes y confirmadas
      filterStatusChoices.setChoiceByValue('All');
      renderTable();
    });
  }
  if (cardPending) {
    cardPending.addEventListener('click', () => {
      filterStatusChoices.setChoiceByValue('Pendiente');
      renderTable();
    });
  }
  if (cardConfirmed) {
    cardConfirmed.addEventListener('click', () => {
      filterStatusChoices.setChoiceByValue('Confirmada');
      renderTable();
    });
  }

  // 11. Render Tabla del Historial
  function renderHistorialTable() {
    if (!historialTbody) return;
    
    const appointments = appointmentService.getAllAppointments();
    const query = historialSearchInput.value.toLowerCase().trim();
    const statusFilter = historialStatusFilter.value;
    const dateFilter = historialDateFilter.value; // YYYY-MM-DD

    const filtered = appointments.filter(apt => {
      const matchesSearch = 
        (apt.nombre_paciente && apt.nombre_paciente.toLowerCase().includes(query)) ||
        (apt.telefono && apt.telefono.includes(query)) ||
        (apt.email && apt.email.toLowerCase().includes(query)) ||
        apt.id.toLowerCase().includes(query);

      const matchesStatus = (statusFilter === 'All') || (apt.estado === statusFilter);
      
      let matchesDate = true;
      if (dateFilter && apt.fecha_cita) {
        matchesDate = apt.fecha_cita.split('T')[0] === dateFilter;
      }

      return matchesSearch && matchesStatus && matchesDate;
    });

    historialTbody.innerHTML = '';

    if (filtered.length === 0) {
      historialNoData.style.display = 'block';
      return;
    }

    historialNoData.style.display = 'none';

    // Ordenar historial: las más recientes en el tiempo (arriba las fechas más lejanas, o abajo)
    // Usaremos fecha descendente (las más recientes completadas primero)
    filtered.sort((a, b) => {
      if (!a.fecha_cita) return 1;
      if (!b.fecha_cita) return -1;
      const dateA = new Date(a.fecha_cita.split('T')[0] + 'T' + a.hora_cita);
      const dateB = new Date(b.fecha_cita.split('T')[0] + 'T' + b.hora_cita);
      return dateB - dateA;
    });

    currentHistorialFiltered = filtered; // Guardar referencia para el PDF

    filtered.forEach(apt => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="font-weight: 700; color: var(--color-primary-light);">${apt.id}</td>
        <td>
          <div style="font-weight: 600;">${apt.nombre_paciente || 'N/A'}</div>
          <div style="font-size: 0.75rem; color: var(--color-text-muted);">${apt.telefono || ''} | ${apt.email || ''}</div>
        </td>
        <td><span style="font-weight: 500;">${apt.estudio}</span></td>
        <td>
          <div style="font-weight: 600;">${formatDateText(apt.fecha_cita)}</div>
          <div style="font-size: 0.75rem; color: var(--color-text-muted);">${formatTime(apt.hora_cita)}</div>
        </td>
        <td>
          <span class="status-badge ${apt.estado.toLowerCase()}">${apt.estado}</span>
        </td>
        <td>
          <div class="action-buttons">
            <button class="btn-action view" title="Ver Detalles y Notas" data-id="${apt.id}">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
            </button>
          </div>
        </td>
      `;
      historialTbody.appendChild(tr);
    });

    // Asignar listener solo al botón view en historial
    historialTbody.querySelectorAll('.btn-action.view').forEach(btn => {
      btn.addEventListener('click', () => openDetailsModal(btn.getAttribute('data-id')));
    });
  }

  // 12. Generación de Reporte PDF
  const btnDownloadPdf = document.getElementById('btn-download-pdf');
  if (btnDownloadPdf) {
    btnDownloadPdf.addEventListener('click', () => {
      if (currentHistorialFiltered.length === 0) {
        alert("No hay datos en la tabla para exportar.");
        return;
      }

      const { jsPDF } = window.jspdf;
      const doc = new jsPDF('landscape'); // Horizontal para que quepan bien las columnas

      // Estilos corporativos AURUM
      const primaryColor = [74, 21, 75]; // #4A154B
      
      // Título y Logo
      const logoImg = document.querySelector('.sidebar-logo');
      let startY = 35;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);

      try {
        if (logoImg) {
          const canvas = document.createElement('canvas');
          // Usar tamaño de renderizado para evitar problemas con SVGs sin viewBox
          canvas.width = logoImg.clientWidth || 200;
          canvas.height = logoImg.clientHeight || 50;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(logoImg, 0, 0, canvas.width, canvas.height);
          const imgData = canvas.toDataURL('image/png');
          
          const imgRatio = canvas.width / canvas.height;
          const renderHeight = 15;
          const renderWidth = renderHeight * imgRatio;

          doc.addImage(imgData, 'PNG', 14, 12, renderWidth, renderHeight);
          
          // Textos al lado del logo
          doc.text("Reporte de Historial Clínico", 14 + renderWidth + 10, 20);
          
          doc.setFont("helvetica", "normal");
          doc.setFontSize(10);
          doc.setTextColor(100, 100, 100);
          const fechaReporte = new Date().toLocaleString('es-ES', { dateStyle: 'medium', timeStyle: 'short' });
          doc.text(`Generado el: ${fechaReporte}`, 14 + renderWidth + 10, 26);
          startY = 35;
        } else {
          throw new Error("No logo");
        }
      } catch (e) {
        // Fallback si no se puede dibujar el logo (canvas tainted o logo ausente)
        doc.text("AURUM | Reporte de Historial Clínico", 14, 20);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        const fechaReporte = new Date().toLocaleString('es-ES', { dateStyle: 'medium', timeStyle: 'short' });
        doc.text(`Generado el: ${fechaReporte}`, 14, 28);
        startY = 35;
      }

      // Definir columnas y filas para AutoTable
      const tableColumn = ["Código", "Paciente", "Contacto", "Estudio", "Fecha", "Hora", "Estado"];
      const tableRows = [];

      currentHistorialFiltered.forEach(apt => {
        const rowData = [
          apt.id,
          apt.nombre_paciente || 'N/A',
          `${apt.telefono || '-'} / ${apt.email || '-'}`,
          apt.estudio,
          formatDateText(apt.fecha_cita),
          formatTime(apt.hora_cita),
          apt.estado
        ];
        tableRows.push(rowData);
      });

      // Dibujar tabla
      doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: startY,
        theme: 'striped',
        headStyles: { 
          fillColor: primaryColor,
          textColor: 255,
          fontStyle: 'bold'
        },
        alternateRowStyles: {
          fillColor: [248, 249, 252] // Color bg-main de Aurum
        },
        styles: {
          font: 'helvetica',
          fontSize: 9,
          cellPadding: 4
        }
      });

      // Guardar PDF
      const dateName = new Date().toISOString().split('T')[0];
      doc.save(`Aurum_Historial_${dateName}.pdf`);
    });
  }

  // Función de inicialización asíncrona
  const initializeApp = async () => {
    const estudios = await appointmentService.fetchEstudios();
    if (filterStudy && estudios && estudios.length > 0) {
      const allStudiesOptions = [{ value: 'All', label: 'Todos los Estudios', placeholder: true }];
      const newAptStudyOptions = [{ value: '', label: 'Selecciona un estudio', placeholder: true }];

      estudios.forEach(estudio => {
        allStudiesOptions.push({ value: estudio.nombre_estudio, label: estudio.nombre_estudio });
        newAptStudyOptions.push({ value: estudio.nombre_estudio, label: estudio.nombre_estudio });
      });

      if (filterStudyChoices) filterStudyChoices.setChoices(allStudiesOptions, 'value', 'label', true);
      if (newAptStudyChoices) newAptStudyChoices.setChoices(newAptStudyOptions, 'value', 'label', true);
    }

    await appointmentService.fetchAppointments(); // Cargar datos de la API
    calculateMetrics();
    renderTable();
    renderHistorialTable();
  };

  initializeApp();

  // Initialize Custom Flatpickr Calendar for Rescheduling
  if (typeof flatpickr !== 'undefined') {
    flatpickr("#reschedule-date", {
      locale: "es",
      minDate: "today",
      dateFormat: "Y-m-d",
      disableMobile: "true"
    });
  }

  // 13. Lógica para Registrar Nueva Cita Manualmente
  const openNewAptModal = () => {
    newAppointmentForm.reset();
    if (newAptStudyChoices) newAptStudyChoices.setChoiceByValue('');
    if (newAptSexChoices) newAptSexChoices.setChoiceByValue('');
    if (newAptTimeChoices) {
      newAptTimeChoices.disable();
      newAptTimeChoices.clearStore();
      newAptTimeChoices.setChoices([{ value: '', label: 'Selecciona un horario', placeholder: true }], 'value', 'label', true);
    }
    newAppointmentModal.classList.add('open');
  };

  const closeNewAptModal = () => {
    newAppointmentModal.classList.remove('open');
  };

  if (btnOpenNewApt) btnOpenNewApt.addEventListener('click', openNewAptModal);
  if (btnCloseNewApt) btnCloseNewApt.addEventListener('click', closeNewAptModal);
  if (btnCancelNewApt) btnCancelNewApt.addEventListener('click', closeNewAptModal);

  window.addEventListener('click', (e) => {
    if (e.target === newAppointmentModal) closeNewAptModal();
  });

  if (newAppointmentForm) {
    newAppointmentForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const studyVal = newAptStudy.value;
      const timeVal = newAptTime.value;

      if (!studyVal || !timeVal) {
        alert("Por favor, asegúrate de seleccionar un Estudio y un Horario.");
        return;
      }

      btnSubmitNewApt.disabled = true;
      btnSubmitNewApt.textContent = 'Guardando...';

      const formData = {
        nombre_completo: document.getElementById('new-apt-name').value.trim(),
        telefono: document.getElementById('new-apt-phone').value.trim(),
        correo: document.getElementById('new-apt-email').value.trim(),
        estudio: studyVal,
        fecha_cita: newAptDate.value,
        hora_cita: timeVal,
        edad: document.getElementById('new-apt-age').value.trim(),
        sexo: newAptSex ? newAptSex.value : ''
      };

      try {
        const response = await fetch(`${API_BASE_URL}/citas`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });

        if (response.ok) {
          closeNewAptModal();
          await appointmentService.fetchAppointments();
          calculateMetrics();
          renderTable();
          renderHistorialTable();
        } else {
          const err = await response.json();
          alert('Error al guardar cita: ' + (err.message || 'Intente de nuevo.'));
        }
      } catch (error) {
        console.error('Error:', error);
        alert('Error de conexión.');
      } finally {
        btnSubmitNewApt.disabled = false;
        btnSubmitNewApt.textContent = 'Registrar Cita';
      }
    });
  }

  // 14. Lógica de Cerrar Sesión
  const btnLogout = document.getElementById('btn-logout');
  if (btnLogout) {
    btnLogout.addEventListener('click', async (e) => {
      e.preventDefault();
      try {
        await fetch(`${API_AUTH_URL}/logout`, {
          method: 'POST',
          credentials: 'include'
        });
      } catch (error) {
        console.error('Error al cerrar sesión', error);
      } finally {
        window.location.href = './login.html';
      }
    });
  }
});

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
