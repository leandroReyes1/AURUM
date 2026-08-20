import os

files = ['admin.html', 'index.html', 'login.html']
target = '<link rel="icon" type="image/jpeg" href="./assets/images/logos/logo01.jpeg">'
replacement = '<link rel="icon" type="image/png" href="./assets/images/logos/logo01_round.png">'

for file in files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if target in content:
        content = content.replace(target, replacement)
        with open(file, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {file}")
    else:
        print(f"Could not find target string in {file}")
