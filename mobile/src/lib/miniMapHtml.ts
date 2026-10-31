const CATEGORY_COLOR: Record<string, string> = { food: '#FFD100', culture: '#003B7D', nature: '#4CAF50', nightlife: '#E63946' }

/**
 * Mini mapa del detalle de un lugar: el mismo mapa vectorial (MapLibre + OpenFreeMap, gratis y sin API key) que usa la
 * pantalla de Mapa, pero fijo (sin gestos, para no pelear con el scroll de la pantalla) y con un solo pin.
 */
export function buildMiniMapHtml(lat: number, lng: number, category: string, dark = false) {
  const color = CATEGORY_COLOR[category] ?? '#003B7D'
  const pinText = category === 'food' ? '#003B7D' : '#FFFFFF'
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
<link rel="stylesheet" href="https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.css" />
<style>
  html, body { margin: 0; height: 100%; overflow: hidden; background: #EEF2F6; }
  #map { position: absolute; top: 0; left: 0; right: 0; bottom: 0; }
  .maplibregl-ctrl-attrib { font-size: 8px; }
  .pin { position: relative; width: 34px; height: 42px; }
  .pin-body { position: absolute; left: 0; top: 0; width: 34px; height: 34px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); background: ${color}; border: 3px solid #fff; box-shadow: 0 3px 8px rgba(0,0,0,.35); display: flex; align-items: center; justify-content: center; animation: drop .5s ease-out; }
  .pin-body i { transform: rotate(45deg); width: 10px; height: 10px; border-radius: 50%; background: ${pinText}; }
  @keyframes drop { 0% { transform: rotate(-45deg) translate(14px, -14px) scale(.6); opacity: 0; } 100% { transform: rotate(-45deg); opacity: 1; } }
  body.dark { background: #0E1621; }
  body.dark #map .maplibregl-canvas { filter: invert(1) hue-rotate(180deg) brightness(.92) contrast(.9) saturate(.8); }
  body.dark .maplibregl-ctrl-attrib { background: rgba(14,22,33,.75); color: #8FA3BA; }
  body.dark .maplibregl-ctrl-attrib a { color: #9DC1FF; }
</style>
</head>
<body class="${dark ? 'dark' : ''}">
<div id="map"></div>
<script src="https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.js"></script>
<script>
  try {
    var map = new maplibregl.Map({
      container: 'map',
      style: 'https://tiles.openfreemap.org/styles/bright',
      center: [${Number(lng)}, ${Number(lat)}],
      zoom: 14.6,
      interactive: false,
      attributionControl: { compact: true }
    });
    var el = document.createElement('div');
    el.className = 'pin';
    el.innerHTML = '<div class="pin-body"><i></i></div>';
    new maplibregl.Marker({ element: el, anchor: 'bottom' }).setLngLat([${Number(lng)}, ${Number(lat)}]).addTo(map);
  } catch (e) {}
</script>
</body>
</html>`
}
