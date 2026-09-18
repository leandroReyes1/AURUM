import os
import re

with open('admin.html', 'r', encoding='utf-8') as f:
    content = f.read()

old_footer = """          <div style="background-color: #2d1b36; color: rgba(255,255,255,0.7); padding: 1.5rem; border-radius: 8px; margin-top: 3rem; display: flex; align-items: center; justify-content: center; gap: 1.5rem;">
            <p style="margin: 0; font-size: 0.9rem;">Patrocinado y desarrollado por NAGUAL TECH STUDIO</p>
            <img src="./assets/images/logos/NAGUAL.png" alt="Nagual Tech Studio" style="max-width: 90px; display: block;">
          </div>"""

new_footer = """          <div style="background-color: #2d1b36; color: rgba(255,255,255,0.7); padding: 1.5rem; border-radius: 8px; margin-top: 3rem; display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 1.5rem;">
            <p style="margin: 0; font-size: 0.9rem;">¿Soporte técnico? <a href="mailto:contacto@nagualstudio.tech" style="color: #F48FB1; text-decoration: none; font-weight: 500;">contacto@nagualstudio.tech</a></p>
            <div style="display: flex; align-items: center; gap: 1rem;">
              <p style="margin: 0; font-size: 0.9rem;">Patrocinado y desarrollado por NAGUAL TECH STUDIO</p>
              <img src="./assets/images/logos/NAGUAL.png" alt="Nagual Tech Studio" style="max-width: 90px; display: block;">
            </div>
          </div>"""

if old_footer in content:
    content = content.replace(old_footer, new_footer)
else:
    print("Warning: old footer not found exactly as string")

with open('admin.html', 'w', encoding='utf-8') as f:
    f.write(content)
