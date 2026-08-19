import sys

try:
    with open('index.html', 'r', encoding='utf-8') as f:
        lines = f.readlines()
        
    # Remove ' active' from line 78-79
    for i in range(70, 90):
        if 'transition-colors active"' in lines[i]:
            lines[i] = lines[i].replace(' active"', '"')
            
    # Extract section 'servicios'
    start_serv = -1
    end_serv = -1
    for i, l in enumerate(lines):
        if '<!-- NUESTROS SERVICIOS' in l:
            start_serv = i - 1
        if '<!-- AGENDAR CITA' in l:
            end_serv = i - 1
            break
            
    servicios_chunk = lines[start_serv:end_serv]
    del lines[start_serv:end_serv]
    
    # Insert before 'DATOS DE OPERACIÓN'
    target_idx = -1
    for i, l in enumerate(lines):
        if '<!-- DATOS DE OPERACIÓN' in l:
            target_idx = i - 1
            break
            
    lines = lines[:target_idx] + servicios_chunk + lines[target_idx:]
    
    with open('index.html', 'w', encoding='utf-8') as f:
        f.writelines(lines)
        
    print("Success")
except Exception as e:
    print(f"Error: {e}")
