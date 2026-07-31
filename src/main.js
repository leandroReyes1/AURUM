import { AppointmentService } from './appointments/AppointmentService.js';

document.addEventListener('DOMContentLoaded', () => {
  const appointmentService = new AppointmentService();
  const header = document.querySelector('.header');
  const navToggle = document.querySelector('.nav-toggle');
  const navMenu = document.querySelector('.nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');
  const ctaButton = document.querySelector('.nav-cta');
  
  // 1. Navbar style change on Scroll (Glassmorphism transition)
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
    
    highlightActiveSection();
  });

  // 2. Mobile Menu Toggle
  if (navToggle && navMenu) {
    navToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      navToggle.classList.toggle('open');
      navMenu.classList.toggle('open');
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (navMenu.classList.contains('open') && !navMenu.contains(e.target) && !navToggle.contains(e.target)) {
        navToggle.classList.remove('open');
        navMenu.classList.remove('open');
      }
    });
  }

  // Helper to get header height when shrunk (scrolled state) to ensure accurate scroll target
  function getHeaderScrollHeight() {
    if (!header) return 0;
    const wasScrolled = header.classList.contains('scrolled');
    if (!wasScrolled) {
      header.classList.add('scrolled');
    }
    const height = header.offsetHeight;
    if (!wasScrolled) {
      header.classList.remove('scrolled');
    }
    return height;
  }

  // 3. Smooth Scroll to Sections & Mobile Menu Auto-close for all local anchor links
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href === '#') return;
      
      const targetSection = document.querySelector(href);
      if (targetSection) {
        e.preventDefault();
        
        // Close mobile menu first if open
        if (navMenu && navMenu.classList.contains('open')) {
          navToggle.classList.remove('open');
          navMenu.classList.remove('open');
        }

        const headerHeight = getHeaderScrollHeight();
        const offsetTop = targetSection.offsetTop - headerHeight;
        
        window.scrollTo({
          top: offsetTop,
          behavior: 'smooth'
        });
      }
    });
  });

  // 5. Active Link Highlighting on Scroll
  function highlightActiveSection() {
    const scrollPosition = window.scrollY + header.offsetHeight + 100;
    
    // Check which section is currently on screen
    document.querySelectorAll('section[id]').forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const sectionId = section.getAttribute('id');
      
      if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
          }
        });
      }
    });
  }

  // 6. Top Bar Text Carousel Auto-rotation
  const slides = document.querySelectorAll('.top-bar-slide');
  if (slides.length > 0) {
    let currentSlide = 0;
    setInterval(() => {
      slides[currentSlide].classList.remove('active');
      currentSlide = (currentSlide + 1) % slides.length;
      slides[currentSlide].classList.add('active');
    }, 4500); // Rotates every 4.5 seconds for comfortable reading
  }

  // 7. Appointment Form & localStorage Integration
  const appointmentForm = document.getElementById('appointment-form');
  const bookingSuccess = document.getElementById('booking-success');
  
  if (appointmentForm && bookingSuccess) {
    const successStudy = document.getElementById('success-study');
    const successName = document.getElementById('success-name');
    const successDatetime = document.getElementById('success-datetime');
    const btnResetForm = document.getElementById('btn-reset-form');

    appointmentForm.addEventListener('submit', (e) => {
      e.preventDefault();

      // Extract form values
      const name = document.getElementById('client-name').value;
      const phone = document.getElementById('client-phone').value;
      const email = document.getElementById('client-email').value;
      const study = document.getElementById('study-type').value;
      const date = document.getElementById('appointment-date').value;
      const time = document.getElementById('appointment-time').value;
      const notes = document.getElementById('client-notes').value;

      // Create new appointment record using the service
      const appointment = appointmentService.createAppointment({
        name,
        phone,
        email,
        study,
        date,
        time,
        notes
      });

      // Show success feedback
      successStudy.textContent = study;
      successName.textContent = name;
      successDatetime.textContent = `${date} a las ${time}`;
      
      appointmentForm.style.display = 'none';
      bookingSuccess.style.display = 'block';

      // Scroll smoothly to success message
      const headerHeight = getHeaderScrollHeight();
      const offsetTop = document.getElementById('citas').offsetTop - headerHeight;
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      });
    });

    if (btnResetForm) {
      btnResetForm.addEventListener('click', () => {
        appointmentForm.reset();
        bookingSuccess.style.display = 'none';
        appointmentForm.style.display = 'block';
      });
    }
  }

  // Prepopulate localStorage with mock appointments if empty
  const mockInit = () => {
    if (appointmentService.getAllAppointments().length === 0) {
      const today = new Date().toISOString().split('T')[0];
      const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

      const mockData = [
        {
          id: 'APT-1042',
          name: 'Carlos Mendoza Ruiz',
          phone: '55 4321 0987',
          email: 'carlos.mendoza@email.com',
          study: 'Resonancia Magnética',
          date: today,
          time: '09:30 AM',
          notes: 'Paciente con prótesis de cadera de titanio certificada.',
          status: 'Confirmada',
          createdAt: new Date().toISOString()
        },
        {
          id: 'APT-2184',
          name: 'Beatriz Adriana Silva',
          phone: '55 9876 5432',
          email: 'beatriz.silva@email.com',
          study: 'Mastografía',
          date: today,
          time: '11:00 AM',
          notes: 'Mastografía anual de control preventivo.',
          status: 'Pendiente',
          createdAt: new Date().toISOString()
        },
        {
          id: 'APT-3759',
          name: 'Eduardo Vargas López',
          phone: '55 1122 3344',
          email: 'eduardo.vargas@email.com',
          study: 'Tomografía',
          date: tomorrow,
          time: '08:00 AM',
          notes: 'Requiere contraste intravenoso. Indicado ayuno de 6 horas.',
          status: 'Confirmada',
          createdAt: new Date().toISOString()
        },
        {
          id: 'APT-4981',
          name: 'Gloria Estefan Ramos',
          phone: '55 8899 7766',
          email: 'gloria.ramos@email.com',
          study: 'Ultrasonido Mamario',
          date: yesterday,
          time: '03:30 PM',
          notes: 'Derivada por mastografía con tejido mamario denso.',
          status: 'Completada',
          createdAt: new Date().toISOString()
        }
      ];
      appointmentService.repository.saveAll(mockData);
    }
  };
  mockInit();

  // 8. Initialize Custom Flatpickr Calendar
  if (typeof flatpickr !== 'undefined') {
    flatpickr("#appointment-date", {
      locale: "es",
      minDate: "today",
      dateFormat: "Y-m-d",
      disableMobile: "true"
    });
  }
});
