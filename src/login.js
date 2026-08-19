document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');
  const errorMessage = document.getElementById('error-message');
  const loginBtn = document.querySelector('.login-btn');

  // URL base de la API de autenticación (Puerto 5000 configurado en el backend de auth)
  const API_AUTH_URL = '/api/auth';

  // Lógica para mostrar/ocultar contraseña
  const togglePasswordBtn = document.getElementById('toggle-password');
  const passwordInput = document.getElementById('password');

  if (togglePasswordBtn && passwordInput) {
    togglePasswordBtn.addEventListener('click', () => {
      const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
      passwordInput.setAttribute('type', type);
      
      if (type === 'text') {
        togglePasswordBtn.innerHTML = `
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
            <line x1="1" y1="1" x2="23" y2="23"></line>
          </svg>
        `;
      } else {
        togglePasswordBtn.innerHTML = `
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
        `;
      }
    });
  }

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Ocultar mensaje de error previo
    errorMessage.style.display = 'none';
    loginBtn.disabled = true;
    loginBtn.innerHTML = 'Procesando...';

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    try {
      const response = await fetch(`${API_AUTH_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        // Importante: incluir credenciales para que el navegador reciba y guarde la cookie del token
        credentials: 'include', 
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        // Guardar el token manualmente en localStorage (evita problemas de bloqueo de cookies en navegadores)
        // El token ya se maneja automáticamente y de forma segura mediante Cookies HTTP-Only
        // Inicio de sesión exitoso, redirigir al dashboard
        window.location.href = './admin.html';
      } else {
        // Mostrar error si las credenciales son incorrectas
        errorMessage.textContent = data.error || 'Error al iniciar sesión';
        errorMessage.style.display = 'block';
      }
    } catch (error) {
      console.error('Error de red:', error);
      errorMessage.textContent = 'No se pudo conectar con el servidor de autenticación';
      errorMessage.style.display = 'block';
    } finally {
      // Restaurar el estado del botón
      loginBtn.disabled = false;
      loginBtn.innerHTML = `
        Ingresar
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="5" y1="12" x2="19" y2="12"></line>
          <polyline points="12 5 19 12 12 19"></polyline>
        </svg>
      `;
    }
  });

  // Lógica para mostrar/ocultar formularios
  const forgotPasswordForm = document.getElementById('forgot-password-form');
  const showForgotPasswordBtn = document.getElementById('show-forgot-password');
  const showLoginBtn = document.getElementById('show-login');
  const forgotMessage = document.getElementById('forgot-message');
  const forgotBtn = document.querySelector('.forgot-btn');

  showForgotPasswordBtn.addEventListener('click', (e) => {
    e.preventDefault();
    loginForm.style.display = 'none';
    forgotPasswordForm.style.display = 'block';
  });

  showLoginBtn.addEventListener('click', (e) => {
    e.preventDefault();
    forgotPasswordForm.style.display = 'none';
    loginForm.style.display = 'block';
    forgotMessage.style.display = 'none';
  });

  // Lógica para enviar el correo de recuperación
  forgotPasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    forgotMessage.style.display = 'none';
    forgotBtn.disabled = true;
    forgotBtn.textContent = 'Enviando...';

    const email = document.getElementById('forgot-email').value.trim();

    try {
      const response = await fetch(`${API_AUTH_URL}/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      forgotMessage.textContent = data.message || data.error;
      // Estilo de éxito
      forgotMessage.style.backgroundColor = response.ok ? 'rgba(76, 175, 80, 0.1)' : 'rgba(229, 62, 62, 0.1)';
      forgotMessage.style.color = response.ok ? '#2e7d32' : '#e53e3e';
      forgotMessage.style.display = 'block';

    } catch (error) {
      console.error('Error:', error);
      forgotMessage.textContent = 'Error al conectar con el servidor';
      forgotMessage.style.backgroundColor = 'rgba(229, 62, 62, 0.1)';
      forgotMessage.style.color = '#e53e3e';
      forgotMessage.style.display = 'block';
    } finally {
      forgotBtn.disabled = false;
      forgotBtn.textContent = 'Enviar enlace';
    }
  });
});
