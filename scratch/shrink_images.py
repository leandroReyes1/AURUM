import os
import re

with open('admin.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Replace 09.png with 10.png in the statistics section
content = content.replace('09.png', '10.png')

# 2. Make specific images smaller. 
# They currently have: style="max-width: 600px; ...
# We want to change max-width to 300px for 01, 06, 07, 08, 12, 19

images_to_shrink = ['01.png', '06.png', '07.png', '08.png', '12.png', '19.png']

for img in images_to_shrink:
    # We look for the img tag with the specific src
    pattern = r'(<img src="\./assets/images/servicios/' + img + r'".*?style=")(max-width: 600px;)(.*?>)'
    content = re.sub(pattern, r'\1max-width: 300px;\3', content)

with open('admin.html', 'w', encoding='utf-8') as f:
    f.write(content)
