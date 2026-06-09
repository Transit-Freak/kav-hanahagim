// Real interactive map (Leaflet) with a streets / satellite toggle.
// Draws the route polyline, stop markers, and a live driver puck.
const { useState: useStateLM, useEffect: useEffectLM, useRef: useRefLM, useMemo: useMemoLM } = React;

function LeafletMap({ geom = [], stops = [], driverF = 0, focusStopId = null, follow = true, dark = false, compact = false, toggleBottom = 16 }) {
  const elRef = useRefLM(null);
  const mapRef = useRefLM(null);
  const layersRef = useRefLM({});
  const routeRef = useRefLM({});
  const stopRef = useRefLM([]);
  const puckRef = useRefLM(null);
  const fittedRef = useRefLM(false);
  const pausedRef = useRefLM(false);
  const [base, setBase] = useStateLM('streets');
  const [offCenter, setOffCenter] = useStateLM(false);

  const metrics = useMemoLM(() => window.Geo.polylineMetrics(geom), [geom]);

  // ── init map once ───────────────────────────────────────────
  useEffectLM(() => {
    if (!elRef.current || mapRef.current) return;
    const map = L.map(elRef.current, { zoomControl: false, attributionControl: true, zoomSnap: 0.25 });
    map.attributionControl.setPrefix('');
    mapRef.current = map;

    const streets = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
      { maxZoom: 20, subdomains: 'abcd', attribution: '© OpenStreetMap © CARTO' });
    const streetsDark = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png',
      { maxZoom: 20, subdomains: 'abcd', attribution: '© OpenStreetMap © CARTO' });
    const sat = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      { maxZoom: 19, attribution: '© Esri, Maxar' });
    const satLabels = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}',
      { maxZoom: 19, opacity: 0.9 });
    layersRef.current = { streets, streetsDark, sat, satLabels };
    L.control.zoom({ position: 'topright' }).addTo(map);
    map.setView([32.08, 34.78], 14);

    // pause auto-follow as soon as the driver pans the map by hand
    map.on('dragstart', () => { pausedRef.current = true; setOffCenter(true); });

    setTimeout(() => map.invalidateSize(), 60);
    const onResize = () => map.invalidateSize();
    window.addEventListener('resize', onResize);
    let ro;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(() => map.invalidateSize());
      ro.observe(elRef.current);
    }
    return () => { window.removeEventListener('resize', onResize); if (ro) ro.disconnect(); map.remove(); mapRef.current = null; };
  }, []);

  // ── base layer switch ───────────────────────────────────────
  useEffectLM(() => {
    const map = mapRef.current; const L_ = layersRef.current; if (!map) return;
    [L_.streets, L_.streetsDark, L_.sat, L_.satLabels].forEach((l) => l && map.hasLayer(l) && map.removeLayer(l));
    if (base === 'satellite') { L_.sat.addTo(map); L_.satLabels.addTo(map); }
    else { (dark ? L_.streetsDark : L_.streets).addTo(map); }
  }, [base, dark]);

  // ── build route + stop markers when geometry changes ────────
  useEffectLM(() => {
    const map = mapRef.current; if (!map || metrics.pts.length < 2) return;
    Object.values(routeRef.current).forEach((l) => l && map.removeLayer(l));
    stopRef.current.forEach((m) => map.removeLayer(m.marker));
    stopRef.current = [];

    const casing = L.polyline(metrics.pts, { color: '#ffffff', weight: 11, opacity: 0.95, lineJoin: 'round', lineCap: 'round' }).addTo(map);
    const ahead = L.polyline(metrics.pts, { color: '#1F5EE0', weight: 6.5, opacity: 1, lineJoin: 'round', lineCap: 'round' }).addTo(map);
    const traveled = L.polyline([], { color: '#9AA6BC', weight: 6.5, opacity: 0.95, lineJoin: 'round', lineCap: 'round' }).addTo(map);
    routeRef.current = { casing, ahead, traveled };

    stops.forEach((s) => {
      if (!isFinite(s.lat) || !isFinite(s.lon)) return;
      const icon = L.divIcon({ className: 'stop-ico', html: '<span class="dot"></span>', iconSize: [18, 18], iconAnchor: [9, 9] });
      const marker = L.marker([s.lat, s.lon], { icon, keyboard: false, interactive: false }).addTo(map);
      stopRef.current.push({ marker, f: s.f != null ? s.f : metrics.locate(s.lat, s.lon), id: s.id, last: s.seq === stops.length });
    });

    const puckIcon = L.divIcon({ className: 'puck-ico', html: '<span class="ring"></span><span class="core"><svg viewBox="0 0 24 24"><path d="M12 3 L18 20 L12 16 L6 20 Z"/></svg></span>', iconSize: [40, 40], iconAnchor: [20, 20] });
    if (puckRef.current) { map.removeLayer(puckRef.current); puckRef.current = null; }
    puckRef.current = L.marker(metrics.pointAt(driverF), { icon: puckIcon, keyboard: false, interactive: false, zIndexOffset: 1000 }).addTo(map);

    fittedRef.current = false;
    if (!follow) { map.fitBounds(casing.getBounds(), { padding: [34, 34] }); fittedRef.current = true; }
    // eslint-disable-next-line
  }, [metrics, stops]);

  // ── live update: puck, traveled split, next-stop highlight ──
  useEffectLM(() => {
    const map = mapRef.current; const r = routeRef.current; if (!map || !r.ahead || metrics.pts.length < 2) return;
    const here = metrics.pointAt(driverF);

    // split polyline at driverF -> traveled (behind) vs ahead
    let idx = 0; const target = driverF * metrics.total;
    while (idx < metrics.cum.length && metrics.cum[idx] < target) idx++;
    const behind = metrics.pts.slice(0, idx).concat([here]);
    const front = [here].concat(metrics.pts.slice(idx));
    r.traveled.setLatLngs(behind);
    r.ahead.setLatLngs(front);

    if (puckRef.current) {
      puckRef.current.setLatLng(here);
      const el = puckRef.current.getElement();
      if (el) { const core = el.querySelector('.core'); if (core) core.style.transform = `rotate(${metrics.bearingAt(driverF)}deg)`; }
    }

    // next stop = first not-yet-passed
    let nextId = null;
    for (const sm of stopRef.current) { if (sm.f > driverF - 0.004) { nextId = sm.id; break; } }
    stopRef.current.forEach((sm) => {
      const el = sm.marker.getElement(); if (!el) return;
      el.classList.toggle('passed', sm.f < driverF - 0.006);
      el.classList.toggle('next', sm.id === (focusStopId || nextId));
      el.classList.toggle('last', !!sm.last);
    });

    if (follow && fittedRef.current === false) { map.setView(here, 16); fittedRef.current = true; }
    else if (follow && !pausedRef.current) { map.panTo(here, { animate: true, duration: 0.5 }); }
  }, [driverF, focusStopId, metrics, follow, base]);

  const recenter = () => {
    const map = mapRef.current; if (!map || !puckRef.current) return;
    pausedRef.current = false; setOffCenter(false);
    map.setView(puckRef.current.getLatLng(), Math.max(map.getZoom(), 16), { animate: true });
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div ref={elRef} style={{ position: 'absolute', inset: 0, background: dark ? '#0c0f14' : '#e8eaed' }} />
      {/* recenter on driver */}
      {follow && offCenter && (
        <button onClick={recenter} aria-label="מרכז על הנהג" style={{
          position: 'absolute', bottom: typeof toggleBottom === 'number' ? toggleBottom + 52 : toggleBottom, insetInlineEnd: 12, zIndex: 500,
          width: 46, height: 46, borderRadius: 13, border: 'none', cursor: 'pointer',
          background: 'var(--accent, #1F5EE0)', color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 3px 12px rgba(0,0,0,0.3)',
        }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3.5"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/></svg>
        </button>
      )}
      {/* streets / satellite toggle */}
      <div style={{ position: 'absolute', bottom: toggleBottom, insetInlineStart: 12, zIndex: 500, display: 'flex', background: 'var(--surface, #fff)', borderRadius: 11, padding: 3, boxShadow: '0 2px 10px rgba(0,0,0,0.25)', gap: 2 }}>
        {[['streets', 'מפה'], ['satellite', 'לוויין']].map(([k, label]) => (
          <button key={k} onClick={() => setBase(k)} style={{
            border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700, fontSize: 13,
            padding: '7px 14px', borderRadius: 8,
            background: base === k ? 'var(--accent, #1F5EE0)' : 'transparent',
            color: base === k ? '#fff' : 'var(--text-mut, #5B6472)',
          }}>{label}</button>
        ))}
      </div>
    </div>
  );
}

window.LeafletMap = LeafletMap;
