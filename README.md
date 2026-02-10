# Sistemas de la Tierra – Interactivo (cono con Atmósfera redondeada + JSON extendido, intento único)

Esta versión muestra los sistemas como **segmentos de un cono** y la **Atmósfera con tope redondeado** (arco SVG). Carga actividades desde **JSON** y bloquea tras el **primer intento**.

## Tipos de actividades
`multiple`, `truefalse`, `order`, `match`, `cloze`, `hotspots`, `bank`.

## Intento único
Al presionar **Comprobar**, la actividad queda **bloqueada** (usa `localStorage`: `act_lock::<sistema>::<ruta>`). No hay botón **Reiniciar**.

## Publicación (GitHub Pages)
1. Sube todo a la **raíz** del repo.  
2. **Settings → Pages**: `Deploy from a branch` → `main` → `/ (root)`.  
3. Espera 1–2 minutos y prueba.

## Ajustes del arco superior (Atmósfera)
En `index.html`, el arco se define con:  
`A rx,ry rot large-arc-flag sweep-flag x y` → ejemplo: `A 130,60 0 0 1 500,40`.  
Aumenta `ry` para más “cúpula”. Cambia los puntos inicial/final (300,40) y (500,40) si mueves el tope.
