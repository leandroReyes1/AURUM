import os

with open('admin.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the undefined variable with a hardcoded dark purple
old_footer = 'style="background-color: var(--color-aurum-purple-dark); color: white; padding: 2rem; border-radius: 8px; text-align: center; margin-top: 3rem;"'
new_footer = 'style="background-color: #1a0b2e; color: white; padding: 2rem; border-radius: 8px; text-align: center; margin-top: 3rem;"'

content = content.replace(old_footer, new_footer)

with open('admin.html', 'w', encoding='utf-8') as f:
    f.write(content)
