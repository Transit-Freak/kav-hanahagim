// Hebrew speech for prepared instructions. No directions are inferred from geometry.
(function(root) {
  const directions = {left:'פנו שמאלה',right:'פנו ימינה','keep-left':'היצמדו לשמאל','keep-right':'היצמדו לימין'};
  function instruction(m) {
    if (!m) return '';
    if (m.kind === 'roundabout') return Number.isInteger(m.exit) && m.exit > 0
      ? `בכיכר צאו ביציאה מספר ${m.exit}` : 'כיכר בהמשך. מספר היציאה אינו זמין';
    const first = directions[m.kind];
    return first ? first + (directions[m.then] ? ', ואז ' + directions[m.then] : '') : '';
  }
  function tracker() {
    const seen = new Map();
    return {reset(){seen.clear();}, next(m, f, total) {
      if (!m || !Number.isFinite(f) || !Number.isFinite(total) || total <= 0) return null;
      const meters = (m.f - f) * total;
      if (!Number.isFinite(meters) || meters < 0 || meters > 300 || !instruction(m)) return null;
      const key = JSON.stringify([m.f,m.kind,m.exit,m.then]);
      const stage = meters <= 50 ? 2 : 1;
      if ((seen.get(key) || 0) >= stage) return null;
      seen.set(key, stage);
      return (meters <= 10 ? 'כעת, ' : `בעוד ${Math.max(10,Math.round(meters/10)*10)} מטר, `) + instruction(m);
    }};
  }
  function create(host, onError) {
    const synth = host.speechSynthesis;
    let current = null;
    const supported = !!(synth && host.SpeechSynthesisUtterance);
    const voice = () => supported && synth.getVoices().find(v => /^(he|iw)([-_]|$)/i.test(v.lang));
    function cancel() { if(current) { current.onerror = null; current = null; synth.cancel(); } }
    return { supported, voice, cancel, speak(text) {
      const selected = voice();
      if (!selected) { onError('לא נמצא קול עברי במכשיר. יש להתקין קול עברי בהגדרות הדיבור ולנסות שוב.'); return false; }
      cancel();
      try {
        const utterance = new host.SpeechSynthesisUtterance(text);
        utterance.voice = selected; utterance.lang = selected.lang; utterance.rate = 1;
        current = utterance;
        utterance.onend = () => { if(current === utterance) current = null; };
        utterance.onerror = () => { if(current === utterance) { current = null; onError('הכריזה נכשלה. נסו להפעיל אותה שוב.'); } };
        synth.speak(utterance); return true;
      } catch (_) { current = null; onError('הכריזה אינה זמינה בדפדפן הזה.'); return false; }
    }};
  }
  const api = {instruction,tracker,create};
  if(typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.RouteSpeech = api;
})(typeof window === 'undefined' ? {} : window);
