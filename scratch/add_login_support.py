import os

with open('login.html', 'r', encoding='utf-8') as f:
    content = f.read()

# We want to add the support contact block before the closing </div> of the login-card.
# Looking at the file, the end of the login-card is:
"""
        <div style="text-align: center; margin-top: 1rem;">
          <a href="#" id="show-login" style="color: var(--color-text-muted, #718096); text-decoration: none; font-size: 0.9rem; font-weight: 600;">Volver al inicio de sesión</a>
        </div>
      </form>
    </div>
  </div>
"""

insert_text = """        <div style="text-align: center; margin-top: 1rem;">
          <a href="#" id="show-login" style="color: var(--color-text-muted, #718096); text-decoration: none; font-size: 0.9rem; font-weight: 600;">Volver al inicio de sesión</a>
        </div>
      </form>

      <div style="text-align: center; margin-top: 2rem; padding-top: 1rem; border-top: 1px solid #e2e8f0; font-size: 0.85rem; color: #718096;">
        ¿Problemas para acceder? <br> Contacta a <a href="mailto:contacto@nagualstudio.tech" style="color: var(--color-primary-light, #7c317f); text-decoration: none; font-weight: 600;">contacto@nagualstudio.tech</a>
      </div>
"""

content = content.replace(
"""        <div style="text-align: center; margin-top: 1rem;">
          <a href="#" id="show-login" style="color: var(--color-text-muted, #718096); text-decoration: none; font-size: 0.9rem; font-weight: 600;">Volver al inicio de sesin</a>
        </div>
      </form>""", 
insert_text.replace("sesión", "sesin") # using literal replacement for bad encoding just in case
)

# Alternative regex just in case
import re
content = re.sub(
    r'(</form>\s*</div>\s*</div>\s*<script)', 
    r'</form>\n\n      <div style="text-align: center; margin-top: 2rem; padding-top: 1rem; border-top: 1px solid #e2e8f0; font-size: 0.85rem; color: #718096;">\n        ¿Problemas para acceder? <br> Contacta a soporte: <a href="mailto:contacto@nagualstudio.tech" style="color: #7c317f; text-decoration: none; font-weight: 600;">contacto@nagualstudio.tech</a>\n      </div>\n    \1', 
    content
)

with open('login.html', 'w', encoding='utf-8') as f:
    f.write(content)
