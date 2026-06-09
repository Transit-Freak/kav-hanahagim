<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>קו הנהגים</title>
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Assistant:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
<style>
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; min-height: 100%; }
  body {
    font-family: 'Assistant', system-ui, sans-serif; background: #0E1116; color: #EEF1F6;
    -webkit-font-smoothing: antialiased; min-height: 100dvh;
    display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 28px;
  }
  .wrap { width: 100%; max-width: 720px; }
  .brand { display: flex; align-items: center; gap: 14px; margin-bottom: 6px; }
  .logo { width: 54px; height: 54px; border-radius: 15px; background: #1F5EE0; display: flex; align-items: center; justify-content: center; box-shadow: 0 6px 20px rgba(31,94,224,0.4); }
  .logo svg { width: 30px; height: 30px; }
  h1 { font-size: 30px; font-weight: 800; margin: 0; letter-spacing: -0.01em; }
  .sub { color: #9AA4B2; font-size: 16px; margin: 4px 0 26px; line-height: 1.5; }
  .cards { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
  @media (max-width: 560px) { .cards { grid-template-columns: 1fr; } }
  .card {
    display: block; text-decoration: none; color: inherit; background: #171B22; border: 1px solid #262C36;
    border-radius: 18px; padding: 22px; transition: border-color .15s, transform .15s, background .15s;
  }
  .card:hover { border-color: #6098FF; transform: translateY(-2px); background: #1A1F28; }
  .ic { width: 46px; height: 46px; border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-bottom: 14px; }
  .ic svg { width: 26px; height: 26px; }
  .card h2 { font-size: 19px; font-weight: 800; margin: 0 0 5px; }
  .card p { font-size: 14px; color: #9AA4B2; margin: 0; line-height: 1.55; }
  .tag { display: inline-block; font-size: 11px; font-weight: 700; padding: 3px 9px; border-radius: 99px; margin-top: 12px; }
  .foot { color: #5E6675; font-size: 12.5px; margin-top: 24px; line-height: 1.6; }
  .foot code { background: #1E242D; padding: 1px 6px; border-radius: 5px; font-family: ui-monospace, monospace; color: #9AA4B2; }
</style>
</head>
<body>
  <div class="wrap">
    <div class="brand">
      <div class="logo">
        <svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="3" width="16" height="14" rx="2.5"/><path d="M4 11h16"/><path d="M7 21v-2M17 21v-2"/></svg>
      </div>
      <div>
        <h1>קו הנהגים</h1>
      </div>
    </div>
    <div class="sub">ניווט ומעקב לנהגי תחבורה ציבורית — מבוסס נתוני GTFS, מפה אמיתית ותצלום לוויין.</div>

    <div class="cards">
      <a class="card" href="קו הנהגים.html">
        <div class="ic" style="background: rgba(96,152,255,0.15); color: #6098FF;">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s7-6.3 7-11a7 7 0 10-14 0c0 4.7 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>
        </div>
        <h2>אפליקציית הנהג</h2>
        <p>טעינת GTFS, חיפוש קו/מק״ט, ומסך נהיגה עם מפה, תחנות וחיווי ניווט.</p>
        <span class="tag" style="background: rgba(96,152,255,0.15); color: #6098FF;">לטלפון / לכל מכשיר</span>
      </a>

      <a class="card" href="בדיקת מנוע GTFS.html">
        <div class="ic" style="background: rgba(52,199,123,0.15); color: #34C77B;">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v4M12 18v4M4.9 4.9l2.8 2.8M16.3 16.3l2.8 2.8M2 12h4M18 12h4M4.9 19.1l2.8-2.8M16.3 7.7l2.8-2.8"/></svg>
        </div>
        <h2>בדיקת מנוע GTFS</h2>
        <p>כלי אבחון: קריאת הקובץ, ספירות, תצוגת מסלול, הדמיית נסיעה וחיבור OSRM.</p>
        <span class="tag" style="background: rgba(224,162,58,0.15); color: #E0A23A;">ניסיוני · למחשב</span>
      </a>
    </div>

    <div class="foot">
      להעלאה ל-GitHub Pages: דחפו את כל הקבצים, ואז <code>Settings → Pages → Deploy from branch → main / root</code>.
      הכל סטטי — המפה, הלוויין ו-OSRM נטענים מהדפדפן. אין צורך בשרת.
    </div>
  </div>
</body>
</html>
