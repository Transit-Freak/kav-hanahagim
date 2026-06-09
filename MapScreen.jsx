// Central driving screen — real map (Leaflet) with the route, stops and a live driver puck.
const { useState: useStateMS, useEffect: useEffectMS, useRef: useRefMS, useMemo: useMemoMS } = React;

function TripHeader({ route, trip, dark, onToggleDark, onBack, osrmStatus }) {
  const statusColor = osrmStatus === 'ok' ? 'var(--ok)' : osrmStatus === 'loading' ? 'var(--warn)' : 'var(--text-dim)';
  const statusLabel = osrmStatus === 'ok' ? 'ניווט חי' : osrmStatus === 'loading' ? 'טוען ניווט…' : osrmStatus === 'fallback' ? 'ניווט גיאומטרי' : '';
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 11, padding: '10px 14px',
      background: 'var(--surface)', borderBottom: '1px solid var(--hair)', position: 'relative', zIndex: 5,
    }}>
      <button onClick={onBack} aria-label="חזרה" style={{ border: 'none', background: 'var(--chip)', width: 38, height: 38, borderRadius: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text)', flexShrink: 0 }}>
        <IconChevron size={20} style={{ transform: 'scaleX(-1)' }} />
      </button>
      <RouteBadge num={route.shortName} size={40} dark={dark} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontWeight: 800, fontSize: 16.5, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{trip.headsign}</span>
        </div>
        <div style={{ fontSize: 12.5, color: 'var(--text-mut)', display: 'flex', gap: 8, marginTop: 1, alignItems: 'center' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 7, height: 7, borderRadius: 99, background: 'var(--ok)' }} />בנסיעה
          </span>
          <span>· יציאה {trip.departure}</span>
          {statusLabel ? <span style={{ color: statusColor, fontWeight: 700 }}>· {statusLabel}</span> : null}
        </div>
      </div>
      <DayNightToggle dark={dark} onToggle={onToggleDark} />
    </div>
  );
}

const EXIT_HE = ['', 'הראשונה', 'השנייה', 'השלישית', 'הרביעית', 'החמישית'];

