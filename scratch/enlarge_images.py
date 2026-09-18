import os
import re

with open('admin.html', 'r', encoding='utf-8') as f:
    content = f.read()

images_to_enlarge = ['02.png', '04.png', '11.png', '14.png', '18.png']

for img in images_to_enlarge:
    pattern = r'(<img src="\./assets/images/servicios/' + img + r'".*?style=")(max-width: 600px;)(.*?>)'
    content = re.sub(pattern, r'\1max-width: 1000px;\3', content)

with open('admin.html', 'w', encoding='utf-8') as f:
    f.write(content)
