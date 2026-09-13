// Hebrew speech for prepared instructions. No directions are inferred from geometry.
(function(root) {
  const directions = {left:'פנו שמאלה',right:'פנו ימינה','keep-left':'היצמדו לשמאל','keep-right':'היצמדו לימין'};
  function spokenText(text) {
    return String(text).replace(/(^|[\s/·,:()])שד(?:[׳’'.])?(?=$|[\s/·,:()])/g, '$1שדרות');
  }
  function instruction(m) {
    if (!m) return '';
    if (m.kind === 'roundabout') return Number.isInteger(m.exit) && m.exit > 0
      ? `בכיכר צאו ביציאה מספר ${m.exit}` : 'כיכר בהמשך. מספר היציאה אינו זמין';
    const first = directions[m.kind];
    return first ? first + (directions[m.then] ? ', ואז ' + directions[m.then] : '') : '';
  }
  function stopLabel(stop) {
    if (!stop) return '';
    const name = stop.name || '';
    const platform = stop.platform || stop.platform_code;
    return name + (platform && !name.includes('רציף') ? ` · רציף ${platform}` : '');
  }
  function tracker() {
    const seen = new Map();
    const shortApproaches = new Set();
    return {reset(){seen.clear();shortApproaches.clear();}, nextStop(stop, f) {
      if (!stop || !stop.name || !Number.isFinite(stop.f) || stop.f <= f) return null;
      const key = JSON.stringify(['stop',stop.id,stop.seq,stop.f]);
      if (seen.has(key)) return null;
      seen.set(key,1);
      return 'התחנה הבאה: ' + stopLabel(stop);
    }, next(m, f, total, segmentMeters) {
      if (!m || !Number.isFinite(f) || !Number.isFinite(total) || total <= 0) return null;
      const meters = (m.f - f) * total;
      if (!Number.isFinite(meters) || meters < -10 || meters > 300 || !instruction(m)) return null;
      const key = JSON.stringify([m.f,m.kind,m.exit,m.then]);
      // A small crossing between GPS samples may skip the exact junction.
      // Only finish a previously observed approach, never announce an old turn on startup.
      if (meters < 0 && !seen.has(key)) return null;
      if (!seen.has(key) && (Number.isFinite(segmentMeters) ? segmentMeters < 100 : meters < 99.99)) shortApproaches.add(key);
      const stage = meters <= 10.01 ? 4 : shortApproaches.has(key) ? 1 : meters <= 20.01 ? 3 : meters <= 50 ? 2 : 1;
      if ((seen.get(key) || 0) >= stage) return null;
      seen.set(key, stage);
      return (meters <= 10.01 ? '' : `בעוד ${Math.max(10,Math.round(meters/10)*10)} מטר, `) + instruction(m);
    }};
  }
  function create(host, onError) {
    const synth = host.speechSynthesis;
    let current = null;
    const supported = !!(synth && host.SpeechSynthesisUtterance);
    const voice = () => supported && synth.getVoices().find(v => /^(he|iw)([-_]|$)/i.test(v.lang));
    function cancel() { if(current) { current.onerror = null; current = null; synth.cancel(); } }
    return { supported, voice, cancel, busy: () => !!current, speak(text) {
      const selected = voice();
      if (!selected) { onError('לא נמצא קול עברי במכשיר. יש להתקין קול עברי בהגדרות הדיבור ולנסות שוב.'); return false; }
      cancel();
      try {
        const utterance = new host.SpeechSynthesisUtterance(spokenText(text));
        utterance.voice = selected; utterance.lang = selected.lang; utterance.rate = 1;
        current = utterance;
        utterance.onend = () => { if(current === utterance) current = null; };
        utterance.onerror = () => { if(current === utterance) { current = null; onError('הכריזה נכשלה. נסו להפעיל אותה שוב.'); } };
        synth.speak(utterance); return true;
      } catch (_) { current = null; onError('הכריזה אינה זמינה בדפדפן הזה.'); return false; }
    }};
  }
  const api = {spokenText,instruction,stopLabel,tracker,create};
  if(typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.RouteSpeech = api;
})(typeof window === 'undefined' ? {} : window);
