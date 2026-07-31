import { AppointmentService } from './appointments/AppointmentService.js';

document.addEventListener('DOMContentLoaded', () => {
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

  // DOM Elements - Table
  const appointmentsTbody = document.getElementById('appointments-tbody');
  const noDataMessage = document.getElementById('no-data-message');

  // DOM Elements - Modal
  const detailsModal = document.getElementById('details-modal');
  const btnCloseModal = document.getElementById('btn-close-modal');
  const detailName = document.getElementById('detail-name');
  const detailContact = document.getElementById('detail-contact');
  const detailStudy = document.getElementById('detail-study');
  const detailDatetime = document.getElementById('detail-datetime');
  const detailStatus = document.getElementById('detail-status');
  const detailNotes = document.getElementById('detail-notes');
  
  const btnModalConfirm = document.getElementById('btn-modal-confirm');
  const btnModalReschedule = document.getElementById('btn-modal-reschedule');
  const btnModalComplete = document.getElementById('btn-modal-complete');
  const btnModalCancel = document.getElementById('btn-modal-cancel');
  const btnSaveNotes = document.getElementById('btn-save-notes');

  // Reschedule Collapsible Elements
  const rescheduleSection = document.getElementById('reschedule-section');
  const rescheduleDate = document.getElementById('reschedule-date');
  const rescheduleTime = document.getElementById('reschedule-time');
  const btnCancelReschedule = document.getElementById('btn-cancel-reschedule');
  const btnSaveReschedule = document.getElementById('btn-save-reschedule');

  let activeAppointmentId = null;

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

    // Filter appointments
    const filtered = appointments.filter(apt => {
      const matchesSearch = 
        apt.name.toLowerCase().includes(query) ||
        apt.phone.includes(query) ||
        apt.email.toLowerCase().includes(query) ||
        apt.id.toLowerCase().includes(query);

      const matchesStudy = (studyFilter === 'All') || (apt.study === studyFilter);
      const matchesStatus = (statusFilter === 'All') || (apt.status === statusFilter);

      return matchesSearch && matchesStudy && matchesStatus;
    });

    // Clear previous rows
    appointmentsTbody.innerHTML = '';

    if (filtered.length === 0) {
      noDataMessage.style.display = 'block';
      return;
    }

    noDataMessage.style.display = 'none';

    // Sort: most recent or pending first
    filtered.sort((a, b) => new Date(b.date + 'T' + (b.time.includes('PM') ? '13:00' : '08:00')) - new Date(a.date + 'T' + (a.time.includes('PM') ? '13:00' : '08:00')));

    filtered.forEach(apt => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="font-weight: 700; color: var(--color-primary-light);">${apt.id}</td>
        <td>
          <div style="font-weight: 600;">${apt.name}</div>
          <div style="font-size: 0.75rem; color: var(--color-text-muted);">${apt.phone} | ${apt.email}</div>
        </td>
        <td><span style="font-weight: 500;">${apt.study}</span></td>
        <td>
          <div style="font-weight: 600;">${formatDateText(apt.date)}</div>
          <div style="font-size: 0.75rem; color: var(--color-text-muted);">${apt.time}</div>
        </td>
        <td>
          <span class="status-badge ${apt.status.toLowerCase()}">${apt.status}</span>
        </td>
        <td>
          <div class="action-buttons">
            ${apt.status === 'Pendiente' ? `
              <button class="btn-action confirm" title="Confirmar Cita" data-id="${apt.id}">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              </button>
            ` : ''}
            ${apt.status !== 'Cancelada' && apt.status !== 'Completada' ? `
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

    // Attach row button action listeners
    document.querySelectorAll('.btn-action.confirm').forEach(btn => {
      btn.addEventListener('click', () => updateAppointmentStatus(btn.getAttribute('data-id'), 'Confirmada'));
    });

    document.querySelectorAll('.btn-action.reschedule').forEach(btn => {
      btn.addEventListener('click', () => {
        openDetailsModal(btn.getAttribute('data-id'));
        if (rescheduleSection) {
          rescheduleSection.style.display = 'block';
        }
      });
    });

    document.querySelectorAll('.btn-action.cancel').forEach(btn => {
      btn.addEventListener('click', () => updateAppointmentStatus(btn.getAttribute('data-id'), 'Cancelada'));
    });

    document.querySelectorAll('.btn-action.view').forEach(btn => {
      btn.addEventListener('click', () => openDetailsModal(btn.getAttribute('data-id')));
    });
  };

  // Helper date text formatter (e.g. "2026-07-30" -> "30 Jul 2026")
  const formatDateText = (dateStr) => {
    try {
      const [year, month, day] = dateStr.split('-');
      const date = new Date(year, month - 1, day);
      const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      return `${parseInt(day)} ${months[date.getMonth()]} ${year}`;
    } catch (e) {
      return dateStr;
    }
  };

  // 5. Update Status Function
  const updateAppointmentStatus = (id, newStatus) => {
    const updated = appointmentService.updateStatus(id, newStatus);
    if (updated) {
      calculateMetrics();
      renderTable();
      
      // If modal is currently open with this appointment, update the modal text
      if (detailsModal.classList.contains('open') && activeAppointmentId === id) {
        detailStatus.textContent = newStatus;
        detailStatus.className = `detail-val status-badge ${newStatus.toLowerCase()}`;
        toggleModalActionButtons(newStatus);
      }
    }
  };

  // 6. Modal Control
  const openDetailsModal = (id) => {
    const apt = appointmentService.getAppointmentById(id);
    if (apt) {
      activeAppointmentId = id;
      detailName.textContent = apt.name;
      detailContact.textContent = `${apt.phone} | ${apt.email}`;
      detailStudy.textContent = apt.study;
      detailDatetime.textContent = `${formatDateText(apt.date)} a las ${apt.time}`;
      detailStatus.textContent = apt.status;
      detailStatus.className = `detail-val status-badge ${apt.status.toLowerCase()}`;
      detailNotes.value = apt.notes || '';

      // Reset reschedule section state
      if (rescheduleSection) {
        rescheduleSection.style.display = 'none';
      }
      if (rescheduleDate) {
        rescheduleDate.value = apt.date;
      }
      if (rescheduleTime) {
        rescheduleTime.value = apt.time;
      }

      toggleModalActionButtons(apt.status);

      detailsModal.classList.add('open');
    }
  };

  const closeDetailsModal = () => {
    detailsModal.classList.remove('open');
    activeAppointmentId = null;
  };

  const toggleModalActionButtons = (status) => {
    btnModalConfirm.style.display = (status === 'Pendiente') ? 'inline-block' : 'none';
    btnModalReschedule.style.display = (status !== 'Cancelada' && status !== 'Completada') ? 'inline-block' : 'none';
    btnModalComplete.style.display = (status === 'Confirmada') ? 'inline-block' : 'none';
    btnModalCancel.style.display = (status !== 'Cancelada' && status !== 'Completada') ? 'inline-block' : 'none';
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

  // Modal Actions Click Listeners
  btnModalConfirm.addEventListener('click', () => {
    if (activeAppointmentId) {
      updateAppointmentStatus(activeAppointmentId, 'Confirmada');
    }
  });

  btnModalComplete.addEventListener('click', () => {
    if (activeAppointmentId) {
      updateAppointmentStatus(activeAppointmentId, 'Completada');
    }
  });

  btnModalCancel.addEventListener('click', () => {
    if (activeAppointmentId) {
      updateAppointmentStatus(activeAppointmentId, 'Cancelada');
    }
  });

  btnSaveNotes.addEventListener('click', () => {
    if (activeAppointmentId) {
      const updated = appointmentService.updateNotes(activeAppointmentId, detailNotes.value);
      if (updated) {
        renderTable();
        alert('Notas guardadas correctamente.');
      }
    }
  });

  // Reschedule Action Event Listeners
  if (btnModalReschedule && rescheduleSection) {
    btnModalReschedule.addEventListener('click', () => {
      rescheduleSection.style.display = rescheduleSection.style.display === 'none' ? 'block' : 'none';
    });
  }

  if (btnCancelReschedule && rescheduleSection) {
    btnCancelReschedule.addEventListener('click', () => {
      rescheduleSection.style.display = 'none';
    });
  }

  if (btnSaveReschedule) {
    btnSaveReschedule.addEventListener('click', () => {
      if (activeAppointmentId) {
        const updated = appointmentService.reschedule(activeAppointmentId, rescheduleDate.value, rescheduleTime.value);
        if (updated) {
          calculateMetrics();
          renderTable();
          closeDetailsModal();
          alert('Cita reagendada con éxito.');
        }
      }
    });
  }

  // 8. Render Dynamic Analytics Chart
  const renderAnalyticsChart = () => {
    const studyChart = document.getElementById('study-chart');
    if (!studyChart) return;

    const counts = appointmentService.getStudyDistribution();
    const studies = ['Mastografía', 'Ultrasonido Mamario', 'Resonancia Magnética', 'Tomografía', 'Consulta Oncológica'];
    const maxCount = Math.max(...Object.values(counts), 1); // Avoid division by zero

    studyChart.innerHTML = '';

    studies.forEach(study => {
      const count = counts[study];
      const percent = Math.round((count / maxCount) * 100);

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

  // Initialize Page
  calculateMetrics();
  renderTable();

  // Initialize Custom Flatpickr Calendar for Rescheduling
  if (typeof flatpickr !== 'undefined') {
    flatpickr("#reschedule-date", {
      locale: "es",
      minDate: "today",
      dateFormat: "Y-m-d",
      disableMobile: "true"
    });
  }
});
