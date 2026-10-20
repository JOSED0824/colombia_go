export type MapPoint = { lat: number; lng: number; name: string }

/** Página HTML con un mapa de Leaflet + tiles de OpenStreetMap (sin API key). Se usa tanto en el
 * WebView nativo (Android/iOS) como en un <iframe> en web — mismo HTML, distinto contenedor. */
export function buildMapHtml(points: MapPoint[], drawRoute: boolean) {
  // JSON.stringify ya escapa comillas; además se neutraliza "</" para que un nombre de lugar
  // no pueda cerrar el <script> de forma prematura.
  const puntosJson = JSON.stringify(points).replace(/<\//g, '<\\/')

  return `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <style>html, body, #map { height: 100%; margin: 0; padding: 0; }</style>
</head>
<body>
  <div id="map"></div>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script>
    var puntos = ${puntosJson};
    var dibujarRuta = ${drawRoute ? 'true' : 'false'};
    var map = L.map('map');
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap'
    }).addTo(map);

    var bounds = [];
    puntos.forEach(function (p, i) {
      var marker = L.marker([p.lat, p.lng]).addTo(map);
      marker.bindPopup((dibujarRuta ? (i + 1) + '. ' : '') + p.name);
      bounds.push([p.lat, p.lng]);
    });

    if (dibujarRuta && puntos.length > 1) {
      L.polyline(puntos.map(function (p) { return [p.lat, p.lng]; }), { color: '#003B7D', weight: 4 }).addTo(map);
    }

    if (bounds.length > 0) {
      map.fitBounds(bounds, { padding: [40, 40] });
    } else {
      map.setView([4.5709, -74.2973], 6);
    }
  </script>
</body>
</html>`
}
