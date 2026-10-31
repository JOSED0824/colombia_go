export type MapPoint = {
  id: string
  lat: number
  lng: number
  name: string
  city: string
  /** slug: culture | nature | food | nightlife — define el color y el ícono del pin */
  category: string
  categoryLabel: string
  rating: number
  /** URL usable dentro del WebView (o null: la tarjeta muestra el ícono de la categoría) */
  image: string | null
}

export type MapLabels = {
  viewDetail: string
  fitAll: string
  myLocation: string
  drive: string
  walk: string
  bike: string
  routeLoading: string
  routeFailed: string
  geoFailed: string
  mapFailed: string
  loading: string
  stopsLabel: string
}

/**
 * Página HTML del mapa, estilo "app de domicilios": MapLibre GL (vectorial, gratis) con los mapas de
 * OpenFreeMap (sin API key) y rutas por calle de routing.openstreetmap.de (OSRM, gratis). Pines por
 * categoría, carrusel de tarjetas sincronizado con el mapa, ruta animada (a pie / bici / carro) y botón de
 * mi ubicación. Se usa igual en el WebView nativo y en un <iframe> en web; para abrir un lugar manda
 * { type: 'select', id } por postMessage.
 */
export function buildMapHtml(points: MapPoint[], drawRoute: boolean, labels: MapLabels, dark = false) {
  // Se neutraliza "<" para que ningún nombre pueda cerrar el <script> ni abrir un comentario HTML.
  const data = JSON.stringify(points).replace(/</g, '\\u003c')
  const lab = JSON.stringify(labels).replace(/</g, '\\u003c')

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
<link rel="stylesheet" href="https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.css" />
<style>
  html, body { margin: 0; height: 100%; overflow: hidden; background: #EEF2F6; font-family: -apple-system, Roboto, 'Segoe UI', Arial, sans-serif; -webkit-tap-highlight-color: transparent; }
  #map { position: absolute; top: 0; left: 0; right: 0; bottom: 0; }
  .maplibregl-ctrl-attrib { font-size: 9px; }

  #loading { position: absolute; top: 0; left: 0; right: 0; bottom: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; background: #FFF8EC; color: #003B7D; font-weight: 600; font-size: 14px; z-index: 30; transition: opacity .3s; text-align: center; padding: 24px; }
  #loading.done { opacity: 0; pointer-events: none; }
  .spin { width: 34px; height: 34px; border-radius: 50%; border: 4px solid #FFE27A; border-top-color: #003B7D; animation: rot .8s linear infinite; }
  @keyframes rot { to { transform: rotate(360deg); } }

  /* Pines */
  /* sin position: relative -> el pin conserva el position:absolute de maplibregl-marker; con relative cada pin quedaba desplazado 44px por cada pin anterior */
  .pin { width: 36px; height: 44px; cursor: pointer; }
  .pin-body { position: absolute; left: 0; top: 0; width: 36px; height: 36px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); background: var(--c); border: 3px solid #fff; box-shadow: 0 3px 8px rgba(0,0,0,.35); display: flex; align-items: center; justify-content: center; transition: transform .18s; }
  .pin-body span { transform: rotate(45deg); font-size: 16px; font-weight: 800; color: #fff; line-height: 1; }
  .pin.dark span { color: #003B7D; }
  .pin.sel { z-index: 5; }
  .pin.sel .pin-body { animation: pop .35s forwards; }
  @keyframes pop { 0% { transform: rotate(-45deg) scale(.8); } 60% { transform: rotate(-45deg) scale(1.35); } 100% { transform: rotate(-45deg) scale(1.2); } }
  .pin.sel::after { content: ''; position: absolute; left: 50%; bottom: -3px; width: 14px; height: 6px; margin-left: -7px; border-radius: 50%; background: rgba(0,0,0,.25); }
  .pin, .cluster { animation: appear .28s ease-out; }
  @keyframes appear { from { opacity: 0; } to { opacity: 1; } }
  /* Grupo de lugares cercanos (al alejar el mapa los pines se agrupan en lugar de amontonarse) */
  .cluster { width: 46px; height: 46px; border-radius: 50%; background: #003B7D; color: #fff; border: 3px solid #fff; box-shadow: 0 0 0 7px rgba(0,59,125,.22), 0 3px 10px rgba(0,0,0,.35); display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 16px; cursor: pointer; }
  body.dark .cluster { border-color: #172230; box-shadow: 0 0 0 7px rgba(157,193,255,.25), 0 3px 10px rgba(0,0,0,.5); }
  .me { width: 18px; height: 18px; border-radius: 50%; background: #1A73E8; border: 3px solid #fff; box-shadow: 0 0 0 0 rgba(26,115,232,.5); animation: pulse 1.8s infinite; }
  @keyframes pulse { 70% { box-shadow: 0 0 0 16px rgba(26,115,232,0); } 100% { box-shadow: 0 0 0 0 rgba(26,115,232,0); } }

  /* Barra de ruta (arriba) */
  #routebar { position: absolute; top: 10px; left: 10px; background: #fff; border-radius: 18px; padding: 8px; box-shadow: 0 3px 12px rgba(0,0,0,.2); z-index: 10; max-width: calc(100% - 70px); }
  #modes { display: flex; gap: 6px; }
  #modes button { border: 0; background: #EEF2F6; border-radius: 14px; padding: 7px 11px; font-size: 13px; font-weight: 700; color: #003B7D; cursor: pointer; }
  #modes button.on { background: #FFD100; }
  #stats { font-size: 12px; font-weight: 600; color: #4A6580; margin: 7px 4px 1px; }
  .hidden { display: none !important; }

  /* Botones flotantes */
  #fab { position: absolute; right: 10px; top: 56px; display: flex; flex-direction: column; gap: 10px; z-index: 10; }
  #fab button { width: 44px; height: 44px; border-radius: 50%; border: 0; background: #fff; box-shadow: 0 3px 10px rgba(0,0,0,.25); font-size: 20px; color: #003B7D; cursor: pointer; }

  /* Carrusel de tarjetas */
  #cards { position: absolute; left: 0; right: 0; bottom: 12px; display: flex; gap: 12px; overflow-x: auto; scroll-snap-type: x mandatory; padding: 6px 11% 8px; z-index: 10; -webkit-overflow-scrolling: touch; scrollbar-width: none; }
  #cards::-webkit-scrollbar { display: none; }
  .card { flex: 0 0 78%; max-width: 340px; scroll-snap-align: center; box-sizing: border-box; background: #fff; border-radius: 22px; padding: 10px; display: flex; gap: 12px; box-shadow: 0 4px 16px rgba(0,0,0,.22); border: 2px solid transparent; transition: border-color .2s, transform .2s; }
  .card.on { border-color: #FFD100; transform: translateY(-3px); }
  .card-img { flex: 0 0 92px; height: 104px; border-radius: 16px; background: #E3ECF5 center / cover no-repeat; display: flex; align-items: center; justify-content: center; font-size: 34px; position: relative; }
  .card-num { position: absolute; top: 6px; left: 6px; width: 24px; height: 24px; border-radius: 50%; background: #003B7D; color: #fff; font-size: 12px; font-weight: 800; display: flex; align-items: center; justify-content: center; border: 2px solid #fff; }
  .card-body { flex: 1; min-width: 0; display: flex; flex-direction: column; }
  .card-title { font-size: 15px; font-weight: 800; color: #003B7D; line-height: 1.2; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
  .card-meta { font-size: 11px; color: #6B7C93; margin-top: 3px; }
  .chip { display: inline-block; align-self: flex-start; margin-top: 6px; font-size: 10px; font-weight: 800; color: #fff; padding: 3px 9px; border-radius: 10px; background: var(--c); }
  .chip.dark { color: #003B7D; }
  .card-btn { margin-top: auto; align-self: flex-start; border: 0; background: #FFD100; color: #003B7D; font-weight: 800; font-size: 12px; padding: 8px 14px; border-radius: 16px; cursor: pointer; }

  /* Modo oscuro: el mapa se invierte (conservando los tonos) y los paneles usan la paleta oscura de la app. */
  body.dark { background: #0E1621; }
  body.dark #map .maplibregl-canvas { filter: invert(1) hue-rotate(180deg) brightness(.92) contrast(.9) saturate(.8); }
  body.dark .maplibregl-ctrl-attrib { background: rgba(14,22,33,.75); color: #8FA3BA; }
  body.dark .maplibregl-ctrl-attrib a { color: #9DC1FF; }
  body.dark #loading { background: #0E1621; color: #9DC1FF; }
  body.dark .spin { border-color: #2C3E52; border-top-color: #9DC1FF; }
  body.dark #routebar, body.dark #fab button, body.dark .card { background: #172230; }
  body.dark #fab button { color: #9DC1FF; }
  body.dark #modes button { background: #213245; color: #9DC1FF; }
  body.dark #modes button.on { background: #FFD100; color: #003B7D; }
  body.dark #stats { color: #B7C5D6; }
  body.dark .card-title { color: #E8F0FB; }
  body.dark .card-meta { color: #8FA3BA; }
  body.dark .card-img { background-color: #213245; }
  body.dark .pin-body { border-color: #172230; }
  #toast { position: absolute; left: 50%; top: 14px; transform: translateX(-50%); background: rgba(0,28,61,.9); color: #fff; font-size: 12px; padding: 9px 14px; border-radius: 14px; z-index: 40; opacity: 0; transition: opacity .25s; pointer-events: none; max-width: 80%; text-align: center; }
  #toast.show { opacity: 1; }
</style>
</head>
<body class="${dark ? 'dark' : ''}">
<div id="map"></div>
<div id="loading"><div class="spin"></div><div id="loadingText"></div></div>
<div id="routebar" class="hidden"><div id="modes"></div><div id="stats"></div></div>
<div id="fab"><button id="btnFit" type="button">&#x2922;</button><button id="btnGeo" type="button">&#x25CE;</button></div>
<div id="cards"></div>
<div id="toast"></div>

<script src="https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.js"></script>
<script>
(function () {
  var P = ${data};
  var L = ${lab};
  var ROUTE = ${drawRoute ? 'true' : 'false'};
  var COLOR = { food: '#FFD100', culture: '#003B7D', nature: '#4CAF50', nightlife: '#E63946' };
  var EMOJI = { food: '\\uD83C\\uDF74', culture: '\\uD83C\\uDFDB\\uFE0F', nature: '\\uD83C\\uDF3F', nightlife: '\\uD83C\\uDFB5' };
  var PROFILE = { drive: 'routed-car/route/v1/driving', walk: 'routed-foot/route/v1/foot', bike: 'routed-bike/route/v1/bike' };
  var ICON_MODE = { drive: '\\uD83D\\uDE97', walk: '\\uD83D\\uDEB6', bike: '\\uD83D\\uDEB2' };
  var PAD = { top: 90, bottom: 190, left: 30, right: 30 };

  function $(id) { return document.getElementById(id); }
  function post(o) {
    var s = JSON.stringify(o);
    if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(s);
    else if (window.parent && window.parent !== window) window.parent.postMessage(s, '*');
  }
  var toastTimer;
  function toast(msg) {
    var t = $('toast'); t.textContent = msg; t.className = 'show';
    clearTimeout(toastTimer); toastTimer = setTimeout(function () { t.className = ''; }, 2600);
  }
  $('loadingText').textContent = L.loading;
  $('btnFit').setAttribute('aria-label', L.fitAll);
  $('btnGeo').setAttribute('aria-label', L.myLocation);

  var loaded = false;
  var map = new maplibregl.Map({
    container: 'map',
    style: 'https://tiles.openfreemap.org/styles/bright',
    center: [-75.5636, 6.2518],
    zoom: 11,
    attributionControl: false
  });
  map.addControl(new maplibregl.AttributionControl({ compact: true }), 'top-right');

  map.on('error', function () {
    if (loaded) return;
    $('loading').innerHTML = '';
    $('loading').appendChild(document.createTextNode(L.mapFailed));
  });

  // ---------- pines + tarjetas ----------
  var pins = [], markers = [], shown = [], clusterByKey = {}, cards = [], cur = -1, programmatic = false;
  // Con muchos lugares, los cercanos se agrupan en una burbuja con el número; en una ruta (paradas numeradas) no se agrupa.
  var CLUSTER = !ROUTE && P.length > 1;
  var RADIUS = 52;
  var cardsEl = $('cards');

  P.forEach(function (p, i) {
    var color = COLOR[p.category] || '#003B7D';
    var dark = color === '#FFD100';

    var el = document.createElement('div');
    el.className = 'pin' + (dark ? ' dark' : '');
    el.style.setProperty('--c', color);
    var body = document.createElement('div'); body.className = 'pin-body';
    var inner = document.createElement('span');
    inner.textContent = ROUTE ? String(i + 1) : (EMOJI[p.category] || '\\uD83D\\uDCCD');
    body.appendChild(inner); el.appendChild(body);
    el.addEventListener('click', function (e) { e.stopPropagation(); select(i, true, true); });
    var marker = new maplibregl.Marker({ element: el, anchor: 'bottom' }).setLngLat([p.lng, p.lat]);
    markers.push(marker);
    if (!CLUSTER) marker.addTo(map);
    shown.push(!CLUSTER);
    pins.push(el);

    var card = document.createElement('div'); card.className = 'card';
    var img = document.createElement('div'); img.className = 'card-img';
    if (p.image) img.style.backgroundImage = "url('" + String(p.image).split("'").join('%27') + "')";
    else img.textContent = EMOJI[p.category] || '\\uD83D\\uDCCD';
    if (ROUTE) { var n = document.createElement('div'); n.className = 'card-num'; n.textContent = String(i + 1); img.appendChild(n); }
    var cb = document.createElement('div'); cb.className = 'card-body';
    var title = document.createElement('div'); title.className = 'card-title'; title.textContent = p.name;
    var meta = document.createElement('div'); meta.className = 'card-meta';
    meta.textContent = p.city + (p.rating ? '  \\u2605 ' + p.rating.toFixed(1) : '');
    var chip = document.createElement('span'); chip.className = 'chip' + (dark ? ' dark' : ''); chip.style.setProperty('--c', color); chip.textContent = p.categoryLabel;
    var btn = document.createElement('button'); btn.type = 'button'; btn.className = 'card-btn'; btn.textContent = L.viewDetail + ' \\u203A';
    btn.addEventListener('click', function () { post({ type: 'select', id: p.id }); });
    cb.appendChild(title); cb.appendChild(meta); cb.appendChild(chip); cb.appendChild(btn);
    card.appendChild(img); card.appendChild(cb);
    card.addEventListener('click', function () { if (cur !== i) select(i, true, true); });
    cardsEl.appendChild(card); cards.push(card);
  });

  // Agrupa por cercanía en pantalla: se recalcula al terminar cada movimiento o zoom del mapa. Solo se tocan los
  // pines y grupos que cambiaron, así lo que no cambia no parpadea ni se mueve.
  function recluster() {
    if (!CLUSTER) return;
    var pts = P.map(function (p, i) { var s = map.project([p.lng, p.lat]); return { i: i, x: s.x, y: s.y }; });
    var used = {}, groups = [];
    pts.forEach(function (a) {
      if (used[a.i]) return;
      used[a.i] = true;
      var g = [a];
      if (a.i !== cur) { // el lugar seleccionado siempre se muestra solo
        pts.forEach(function (b) {
          if (used[b.i] || b.i === cur) return;
          var dx = a.x - b.x, dy = a.y - b.y;
          if (dx * dx + dy * dy < RADIUS * RADIUS) { used[b.i] = true; g.push(b); }
        });
      }
      groups.push(g);
    });

    var want = {};
    groups.forEach(function (g) {
      if (g.length === 1) {
        var i = g[0].i;
        if (!shown[i]) { markers[i].addTo(map); shown[i] = true; }
        return;
      }
      g.forEach(function (m) { if (shown[m.i]) { markers[m.i].remove(); shown[m.i] = false; } });
      var ids = g.map(function (m) { return m.i; }).sort(function (x, y) { return x - y; });
      var key = ids.join(',');
      want[key] = true;
      if (clusterByKey[key]) return;
      var lng = 0, lat = 0, bounds = new maplibregl.LngLatBounds();
      ids.forEach(function (i) { lng += P[i].lng; lat += P[i].lat; bounds.extend([P[i].lng, P[i].lat]); });
      var center = [lng / ids.length, lat / ids.length];
      var el = document.createElement('div');
      el.className = 'cluster';
      el.textContent = String(ids.length);
      el.addEventListener('click', function (e) {
        e.stopPropagation();
        // Acerca lo suficiente para que el grupo se abra de verdad (al menos 2.2 niveles más), centrado sobre el grupo.
        var cam = map.cameraForBounds(bounds, { padding: PAD });
        var zoom = Math.min(17, Math.max(cam && cam.zoom ? cam.zoom : 0, map.getZoom() + 2.2));
        goTo(center, zoom);
      });
      clusterByKey[key] = new maplibregl.Marker({ element: el }).setLngLat(center).addTo(map);
    });
    Object.keys(clusterByKey).forEach(function (k) {
      if (!want[k]) { clusterByKey[k].remove(); delete clusterByKey[k]; }
    });
  }
  map.on('moveend', recluster);

  // Mueve la cámara. Si el destino está cerca, se desliza; si está lejos, "vuela" (se aleja y vuelve a acercar)
  // para que no se pierda la orientación como pasaba con un salto directo.
  function goTo(center, zoom) {
    var from = map.project(map.getCenter()), to = map.project(center);
    var px = Math.sqrt(Math.pow(from.x - to.x, 2) + Math.pow(from.y - to.y, 2));
    var opts = { center: center, zoom: zoom, padding: PAD, essential: true };
    if (px < 700 && Math.abs(map.getZoom() - zoom) < 4) { opts.duration = 650; map.easeTo(opts); }
    else { opts.duration = 1400; opts.curve = 1.35; map.flyTo(opts); }
  }

  function cardLeft(i) { var c = cards[i]; return c.offsetLeft - (cardsEl.clientWidth - c.offsetWidth) / 2; }

  function select(i, fly, scrollCard) {
    if (cur >= 0) { pins[cur].classList.remove('sel'); cards[cur].classList.remove('on'); }
    cur = i;
    pins[i].classList.add('sel'); cards[i].classList.add('on');
    // Si el lugar estaba dentro de un grupo, su pin aparece de inmediato (no se "pierde" mientras la cámara se mueve).
    if (CLUSTER && !shown[i]) { markers[i].addTo(map); shown[i] = true; }
    if (scrollCard) {
      programmatic = true;
      cardsEl.scrollTo({ left: cardLeft(i), behavior: 'smooth' });
      setTimeout(function () { programmatic = false; }, 700);
    }
    if (fly) {
      goTo([P[i].lng, P[i].lat], Math.max(map.getZoom(), 14));
    }
  }

  // Al deslizar el carrusel, el mapa vuela al lugar de la tarjeta que quedó al centro.
  var scrollTimer;
  cardsEl.addEventListener('scroll', function () {
    if (programmatic) return;
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(function () {
      var mid = cardsEl.scrollLeft + cardsEl.clientWidth / 2, best = 0, bd = 1e9;
      cards.forEach(function (c, i) {
        var d = Math.abs(c.offsetLeft + c.offsetWidth / 2 - mid);
        if (d < bd) { bd = d; best = i; }
      });
      if (best !== cur) select(best, true, false);
    }, 140);
  });

  function fitAll(animate) {
    if (P.length === 0) return;
    if (P.length === 1) { map.easeTo({ center: [P[0].lng, P[0].lat], zoom: 14, padding: PAD, duration: animate ? 600 : 0 }); return; }
    var b = new maplibregl.LngLatBounds();
    P.forEach(function (p) { b.extend([p.lng, p.lat]); });
    map.fitBounds(b, { padding: PAD, maxZoom: 15, duration: animate ? 600 : 0 });
  }
  $('btnFit').addEventListener('click', function () { fitAll(true); });

  // ---------- mi ubicación ----------
  var me = null;
  $('btnGeo').addEventListener('click', function () {
    if (!navigator.geolocation) { toast(L.geoFailed); return; }
    navigator.geolocation.getCurrentPosition(function (pos) {
      var ll = [pos.coords.longitude, pos.coords.latitude];
      if (!me) { var d = document.createElement('div'); d.className = 'me'; me = new maplibregl.Marker({ element: d }).setLngLat(ll).addTo(map); }
      else me.setLngLat(ll);
      map.easeTo({ center: ll, zoom: Math.max(map.getZoom(), 14), padding: PAD, duration: 700 });
    }, function () { toast(L.geoFailed); }, { enableHighAccuracy: true, timeout: 8000 });
  });

  // ---------- ruta por calle ----------
  var mode = 'walk', reqId = 0, anim = 0, flow = 0;
  var FLOW = [[0,4,3],[0.5,4,2.5],[1,4,2],[1.5,4,1.5],[2,4,1],[2.5,4,0.5],[3,4,0],[0,0.5,3,3.5],[0,1,3,3],[0,1.5,3,2.5],[0,2,3,2],[0,2.5,3,1.5],[0,3,3,1],[0,3.5,3,0.5]];

  function fmtDur(s) {
    var m = Math.max(1, Math.round(s / 60));
    return m >= 60 ? Math.floor(m / 60) + ' h ' + (m % 60) + ' min' : m + ' min';
  }
  function fmtDist(m) { return m >= 1000 ? (m / 1000).toFixed(1) + ' km' : Math.round(m) + ' m'; }

  function feature(coords) { return { type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: coords } }; }

  function draw(coords, dashed) {
    if (!map.getSource('route')) {
      map.addSource('route', { type: 'geojson', data: feature([]) });
      map.addLayer({ id: 'route-casing', type: 'line', source: 'route', layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': '#FFFFFF', 'line-width': 9 } });
      map.addLayer({ id: 'route-line', type: 'line', source: 'route', layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': '#003B7D', 'line-width': 5 } });
      map.addLayer({ id: 'route-flow', type: 'line', source: 'route', layout: { 'line-cap': 'butt', 'line-join': 'round' }, paint: { 'line-color': '#FFD100', 'line-width': 2.5, 'line-dasharray': [0, 4, 3] } });
      var step = 0;
      flow = setInterval(function () { step = (step + 1) % FLOW.length; map.setPaintProperty('route-flow', 'line-dasharray', FLOW[step]); }, 70);
    }
    map.setPaintProperty('route-line', 'line-dasharray', dashed ? [2, 2] : [1, 0]);
    map.setLayoutProperty('route-flow', 'visibility', dashed ? 'none' : 'visible');

    // La línea se va dibujando de a poco.
    cancelAnimationFrame(anim);
    var n = coords.length, t0 = null;
    function stepDraw(ts) {
      if (!t0) t0 = ts;
      var k = Math.min(1, (ts - t0) / 1100);
      var upto = Math.max(2, Math.floor(n * k));
      map.getSource('route').setData(feature(coords.slice(0, upto)));
      if (k < 1) anim = requestAnimationFrame(stepDraw);
    }
    anim = requestAnimationFrame(stepDraw);

    var b = new maplibregl.LngLatBounds();
    coords.forEach(function (c) { b.extend(c); });
    map.fitBounds(b, { padding: PAD, maxZoom: 16, duration: 800 });
  }

  function loadRoute() {
    var stats = $('stats');
    stats.textContent = L.routeLoading;
    var coords = P.map(function (p) { return p.lng + ',' + p.lat; }).join(';');
    var url = 'https://routing.openstreetmap.de/' + PROFILE[mode] + '/' + coords + '?overview=full&geometries=geojson';
    var token = ++reqId;
    fetch(url)
      .then(function (r) { return r.json(); })
      .then(function (j) {
        if (token !== reqId) return;
        if (!j.routes || !j.routes.length) throw new Error('sin ruta');
        var r = j.routes[0];
        draw(r.geometry.coordinates, false);
        stats.textContent = fmtDist(r.distance) + '  \\u00B7  ' + fmtDur(r.duration) + '  \\u00B7  ' + L.stopsLabel;
      })
      .catch(function () {
        if (token !== reqId) return;
        draw(P.map(function (p) { return [p.lng, p.lat]; }), true);
        stats.textContent = L.routeFailed;
      });
  }

  function buildModes() {
    var wrap = $('modes');
    ['walk', 'bike', 'drive'].forEach(function (m) {
      var b = document.createElement('button'); b.type = 'button';
      b.textContent = ICON_MODE[m] + ' ' + L[m];
      if (m === mode) b.className = 'on';
      b.addEventListener('click', function () {
        mode = m;
        Array.prototype.forEach.call(wrap.children, function (x) { x.className = ''; });
        b.className = 'on';
        loadRoute();
      });
      wrap.appendChild(b);
    });
  }

  map.on('load', function () {
    loaded = true;
    $('loading').className = 'done';
    fitAll(false);
    recluster();
    if (ROUTE && P.length > 1) {
      $('routebar').className = '';
      buildModes();
      loadRoute();
    }
  });
})();
</script>
</body>
</html>`
}
