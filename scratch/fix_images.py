import os

with open('admin.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the style for the manual images
old_style = 'style="width: 100%; border-radius: 8px;"'
new_style = 'style="max-width: 600px; width: 100%; height: auto; display: block; margin: 1rem auto; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); border: 1px solid #e2e8f0;"'

content = content.replace(old_style, new_style)

with open('admin.html', 'w', encoding='utf-8') as f:
    f.write(content)
