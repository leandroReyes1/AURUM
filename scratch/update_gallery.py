import re
import os

html_file = r'c:\Users\reyes\Desktop\PROYECTOAURUM\AURUM\index.html'
images_dir = r'c:\Users\reyes\Desktop\PROYECTOAURUM\AURUM\assets\images\clinica'

images = [f for f in os.listdir(images_dir) if f.lower().endswith(('.jpg', '.jpeg', '.png'))]
images.sort()

def generate_block(block_num):
    html = f"\n        <!-- ================= BLOQUE {block_num} ================= -->\n"
    for i, img in enumerate(images):
        bg_class = "from-aurum-bg to-pink-50" if i % 2 == 0 else "from-gray-50 to-gray-100"
        html += f"""        <!-- Foto {i+1} -->
        <div class="w-72 h-48 md:w-80 md:h-56 bg-gradient-to-br {bg_class} rounded-2xl flex-shrink-0 flex flex-col items-center justify-center border border-gray-200 shadow-sm overflow-hidden group hover:scale-[1.15] hover:shadow-2xl hover:z-20 transition-all duration-500 cursor-pointer relative">
          <img src="./assets/images/clinica/{img}" alt="Clínica Aurum" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
        </div>
"""
    return html

new_content = "\n" + generate_block(1) + generate_block(2) + "      "

with open(html_file, 'r', encoding='utf-8') as f:
    content = f.read()

# Using regex to replace everything between <div class="animate-marquee ... px-3"> and its closing </div>
start_tag = '<div class="animate-marquee hover:[animation-play-state:paused] gap-6 px-3">'
start_idx = content.find(start_tag)

if start_idx != -1:
    end_idx = content.find('</div>', start_idx + len(start_tag))
    # Actually wait, there are no nested divs inside the track OTHER THAN the ones we are replacing.
    # We can just use regex.
    pattern = re.compile(r'(<div class="animate-marquee hover:\[animation-play-state:paused\] gap-6 px-3">).*?(      </div>\s*</div>\s*</section>)', re.DOTALL)
    
    new_html = pattern.sub(r'\1' + new_content + r'\2', content)
    
    with open(html_file, 'w', encoding='utf-8') as f:
        f.write(new_html)
    print("Successfully updated gallery!")
else:
    print("Could not find start tag.")
