import re
import os

with open('admin.html', 'r', encoding='utf-8') as f:
    content = f.read()

replacements = {
    r'\[Aquí va la imagen de: Inicio de Sesión\]': '<img src="./assets/images/servicios/01.png" alt="Inicio de Sesión" style="width: 100%; border-radius: 8px;">',
    r'\[Aquí va la imagen de: Tarjetas de Resumen\]': '<img src="./assets/images/servicios/02.png" alt="Tarjetas de Resumen" style="width: 100%; border-radius: 8px;">',
    r'\[Aquí va la imagen de: Barra de Búsqueda y Filtros\]': '<img src="./assets/images/servicios/04.png" alt="Búsqueda y Filtros" style="width: 100%; border-radius: 8px;">',
    r'\[Aquí va la imagen de: Detalles de Cita\]': '<img src="./assets/images/servicios/06.png" alt="Detalles de Cita" style="width: 100%; border-radius: 8px;">',
    r'\[Aquí va la imagen de: Nueva Cita Manual\]': '<img src="./assets/images/servicios/07.png" alt="Nueva Cita Manual" style="width: 100%; border-radius: 8px;">',
    r'\[Aquí va la imagen de: Estadísticas y Preparación Médica\]': '<img src="./assets/images/servicios/09.png" alt="Estadísticas" style="width: 100%; border-radius: 8px;">',
    r'\[Aquí va la imagen de: Historial Clínico\]': '<img src="./assets/images/servicios/11.png" alt="Historial Clínico" style="width: 100%; border-radius: 8px;">',
    r'\[Aquí va la imagen de: Cerrar Sesión\]': '<img src="./assets/images/servicios/12.png" alt="Cerrar Sesión" style="width: 100%; border-radius: 8px;">',
    r'\[Aquí va la imagen de: Menú de Navegación del Sitio\]': '<img src="./assets/images/servicios/14.png" alt="Menú de Navegación" style="width: 100%; border-radius: 8px;">',
    r'\[Aquí va la imagen de: Sobre Nosotros\]': '<img src="./assets/images/servicios/15.png" alt="Sobre Nosotros" style="width: 100%; border-radius: 8px;">',
    r'\[Aquí va la imagen de: Servicios\]': '<img src="./assets/images/servicios/16.png" alt="Nuestros Servicios" style="width: 100%; border-radius: 8px;">',
    r'\[Aquí va la imagen de: Encuéntranos\]': '<img src="./assets/images/servicios/17.png" alt="Encuéntranos" style="width: 100%; border-radius: 8px;">',
    r'\[Aquí va la imagen de: Galería\]': '<img src="./assets/images/servicios/18.png" alt="Galería" style="width: 100%; border-radius: 8px;">',
    r'\[Aquí va la imagen de: Formulario de Citas\]': '<img src="./assets/images/servicios/19.png" alt="Formulario de Citas" style="width: 100%; border-radius: 8px;">'
}

for pattern, replacement in replacements.items():
    content = re.sub(pattern, replacement, content)

content = re.sub(r'border: 2px dashed #cbd5e0;', r'border: 1px solid #e2e8f0;', content)
content = re.sub(r'padding: 3rem;', r'padding: 1rem;', content)

with open('admin.html', 'w', encoding='utf-8') as f:
    f.write(content)
