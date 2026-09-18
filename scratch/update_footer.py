import os

with open('admin.html', 'r', encoding='utf-8') as f:
    content = f.read()

old_footer = """          <div style="background-color: #1a0b2e; color: white; padding: 2rem; border-radius: 8px; text-align: center; margin-top: 3rem;">
            <h4 style="margin-bottom: 1rem; font-size: 1.1rem;">¡Tu panel está listo para usarse!</h4>
            <p style="margin-bottom: 2rem;">Cualquier duda adicional, contacta a soporte técnico.</p>
            <div style="border-top: 1px solid rgba(255,255,255,0.2); margin-top: 1rem; padding-top: 1.5rem;">
              <p style="font-size: 0.9rem; margin-bottom: 1rem;">Patrocinado y desarrollado por NAGUAL TECH STUDIO</p>
              <img src="./assets/images/logos/NAGUAL.png" alt="Nagual Tech Studio" style="max-width: 150px; display: inline-block;">
            </div>
          </div>"""

new_footer = """          <div style="background-color: #1a0b2e; color: rgba(255,255,255,0.85); padding: 1.5rem; border-radius: 8px; text-align: center; margin-top: 3rem; font-size: 0.85rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <p style="margin-bottom: 0.25rem; font-weight: 600; color: white; font-size: 0.95rem;">¡Tu panel está listo para usarse!</p>
            <p style="margin-bottom: 1rem;">¿Necesitas ayuda? Contacta a soporte técnico: <a href="mailto:contacto@nagualstudio.tech" style="color: #F48FB1; text-decoration: none; font-weight: 500;">contacto@nagualstudio.tech</a></p>
            
            <div style="border-top: 1px solid rgba(255,255,255,0.1); width: 60%; margin: 0.5rem auto 1rem auto;"></div>
            
            <p style="font-size: 0.75rem; margin-bottom: 0.5rem; letter-spacing: 0.5px; opacity: 0.6; text-transform: uppercase;">Patrocinado y desarrollado por</p>
            <img src="./assets/images/logos/NAGUAL.png" alt="Nagual Tech Studio" style="max-width: 90px; display: block; margin: 0 auto; opacity: 0.9;">
          </div>"""

if old_footer in content:
    content = content.replace(old_footer, new_footer)
else:
    print("Warning: old footer not found exactly as string")

with open('admin.html', 'w', encoding='utf-8') as f:
    f.write(content)
