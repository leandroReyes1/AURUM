import re
import os

with open('admin.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Remove the credentials from the HTML
# The exact text varies, let's just find "Tus datos de acceso al Panel de Administración son:" 
# and remove it up to the end of the list.
content = re.sub(
    r'<p style=".*?">Tus datos de acceso al Panel de Administración son:.*?</p>.*?<ul>.*?<li>.*?Enlace de acceso:.*?</li>.*?<li>.*?Correo Electrónico:.*?</li>.*?<li>.*?Contraseña:.*?</li>.*?<li>.*?Enlace de panel público:.*?</li>.*?</ul>', 
    '', 
    content, 
    flags=re.DOTALL
)

# Also try a simpler regex just in case the formatting is different
content = re.sub(
    r'<p[^>]*>Tus datos de acceso al Panel de Administración son:</p>\s*<ul[^>]*>\s*<li[^>]*>.*?Enlace de acceso:.*?</li>\s*<li[^>]*>.*?Correo Electrónico:.*?</li>\s*<li[^>]*>.*?Contraseña:.*?</li>\s*<li[^>]*>.*?Enlace de panel público:.*?</li>\s*</ul>',
    '',
    content,
    flags=re.DOTALL
)

# And another one in case it was placed without <p> and <ul> (just text nodes)
content = re.sub(
    r'Tus datos de acceso al Panel de Administración son:.*?(?:reyesbri474@gmail\.com|admin#01|radioonco\.com\.mx).*?(?:<br>|\n|<p>|</li>)*',
    '',
    content,
    flags=re.DOTALL
)

# 2. Fix the image sizes
# Currently they are style="width: 100%; border-radius: 8px;"
# Let's change it to style="max-width: 800px; width: 100%; height: auto; display: block; margin: 1.5rem auto; border-radius: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);"
content = re.sub(
    r'style="width: 100%; border-radius: 8px;"',
    r'style="max-width: 800px; width: 100%; height: auto; display: block; margin: 2rem auto; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.08); border: 1px solid rgba(0,0,0,0.05);"',
    content
)

with open('admin.html', 'w', encoding='utf-8') as f:
    f.write(content)