function ManeuverBanner({ mv }) {
  const Ico = mv.kind === 'roundabout' ? IconRoundabout : mv.kind === 'right' ? IconTurnRight : IconTurnLeft;
  const m = Math.max(0, mv.meters);
  const dist = m >= 1000 ? (m / 1000).toFixed(1) + ' ק״מ' : Math.round(m / 10) * 10 + ' מ׳';
  const title = mv.kind === 'roundabout'
    ? `צאו ביציאה ${EXIT_HE[mv.exit] || 'ה־' + mv.exit} בכיכר`
    : mv.kind === 'right' ? 'פנו ימינה' : 'פנו שמאלה';
  return (
    <div style={{ background: 'var(--accent)', color: '#fff', borderRadius: 18, padding: '14px 16px', boxShadow: '0 8px 24px var(--accent-shadow)', pointerEvents: 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
        <div style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(255,255,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Ico size={36} style={{ color: '#fff' }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13.5, fontWeight: 700, opacity: 0.9 }}>בעוד {dist}</div>
          <div style={{ fontSize: 22, fontWeight: 800, lineHeight: 1.15, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</div>
          {mv.street && <div style={{ fontSize: 14, fontWeight: 600, opacity: 0.92, marginTop: 1 }}>אל {mv.street}</div>}
        </div>
      </div>
    </div>
  );
}

function MapScreen({ route, trip, geom, maneuvers: maneuversProp = [], dark, onToggleDark, onBack, startF = 0.28, animate = true }) {
  const [driverF, setDriverF] = useStateMS(startF);
  const [focus, setFocus] = useStateMS(null);
  const [sheetOpen, setSheetOpen] = useStateMS(false);

  // OSRM live navigation state
  const [osrmStatus, setOsrmStatus] = useStateMS('idle'); // idle | loading | ok | fallback
  const [osrmManeuvers, setOsrmManeuvers] = useStateMS([]);

  const stops = trip.stops;
  const metrics = useMemoMS(() => window.Geo.polylineMetrics(geom || []), [geom]);

  // Fetch OSRM maneuvers whenever the route geometry changes
  useEffectMS(() => {
    if (!geom || geom.length < 2 || !window.OSRM) return;
    let cancelled = false;
    setOsrmStatus('loading');
    setOsrmManeuvers([]);
    window.OSRM.maneuvers(geom).then((res) => {
      if (cancelled) return;
      if (res.ok) {
        setOsrmManeuvers(res.maneuvers);
        setOsrmStatus('ok');
      } else {
        setOsrmStatus('fallback');
      }
    }).catch(() => { if (!cancelled) setOsrmStatus('fallback'); });
    return () => { cancelled = true; };
  }, [geom]);

  // Animate the driver puck along the route
  useEffectMS(() => {
    if (!animate) return;
    let raf, last;
    const tick = (t) => {
      if (last != null) {
        const dt = (t - last) / 1000;
        setDriverF((f) => { const n = f + dt / 200; return n > 1.01 ? startF : n; });
      }
      last = t;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [animate, startF]);

  const focusStop = (s) => { setFocus(s.id); setTimeout(() => setFocus((cur) => cur === s.id ? null : cur), 4000); };
  const nextStop = stops.find((s) => s.f > driverF) || stops[stops.length - 1];
  const metersToNext = nextStop ? Math.max(0, (nextStop.f - driverF) * metrics.total) : 0;

  // Determine active maneuver source: real OSRM if available, else prop (demo), else geometry
  const activeManeuvers = osrmStatus === 'ok' ? osrmManeuvers : maneuversProp;

  // Find the next upcoming explicit maneuver (roundabout / sharp turn) within 350 m
  const upcomingMv = activeManeuvers
    .map((mv) => ({ ...mv, meters: (mv.f - driverF) * metrics.total }))
    .filter((mv) => mv.meters > -20 && mv.meters < 350)
    .sort((a, b) => a.meters - b.meters)[0] || null;

  // Fallback: geometry-based look-ahead for turns (used when no OSRM maneuver is near)
  const upcomingTurn = useMemoMS(() => metrics.nextTurn(driverF, 450), [metrics, driverF]);
  const maneuver = upcomingMv ? upcomingMv.kind : upcomingTurn.type;
  const metersToTurn = upcomingMv ? Math.max(0, upcomingMv.meters) : upcomingTurn.meters;

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      <TripHeader route={route} trip={trip} dark={dark} onToggleDark={onToggleDark} onBack={onBack} osrmStatus={osrmStatus} />
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <LeafletMap geom={geom} stops={stops} driverF={driverF} focusStopId={focus} dark={dark} follow compact toggleBottom={sheetOpen ? '62%' : 164} />

        {/* floating navigation cue */}
        <div style={{ position: 'absolute', top: 12, left: 12, right: 12, zIndex: 600, pointerEvents: 'none' }}>
          {upcomingMv && (upcomingMv.kind === 'roundabout' || upcomingMv.meters < 300)
            ? <ManeuverBanner mv={upcomingMv} />
            : <NextStopBanner
                stop={nextStop}
                meters={metersToNext}
                dark={dark}
                maneuver={maneuver}
                metersToTurn={metersToTurn}
                compact
              />}
        </div>

        {/* bottom sheet with the stop list */}
        <div style={{
          position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 600,
          background: 'var(--surface)', borderRadius: '22px 22px 0 0',
          boxShadow: '0 -8px 30px rgba(0,0,0,0.20)',
          height: sheetOpen ? '60%' : 150, transition: 'height .32s cubic-bezier(.4,0,.2,1)',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
        }}>
          <button onClick={() => setSheetOpen((v) => !v)} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '10px 0 6px', fontFamily: 'inherit' }}>
            <div style={{ width: 38, height: 5, borderRadius: 99, background: 'var(--rail)', margin: '0 auto' }} />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '2px 18px 8px' }}>
            <div style={{ fontWeight: 800, fontSize: 16, color: 'var(--text)' }}>תחנות המסלול</div>
            <div style={{ fontSize: 13, color: 'var(--text-mut)', fontWeight: 700 }}>{stops.length} תחנות</div>
          </div>
          <div style={{ flex: 1, overflow: 'auto', padding: '0 4px 16px' }}>
            <StopsTimeline stops={stops} driverF={driverF} onStopClick={focusStop} focusStopId={focus} dense={!sheetOpen} />
          </div>
        </div>
      </div>
    </div>
  );
}

window.MapScreen = MapScreen;
window.TripHeader = TripHeader;
