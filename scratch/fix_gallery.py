import os

html_path = r'c:\Users\reyes\Desktop\PROYECTOAURUM\AURUM\index.html'
clinica_dir = r'c:\Users\reyes\Desktop\PROYECTOAURUM\AURUM\assets\images\clinica'

files = [f for f in os.listdir(clinica_dir) if f.lower().endswith(('.jpg', '.jpeg', '.png'))]

div_template = '''        <div class="w-72 h-48 md:w-80 md:h-56 bg-gradient-to-br from-aurum-bg to-pink-50 rounded-2xl flex-shrink-0 flex flex-col items-center justify-center border border-gray-200 shadow-sm overflow-hidden group hover:scale-[1.15] hover:shadow-2xl hover:z-20 transition-all duration-500 cursor-pointer relative">
          <img src="./assets/images/clinica/{}" alt="Clínica Aurum" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
        </div>'''

bloque1 = '        <!-- ================= BLOQUE 1 ================= -->\n'
for i, f in enumerate(files):
    bloque1 += f'        <!-- Foto {i+1} -->\n' + div_template.format(f) + '\n'

bloque2 = '        <!-- ================= BLOQUE 2 ================= -->\n'
for i, f in enumerate(files):
    bloque2 += f'        <!-- Foto {i+1} -->\n' + div_template.format(f) + '\n'

replacement = bloque1 + '\n' + bloque2

with open(html_path, 'r', encoding='utf-8') as f:
    content = f.read()

start_marker = '        <!-- ================= BLOQUE 1 ================= -->'
end_marker = '            </div>\n    </div>'
start_idx = content.find(start_marker)
end_idx = content.find(end_marker, start_idx)

if start_idx != -1 and end_idx != -1:
    new_content = content[:start_idx] + replacement + content[end_idx:]
    with open(html_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print('Updated index.html successfully')
else:
    print('Could not find markers')
