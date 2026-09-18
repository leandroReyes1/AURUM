import os

with open('admin.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Move the manual button
button_html = """        <button class="menu-item" data-tab="manual-tab">
          <svg class="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
          <span>Manual de Usuario</span>
        </button>"""

if button_html in content:
    content = content.replace(button_html + "\n", "")
    content = content.replace(button_html, "")
    
    # insert it after the logout button
    logout_html = """          <span>Cerrar Sesión</span>
        </button>"""
    
    if logout_html in content:
        content = content.replace(logout_html, logout_html + "\n" + button_html)

# 2. Add the footer
footer_html = """          <div style="background-color: var(--color-aurum-purple-dark); color: white; padding: 2rem; border-radius: 8px; text-align: center; margin-top: 3rem;">
            <h4 style="margin-bottom: 1rem; font-size: 1.1rem;">¡Tu panel está listo para usarse!</h4>
            <p style="margin-bottom: 0.5rem;">Cualquier duda adicional, contacta a soporte técnico.</p>
          </div>
"""

new_footer_html = """          <div style="background-color: var(--color-aurum-purple-dark); color: white; padding: 2rem; border-radius: 8px; text-align: center; margin-top: 3rem;">
            <h4 style="margin-bottom: 1rem; font-size: 1.1rem;">¡Tu panel está listo para usarse!</h4>
            <p style="margin-bottom: 2rem;">Cualquier duda adicional, contacta a soporte técnico.</p>
            <div style="border-top: 1px solid rgba(255,255,255,0.2); margin-top: 1rem; padding-top: 1.5rem;">
              <p style="font-size: 0.9rem; margin-bottom: 1rem;">Patrocinado y desarrollado por NAGUAL TECH STUDIO</p>
              <img src="./assets/images/logos/NAGUAL.png" alt="Nagual Tech Studio" style="max-width: 150px; display: inline-block;">
            </div>
          </div>
"""

content = content.replace(footer_html, new_footer_html)

with open('admin.html', 'w', encoding='utf-8') as f:
    f.write(content)
