document.addEventListener('DOMContentLoaded', () => {
  const resetForm = document.getElementById('reset-password-form');
  const resetMessage = document.getElementById('reset-message');
  const submitBtn = document.querySelector('.login-btn');

  const API_AUTH_URL = 'http://localhost:5000/api/auth';

  // Extraer token de la URL (Ej: reset-password.html?token=12345)
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');

  if (!token) {
    resetMessage.textContent = 'Enlace inválido o expirado. Falta el token de seguridad.';
    resetMessage.style.display = 'block';
    submitBtn.disabled = true;
    return;
  }

  resetForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    if (newPassword !== confirmPassword) {
      resetMessage.textContent = 'Las contraseñas no coinciden.';
      resetMessage.style.backgroundColor = 'rgba(229, 62, 62, 0.1)';
      resetMessage.style.color = '#e53e3e';
      resetMessage.style.display = 'block';
      return;
    }

    resetMessage.style.display = 'none';
    submitBtn.disabled = true;
    submitBtn.textContent = 'Guardando...';

    try {
      const response = await fetch(`${API_AUTH_URL}/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token, newPassword })
      });

      const data = await response.json();

      if (response.ok) {
        resetMessage.textContent = '¡Contraseña actualizada! Redirigiendo al login...';
        resetMessage.style.backgroundColor = 'rgba(76, 175, 80, 0.1)';
        resetMessage.style.color = '#2e7d32';
        resetMessage.style.display = 'block';
        
        setTimeout(() => {
          window.location.href = './login.html';
        }, 2500);
      } else {
        resetMessage.textContent = data.error || 'Error al restablecer la contraseña';
        resetMessage.style.backgroundColor = 'rgba(229, 62, 62, 0.1)';
        resetMessage.style.color = '#e53e3e';
        resetMessage.style.display = 'block';
        submitBtn.disabled = false;
        submitBtn.textContent = 'Guardar Contraseña';
      }
    } catch (error) {
      console.error('Error de red:', error);
      resetMessage.textContent = 'No se pudo conectar con el servidor';
      resetMessage.style.backgroundColor = 'rgba(229, 62, 62, 0.1)';
      resetMessage.style.color = '#e53e3e';
      resetMessage.style.display = 'block';
      submitBtn.disabled = false;
      submitBtn.textContent = 'Guardar Contraseña';
    }
  });
});
