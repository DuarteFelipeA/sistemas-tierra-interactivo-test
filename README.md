# Sistemas de la Tierra – Interactivo (cono + JSON extendido, intento único)

Este paquete presenta los sistemas de la Tierra como **segmentos de un cono** (desde el centro hasta el espacio) y carga **actividades** desde archivos **JSON**. Incluye **todos los tipos** y **bloqueo tras el primer intento**.

## Tipos de actividades soportados
- `multiple` (opción múltiple)
- `truefalse` (verdadero/falso)
- `order` (ordenar pasos con arrastrar/soltar)
- `match` (emparejar con select)
- `cloze` (completar espacios con `{{respuesta|alternativa}}`)
- `hotspots` (arrastrar etiquetas a zonas sobre una imagen)
- `bank` (banco de preguntas aleatorio con puntaje)

## Intento único
Al presionar **Comprobar**, la actividad queda **bloqueada** para ese navegador (usa `localStorage` con claves `act_lock::<sistema>::<ruta>`). No hay botón **Reiniciar**.

## Publicación (GitHub Pages)
1. Sube todo a la **raíz** del repositorio.  
2. En **Settings → Pages**: `Deploy from a branch` → `main` → `/ (root)`.  
3. Espera 1–2 minutos y prueba la URL.

## Estructura
```
.
├─ index.html               (SVG del cono con segmentos clicables)
├─ styles.css
├─ app.js                   (render de actividades + intento único)
└─ assets/
   ├─ atmosfera.jpg  | atmosfera.pdf
   ├─ hidrosfera.jpg | hidrosfera.pdf
   ├─ geosfera.jpg   | geosfera.pdf
   ├─ biosfera.jpg   | biosfera.pdf
   ├─ hotspots_rio.jpg
   └─ actividades/
      ├─ atmosfera.json
      ├─ hidrosfera.json
      ├─ geosfera.json
      └─ biosfera.json
```

## Ajustar los grosores de los segmentos del cono
En `index.html`, modifica las coordenadas **Y** de los puntos de cada polígono. Referencia:
- Vértice: `yApex = 360`
- Tope: `yTop = 40`
- Límites intermedios (ejemplo): `yH2O = 232`, `yBio = 240`, `yGeo = 255`
Laterales (para `viewBox 800×420`):  
`xLeft(y) = 300 + 0.3125*(y-40)`  ·  `xRight(y) = 500 - 0.3125*(y-40)`

## Nota
El bloqueo es local al navegador/dispositivo. Para “reabrir” intentos de forma masiva, borra datos del sitio o cambia el orden/índice de actividades en el JSON (altera la clave lógica).
