/* Shared by the app and the full-feed audit. Only supplied road instructions
   are used: route geometry alone cannot identify a junction or its exits. */
(function (root) {
  const kinds = new Set(['left', 'right', 'keep-left', 'keep-right', 'roundabout']);
  function prepare(maneuvers, totalMeters) {
    const rows = (Array.isArray(maneuvers) ? maneuvers : [])
      .filter((m) => m && kinds.has(m.kind) && Number.isFinite(m.f) && m.f >= 0 && m.f <= 1)
      .map((m) => ({ ...m, then: kinds.has(m.then) ? m.then : undefined }))
      .sort((a, b) => a.f - b.f);
    const result = [];
    for (const row of rows) {
      const previous = result[result.length - 1];
      // Remove exact duplicates only. Nearby opposite turns may be real.
      if (previous && previous.f === row.f && previous.kind === row.kind &&
          previous.exit === row.exit && previous.then === row.then &&
          previous.name === row.name) continue;
      result.push(row);
    }
    return result;
  }
  function next(rows, driverF, totalMeters) {
    if (!Number.isFinite(driverF) || !Number.isFinite(totalMeters) || totalMeters <= 0) return null;
    const mv = rows.find((m) => (m.f - driverF) * totalMeters > -20);
    // Do not hide a known upcoming turn just because it is over 350 m away.
    return mv ? { ...mv, meters: Math.max(0, (mv.f - driverF) * totalMeters) } : null;
  }
  const api = { prepare, next };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.RouteNavigation = api;
})(typeof window === 'undefined' ? {} : window);
