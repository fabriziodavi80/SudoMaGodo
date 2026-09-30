/* SMG – Sudo Ma Godo · interfaccia */
(function () {
'use strict';
const E = window.SMG;
const KEY = 'smg-v1';
const ENGINE_V = 1;
const ICU = 'https://intervals.icu/api/v1/athlete/';
const $ = s => document.querySelector(s);
const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const today = () => E.ymd(new Date());

/* ------------------------------------------------------------------ */
/* Stato                                                               */
/* ------------------------------------------------------------------ */
function fresh() {
  return { profile: E.defaultProfile(today()), checkins: {}, plans: {}, activities: {}, extraDone: {},
           icu: { key: '', athlete: '0', auto: true, name: '', last: 0, ok: false }, loc: null, wx: null, welcome: true };
}
function load() {
  try {
    const x = JSON.parse(localStorage.getItem(KEY));
    if (x && x.profile) { const f = fresh(); return Object.assign(f, x, { icu: Object.assign(f.icu, x.icu || {}) }); }
  } catch (e) {}
  return fresh();
}
let S = load();
function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }

let view = 'oggi', weekOff = 0, editCI = false, busy = {};

/* ------------------------------------------------------------------ */
/* Icone                                                               */
/* ------------------------------------------------------------------ */
const I = {
  bike: '<circle cx="5.5" cy="16.5" r="3.5"/><circle cx="18.5" cy="16.5" r="3.5"/><path d="M5.5 16.5 9 9h6.5l3 7.5M9 9l3 7.5h-6.5M12 16.5 15.5 9M14 6h2.5"/>',
  indoor: '<circle cx="6.5" cy="12.5" r="3.5"/><circle cx="17.5" cy="12.5" r="3.5"/><path d="M6.5 12.5 9.5 6h5.5l2.5 6.5M9.5 6l2.5 6.5h-5.5M12 12.5 15 6M13 3.5h2.5M3 21h18M17.5 16v5M6.5 16l-1.5 5"/>',
  mtb: '<circle cx="5.5" cy="17" r="3.5"/><circle cx="18.5" cy="17" r="3.5"/><path d="M5.5 17 9 10h6.5l3 7M9 10l3 7h-6.5M12 17l3.5-7M14 7h2.5M2 7l3-4 2.5 3 1.5-2"/>',
  road: '<circle cx="5.5" cy="16.5" r="3.5"/><circle cx="18.5" cy="16.5" r="3.5"/><path d="M5.5 16.5 9 9h6.5l3 7.5M9 9l3 7.5h-6.5M12 16.5 15.5 9M14 6.5h3.5l-1 2"/>',
  run: '<circle cx="15" cy="4.5" r="2"/><path d="M7 21l3.5-6 3 2.5V22M9.5 11.5l3-3.5 3.5 3 3 1M12.5 8 9 9.5 7 12.5M13.5 17.5l-3-2.5 2-4"/>',
  strength: '<path d="M6.5 6.5v11M17.5 6.5v11M3.5 9v6M20.5 9v6M6.5 12h11"/>',
  dice: '<rect x="3" y="3" width="18" height="18" rx="4"/><circle cx="8.5" cy="8.5" r="1.2" fill="currentColor"/><circle cx="15.5" cy="15.5" r="1.2" fill="currentColor"/><circle cx="12" cy="12" r="1.2" fill="currentColor"/>',
  send: '<path d="M22 2 11 13M22 2l-7 20-4-9-9-4z"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  x: '<path d="M18 6 6 18M6 6l12 12"/>',
  chev: '<path d="m6 9 6 6 6-6"/>',
  left: '<path d="m15 18-6-6 6-6"/>',
  right: '<path d="m9 18 6-6-6-6"/>',
  flag: '<path d="M4 22V4M4 4h13l-2 4 2 4H4"/>',
  moon: '<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>',
  link: '<path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/>',
  sync: '<path d="M21 12a9 9 0 0 1-15.5 6.2L3 16M3 12a9 9 0 0 1 15.5-6.2L21 8M21 3v5h-5M3 21v-5h5"/>',
  pin: '<path d="M12 22s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12z"/><circle cx="12" cy="10" r="2.5"/>',
  undo: '<path d="M9 14 4 9l5-5M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/>',
  cal: '<rect x="3" y="4.5" width="18" height="16.5" rx="3"/><path d="M3 9.5h18M8 2.5v4M16 2.5v4"/>'
};
const ico = (k, cls) => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"' + (cls ? ' class="' + cls + '"' : '') + '>' + I[k] + '</svg>';
const face = n => {
  const m = ['M8 17q4-4 8 0', 'M8 16.5q4-2 8 0', 'M8 16h8', 'M8 15.5q4 2 8 0', 'M7.5 14.5q4.5 5 9 0'][n - 1];
  const eyes = n === 1 ? '<path d="M7.5 9.5l2 1M16.5 9.5l-2 1"/>' : '<circle cx="9" cy="10" r="1" fill="currentColor"/><circle cx="15" cy="10" r="1" fill="currentColor"/>';
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="9.5"/>' + eyes + '<path d="' + m + '"/></svg>';
};
function wxIcon(code) {
  const sun = '<circle cx="12" cy="12" r="4" fill="#FFC940" stroke="none"/><path stroke="#FFC940" d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4"/>';
  const cloud = c => '<path fill="' + c + '" stroke="none" d="M7 19a4.5 4.5 0 0 1-.5-9A6 6 0 0 1 18 9.5 4.5 4.5 0 0 1 17.5 19z"/>';
  let s;
  if (code <= 1) s = sun;
  else if (code === 2) s = '<g transform="translate(-4 -4) scale(.8)">' + sun + '</g><g transform="translate(3 3) scale(.8)">' + cloud('#B9BECC') + '</g>';
  else if (code <= 48) s = cloud('#B9BECC');
  else if (code <= 67 || (code >= 80 && code <= 82)) s = cloud('#8B93A8') + '<path stroke="#3FD4FF" d="M8 21l1-2M12 22l1-2M16 21l1-2"/>';
  else if (code <= 77 || code === 85 || code === 86) s = cloud('#B9BECC') + '<path stroke="#fff" d="M9 21h.01M13 22h.01M16 21h.01"/>';
  else s = cloud('#6E7690') + '<path stroke="#FFC940" d="M12 15l-2 4h3l-2 4"/>';
  return '<svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round">' + s + '</svg>';
}
const SC = { indoor: 'var(--indoor)', mtb: 'var(--mtb)', road: 'var(--road)', run: 'var(--run)', strength: 'var(--strength)' };
const ZC = { WALK: '#4A5368', Z1: '#5E6A82', Z2: '#3FD4FF', Z3: '#C4FF45', SS: '#E6EE3A', Z4: '#FFC940', O4: '#FFA41C', Z5: '#FF6A3D', Z6: '#FF3D6E', Z7: '#D24BFF', TEST: '#FF3D3D', MIX: '#8FA0B8' };
const LC = { green: 'var(--green)', yellow: 'var(--yellow)', red: 'var(--red)' };
const SH = { indoor: '#A393FF', mtb: '#C4FF45', road: '#3FD4FF', run: '#FF6FA0', strength: '#FFC940' };
const sportIcon = s => '<div class="sporticon" style="background:' + SH[s] + '24;color:' + SH[s] + '">' + ico(s) + '</div>';

/* ------------------------------------------------------------------ */
/* Formattazione                                                       */
/* ------------------------------------------------------------------ */
const GG = ['domenica', 'lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato'];
const MM = ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre'];
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
function longDate(d) { const x = E.parse(d); return cap(GG[x.getDay()]) + ' ' + x.getDate() + ' ' + MM[x.getMonth()]; }
function fmtMin(m) { m = Math.round(m); if (m < 60) return m + "'"; const h = Math.floor(m / 60), r = m % 60; return h + 'h' + (r ? String(r).padStart(2, '0') : ''); }
function fmtStep(s) { const m = Math.floor(s / 60), r = s % 60; if (!m) return r + '"'; return m + "'" + (r ? String(r).padStart(2, '0') + '"' : ''); }
function toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.add('on'); clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('on'), 2600); }

/* ------------------------------------------------------------------ */
/* Meteo (Open-Meteo, senza account)                                   */
/* ------------------------------------------------------------------ */
function wxFor(d) { return S.wx && S.wx.days && S.wx.days[d] || null; }
async function fetchWeather(force) {
  if (!S.loc) return false;
  if (!force && S.wx && Date.now() - S.wx.at < 2 * 3600e3 && S.wx.days[today()]) return false;
  const u = 'https://api.open-meteo.com/v1/forecast?latitude=' + S.loc.lat + '&longitude=' + S.loc.lon +
    '&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum,wind_speed_10m_max&timezone=auto&forecast_days=3';
  try {
    const r = await fetch(u); if (!r.ok) throw 0; const j = await r.json(); const days = {};
    j.daily.time.forEach((d, i) => days[d] = { code: j.daily.weather_code[i], tmax: j.daily.temperature_2m_max[i], tmin: j.daily.temperature_2m_min[i],
      rain: j.daily.precipitation_probability_max[i] || 0, mm: j.daily.precipitation_sum[i] || 0, wind: j.daily.wind_speed_10m_max[i] || 0 });
    S.wx = { at: Date.now(), days }; save(); return true;
  } catch (e) { return false; }
}
function renderWx() {
  const w = wxFor(today()); const b = $('#wx');
  if (!S.loc) { b.innerHTML = ico('pin') + '<span class="mut">Meteo</span>'; return; }
  if (!w) { b.innerHTML = ico('pin') + '<span class="mut">' + esc(S.loc.name || '…') + '</span>'; return; }
  b.innerHTML = wxIcon(w.code) + '<span>' + Math.round(w.tmax) + '°</span><span class="mut">' + (w.rain >= 20 ? w.rain + '%' : Math.round(w.tmin) + '°') + '</span>';
}
function locate() {
  if (!navigator.geolocation) { toast('Posizione non disponibile'); return; }
  toast('Cerco la tua posizione…');
  navigator.geolocation.getCurrentPosition(async p => {
    S.loc = { lat: +p.coords.latitude.toFixed(3), lon: +p.coords.longitude.toFixed(3), name: 'Posizione attuale' };
    save(); await fetchWeather(true); refreshToday(true); render();
  }, () => toast('Permesso posizione negato: cerca la località nel Profilo'), { timeout: 10000, maximumAge: 3600e3 });
}
async function searchPlace(q) {
  const r = await fetch('https://geocoding-api.open-meteo.com/v1/search?count=5&language=it&name=' + encodeURIComponent(q));
  const j = await r.json(); return (j.results || []).map(x => ({ lat: +x.latitude.toFixed(3), lon: +x.longitude.toFixed(3), name: x.name + (x.admin2 ? ' (' + x.admin2 + ')' : x.admin1 ? ' (' + x.admin1 + ')' : '') }));
}

/* ------------------------------------------------------------------ */
/* Intervals.icu                                                       */
/* ------------------------------------------------------------------ */
const icuOn = () => !!(S.icu.key && S.icu.ok);
async function icu(path, method, body) {
  const r = await fetch(ICU + encodeURIComponent(S.icu.athlete || '0') + path, {
    method: method || 'GET',
    headers: Object.assign({ Authorization: 'Basic ' + btoa('API_KEY:' + S.icu.key.trim()) }, body ? { 'Content-Type': 'application/json' } : {}),
    body: body ? JSON.stringify(body) : undefined
  });
  if (!r.ok) { const e = new Error('HTTP ' + r.status); e.status = r.status; throw e; }
  const t = await r.text(); return t ? JSON.parse(t) : null;
}
async function icuConnect() {
  try {
    const a = await icu('');
    S.icu.ok = true; S.icu.name = a && (a.name || a.firstname) || ''; save();
    toast('Collegato a Intervals.icu' + (S.icu.name ? ': ciao ' + S.icu.name.split(' ')[0] + '!' : ''));
    await icuSync(true); return true;
  } catch (e) {
    S.icu.ok = false; save();
    toast(e.status === 401 || e.status === 403 ? 'Chiave API non valida' : 'Intervals.icu non raggiungibile');
    return false;
  }
}
async function icuSync(quiet) {
  if (!icuOn() || busy.sync) return;
  busy.sync = true; if (!quiet) render();
  const t = today(), from = E.addDays(t, -28);
  try {
    const well = await icu('/wellness?oldest=' + from + '&newest=' + t);
    (well || []).forEach(w => {
      const d = w.id; if (!d) return;
      const c = S.checkins[d] || (S.checkins[d] = {}); c.src = c.src || {};
      const put = (k, v) => { if (v == null || v === '' || isNaN(v)) return; if (c[k] == null || c[k] === '' || c.src[k] === 'icu') { c[k] = Math.round(v * 10) / 10; c.src[k] = 'icu'; } };
      put('hrv', w.hrv); put('rhr', w.restingHR); put('sleep', w.sleepScore);
      if (w.sleepSecs) put('sleepH', w.sleepSecs / 3600);
      if (w.readiness) put('garmin', w.readiness);
      if (w.ctl != null && w.atl != null) { c.tsb = Math.round(w.ctl - w.atl); c.src.tsb = 'icu'; }
      if (!Object.keys(c).some(k => k !== 'src')) delete S.checkins[d];
    });
    const acts = await icu('/activities?oldest=' + E.addDays(t, -21) + '&newest=' + t);
    const byDay = {};
    (acts || []).forEach(a => {
      const d = (a.start_date_local || '').slice(0, 10); if (!d) return;
      (byDay[d] = byDay[d] || []).push({ sport: E.activitySport(a.type), level: E.activityLevel(a), name: a.name || a.type,
        min: Math.round((a.moving_time || a.elapsed_time || 0) / 60), load: a.icu_training_load || 0 });
    });
    for (let d = E.addDays(t, -21); d <= t; d = E.addDays(d, 1)) { if (byDay[d]) S.activities[d] = byDay[d]; else delete S.activities[d]; }
    Object.keys(byDay).forEach(d => {
      const p = S.plans[d];
      if (p && !p.rest && p.status === 'planned' && byDay[d].some(a => a.sport !== 'strength' && a.min >= 15)) { p.status = 'done'; p.via = 'icu'; }
    });
    S.icu.last = Date.now(); save();
    refreshToday(false);
    if (!quiet) toast('Dati aggiornati da Intervals.icu');
  } catch (e) {
    if (!quiet) toast(e.status === 401 || e.status === 403 ? 'Chiave API non valida' : 'Sincronizzazione non riuscita');
  }
  busy.sync = false; render();
}
async function icuPush(p, quiet) {
  if (!icuOn() || !p || p.rest) return;
  busy.push = true; if (!quiet) render();
  try {
    await icu('/events/bulk?upsert=true', 'POST', [E.icuEvent(p, S.profile)]);
    p.pushed = true; p.pushedSig = sig(p); save();
    if (!quiet) toast('Inviata: sincronizza Garmin Connect e MyWhoosh');
  } catch (e) { if (!quiet) toast('Invio non riuscito (' + (e.status || 'rete') + ')'); }
  busy.push = false; render();
}
async function icuDelete(date) {
  if (!icuOn()) return;
  try { await icu('/events/bulk-delete', 'PUT', [{ external_id: 'smg-' + date }]); } catch (e) {}
}
const sig = p => [p.tid, p.sport, p.dur, p.challenge].join('|');

/* ------------------------------------------------------------------ */
/* Piano del giorno                                                    */
/* ------------------------------------------------------------------ */
function planFor(d, forceRegen) {
  const old = S.plans[d];
  const rd = E.readiness(S.checkins, d); const light = rd ? rd.light : null;
  if (old && (old.status === 'done' || old.status === 'skipped')) return old;
  if (old && !forceRegen && old.lightUsed === light && old.v === ENGINE_V) return old;
  const opts = old && old.opts || {};
  const wx = wxFor(d);
  const np = E.propose(S, d, Object.assign({}, opts, { weather: wx }));
  Object.assign(np, { opts, lightUsed: light, status: 'planned', v: ENGINE_V, wxUsed: !!wx,
    pushed: old ? !!old.pushed : false, pushedSig: old ? old.pushedSig : null });
  S.plans[d] = np; save();
  return np;
}
// rigenera la seduta di oggi (se non ancora fatta) e la reinvia se era già su Intervals
function refreshToday(force) {
  const d = today(); const before = S.plans[d];
  const p = planFor(d, force);
  if (p === before) return p;
  syncPushState(p);
  return p;
}
function syncPushState(p) {
  if (!icuOn()) return;
  if (p.rest) { if (p.pushed) { p.pushed = false; save(); icuDelete(p.date); } return; }
  if (p.status !== 'planned') return;
  if ((p.pushed && p.pushedSig !== sig(p)) || (S.icu.auto && !p.pushed && p.lightUsed)) icuPush(p, true);
}
function setOpts(fn) {
  const d = today(); const p = S.plans[d]; if (!p) return;
  p.opts = Object.assign({}, p.opts); fn(p.opts, p); save();
  const np = planFor(d, true); syncPushState(np); render();
}

/* ------------------------------------------------------------------ */
/* Componenti                                                          */
/* ------------------------------------------------------------------ */
function chartSVG(sections) {
  const bars = E.profileBars(sections); const tot = bars.reduce((a, b) => a + b.d, 0) || 1;
  const W = 600, H = 96; let x = 0, out = ''; const top = Math.max(3.5, ...bars.map(b => b.lvl));
  bars.forEach(b => {
    const w = b.d / tot * W; const h = Math.max(6, b.lvl / top * (H - 6));
    out += '<rect x="' + (x + 0.4).toFixed(1) + '" y="' + (H - h).toFixed(1) + '" width="' + Math.max(0.8, w - 0.8).toFixed(1) + '" height="' + h.toFixed(1) + '" rx="' + Math.min(3, w / 3).toFixed(1) + '" fill="' + ZC[b.z] + '"/>';
    x += w;
  });
  return '<svg class="chart" viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="none" style="width:100%;height:84px">' + out + '</svg>';
}
function dots(level) { let s = '<div class="dots">'; for (let i = 1; i <= 5; i++) s += '<i' + (i <= level ? ' style="background:' + (level >= 4 ? 'var(--hot)' : level === 3 ? 'var(--hot2)' : 'var(--lime)') + '"' : '') + '></i>'; return s + '</div>'; }

function stepsHTML(sections, sport) {
  const P = S.profile; let h = '';
  sections.forEach(s => {
    h += '<div class="sec"><div class="sh">' + esc(s.title) + (s.rep > 1 ? '<span class="rep">×' + s.rep + '</span>' : '') + '</div>';
    s.steps.forEach(x => {
      const Z = E.ZONES[x.z];
      const sub = x.cad && E.SPORTS[sport].target === 'power' ? x.cad[0] + '–' + x.cad[1] + ' rpm' : 'RPE ' + Z.rpe;
      h += '<div class="stp" style="box-shadow:inset 4px 0 0 ' + ZC[x.z] + '"><div class="t">' + fmtStep(x.d) + '</div><div class="n">' + esc(x.txt || Z.name) + '<small>' + esc(Z.name) + '</small></div>' +
           '<div class="g">' + esc(E.targetText(x.z, sport, P)) + '<small>' + esc(sub) + '</small></div></div>';
    });
    h += '</div>';
  });
  return h;
}

function workoutHTML(p, ro) {
  const t = E.TEMPLATES[p.tid]; const sections = E.build(p, S.profile); const st = E.stats(sections, p.sport, S.profile);
  const sp = E.SPORTS[p.sport]; const col = SC[p.sport];
  let h = '<div class="card wo"><div class="glow" style="background:radial-gradient(120% 100% at 0% 0%,' + col + ',transparent 70%)"></div><div class="top">' +
    '<div class="meta">' + sportIcon(p.sport) + '<div><b>' + sp.name + '</b><small>' + sp.sub + '</small></div>' +
    '<div class="lvl">' + dots(p.level) + '<small>' + E.LEVELS[p.level] + '</small></div></div>' +
    '<h2>' + esc(t.name) + '</h2>' +
    '<div class="big"><div><strong class="num">' + fmtMin(st.min) + '</strong>durata</div><div><strong class="num">' + st.tss + '</strong>carico stimato</div>' +
    (p.deload ? '<div><span class="tag">Scarico</span></div>' : '') + '</div>' + chartSVG(sections) + '</div><div class="body">' +
    '<p class="desc">' + esc(t.desc) + '</p>';
  if (p.challenge) h += '<div class="challenge">' + ico('flag') + '<div><b>Sfida del giorno</b><span>' + esc(p.challenge) + '</span></div></div>';
  if (!ro && p.reasons && p.reasons.length) h += '<div class="reasons">' + p.reasons.map(r => '<span class="pill">' + esc(r) + '</span>').join('') + '</div>';
  h += '<details class="steps"' + (ro ? ' open' : '') + '><summary>Dettaglio della seduta ' + ico('chev') + '</summary>' + stepsHTML(sections, p.sport) + '</details>';

  if (!ro) {
    if (p.status === 'planned') {
      const dayCfg = S.profile.days[E.dow(p.date)] || {};
      const maxD = p.opts && p.opts.extra ? 60 : (dayCfg.max || 75);
      const sports = ['indoor', 'mtb', 'road', 'run'].filter(s => S.profile.sports[s]);
      const fs = p.opts && p.opts.forceSport, fd = p.opts && p.opts.forceDur;
      h += '<div class="ctl"><div class="lab">Sport</div><div class="chips"><button class="chip' + (!fs ? ' on' : '') + '" data-sport="">Automatico</button>' +
        sports.map(s => '<button class="chip' + (fs === s ? ' on' : '') + '" data-sport="' + s + '">' + E.SPORTS[s].name + '</button>').join('') + '</div>' +
        '<div class="lab">Tempo a disposizione</div><div class="chips"><button class="chip' + (!fd ? ' on' : '') + '" data-dur="">Automatico</button>' +
        [30, 45, 60, 75, 90, 105, 120, 150].filter(m => m <= maxD).map(m => '<button class="chip' + (fd === m ? ' on' : '') + '" data-dur="' + m + '">' + fmtMin(m) + '</button>').join('') + '</div></div>';
      h += '<div class="actions">' +
        '<button class="btn" id="aReroll">' + ico('dice') + 'Rilancia</button>' +
        (icuOn() ? '<button class="btn" id="aPush">' + (busy.push ? ico('sync', 'spin') : ico(p.pushed ? 'check' : 'send')) + (p.pushed ? 'Inviata' : 'Invia') + '</button>'
                 : '<button class="btn" id="aIcuHow">' + ico('link') + 'Invia…</button>') +
        '<button class="btn hot wide" id="aDone">' + ico('check') + 'Fatta! Sudato e goduto</button>' +
        '<button class="btn ghost wide sm" id="aSkip">Oggi salto</button></div>';
      if (p.pushed) h += '<div class="src" style="margin:12px 0 0">' + ico('check') + 'Su Intervals.icu: arriva su Fenix, Edge e MyWhoosh alla prossima sincronizzazione</div>';
    } else {
      h += p.status === 'done'
        ? '<div class="done-banner">' + ico('check') + '<div><b>Fatta! Sudato e goduto.</b><span>' + (p.via === 'icu' ? 'Rilevata da Intervals.icu' : 'Segnata a mano') + '</span></div></div>'
        : '<div class="done-banner skip">' + ico('x') + '<div><b>Seduta saltata</b><span>Nessun problema: domani è un altro giro.</span></div></div>';
      h += '<button class="btn ghost sm full" id="aUndo" style="margin-top:8px">' + ico('undo') + 'Annulla</button>';
    }
  }
  return h + '</div></div>';
}

function extraHTML(id, d) {
  const x = E.EXTRAS.find(e => e.id === id); if (!x) return '';
  const done = S.extraDone[d] === id;
  return '<div class="card extra"><h3>' + ico('strength') .replace('<svg', '<svg style="width:16px;height:16px;color:var(--strength)"') + 'Extra facoltativo · ' + x.kind + '<span class="sp"></span><span class="tag">' + x.min + "'</span></h3>" +
    '<b style="font-size:17px">' + esc(x.name) + '</b><details class="steps"><summary>Esercizi ' + ico('chev') + '</summary><ol>' +
    x.items.map(i => '<li>' + esc(i[0]) + '<span>' + esc(i[1]) + '</span></li>').join('') + '</ol></details>' +
    '<button class="btn sm ' + (done ? 'lime' : '') + '" id="aExtra" data-x="' + id + '" style="margin-top:10px">' + ico('check') + (done ? 'Fatto' : 'Segna come fatto') + '</button></div>';
}

function checkinHTML(d) {
  const c = S.checkins[d] || {}; const src = c.src || {};
  const f = (k, lab, unit, ph) => '<div class="field"><label>' + lab + '</label><div class="unit"><input inputmode="decimal" id="ci_' + k + '" value="' + (c[k] != null ? esc(c[k]) : '') + '" placeholder="' + ph + '"' +
    (src[k] === 'icu' ? ' style="border-color:rgba(196,255,69,.5)"' : '') + '><span>' + unit + '</span></div></div>';
  const fromIcu = Object.values(src).includes('icu');
  const labels = ['A pezzi', 'Stanco', 'Normale', 'Bene', 'Al top'];
  return '<div class="card"><h3>Check-in del mattino<span class="sp"></span>' + (editCI ? '<button class="btn ghost sm" id="ciCancel" style="padding:0 4px">Chiudi</button>' : '') + '</h3>' +
    '<div class="feel">' + labels.map((l, i) => '<button data-feel="' + (i + 1) + '"' + (+c.feel === i + 1 ? ' class="on"' : '') + '>' + face(i + 1) + l + '</button>').join('') + '</div>' +
    (fromIcu ? '<div class="src">' + ico('link') + 'Valori dal Fenix via Intervals.icu</div>' : '') +
    '<div class="grid2">' + f('hrv', 'HRV notturna', 'ms', 'es. 62') + f('rhr', 'FC a riposo', 'bpm', 'es. 46') +
    f('sleep', 'Punteggio sonno', '/100', 'es. 78') + f('garmin', 'Prontezza Garmin', '/100', 'facoltativo') + '</div>' +
    '<label class="check"><span class="switch"><input type="checkbox" id="ci_pain"' + (c.pain ? ' checked' : '') + '><i></i></span>Qualche dolore o acciacco oggi</label>' +
    '<button class="btn hot full" id="ciGo">Calcola il semaforo</button></div>';
}

function lightHTML(rd) {
  const msg = { green: ['Via libera', 'Gambe pronte: oggi si può spingere.'], yellow: ['Con giudizio', 'Si lavora, ma senza esagerare.'], red: ['Recupero', 'Oggi il corpo chiede di rallentare.'] }[rd.light];
  return '<div class="card"><div class="light"><div class="orb ' + rd.light + '"><span class="num">' + rd.score + '</span></div><div style="flex:1"><h2>' + msg[0] + '</h2><p>' + msg[1] + '</p></div>' +
    '<button class="btn sm" id="ciEdit">Modifica</button></div>' +
    (rd.why.length ? '<div class="why">' + rd.why.map(w => '<span class="pill">' + esc(w) + '</span>').join('') + '</div>' : '') + '</div>';
}

function restHTML(p) {
  const red = p.redRest;
  return '<div class="card rest"><div class="big">' + (red ? '🛋️' : '😌') + '</div><h2>' + (red ? 'Oggi riposo vero' : 'Giorno di riposo') + '</h2>' +
    '<p>' + (red ? 'Il semaforo è rosso: dormi, mangia bene, cammina un po\'. Domani si riparte più forti.' : 'Anche il riposo è allenamento: è adesso che il corpo si adatta e migliora.') + '</p>' +
    '<button class="btn" id="aExtraDay">' + (red ? 'Solo un giro leggerissimo' : 'Voglio muovermi lo stesso') + '</button></div>';
}

function tomorrowHTML(d) {
  const t = E.addDays(d, 1); const cfg = S.profile.days[E.dow(t)] || {}; const w = wxFor(t);
  const txt = !cfg.on ? 'Domani riposo' : cfg.long ? 'Domani giorno lungo, fino a ' + fmtMin(cfg.max) : 'Domani allenamento, fino a ' + fmtMin(cfg.max);
  return '<div class="card tomorrow">' + ico('moon') + '<div style="flex:1">' + txt + '</div>' + (w ? '<div class="wx" style="border:0;padding:0;background:none">' + wxIcon(w.code) + Math.round(w.tmax) + '°' + (w.rain >= 30 ? ' <span class="mut">' + w.rain + '%</span>' : '') + '</div>' : '') + '</div>';
}

function welcomeHTML() {
  return '<div class="card" style="background:linear-gradient(135deg,rgba(255,78,46,.18),rgba(255,164,28,.08));border-color:rgba(255,164,28,.35)">' +
    '<h3>Benvenuto in SMG<span class="sp"></span><button class="btn ghost sm" id="wClose" style="padding:0 4px">' + ico('x') + '</button></h3>' +
    '<div class="t2" style="font-size:14px">Ogni mattina: <b style="color:var(--text)">check-in</b> di 10 secondi → <b style="color:var(--text)">semaforo</b> → seduta del giorno, sempre diversa. ' +
    'Non ti piace? Tocca <b style="color:var(--text)">Rilancia</b>. Nel Profilo collega Intervals.icu per mandarla su Fenix, Edge e MyWhoosh, e imposta la località per il meteo.</div></div>';
}

/* ------------------------------------------------------------------ */
/* Vista: Oggi                                                         */
/* ------------------------------------------------------------------ */
function renderOggi() {
  const d = today(); const rd = E.readiness(S.checkins, d);
  const p = planFor(d);
  const title = p.rest ? 'Oggi si <em>ricarica</em>.' : p.status === 'planned' && p.light === 'red' ? 'Oggi si <em>recupera</em>.' : p.status === 'done' ? 'Sudato. <em>Goduto.</em>' : p.level >= 4 ? 'Oggi si <em>suda</em>.' : p.level === 3 ? 'Oggi si <em>spinge</em> il giusto.' : 'Oggi si <em>gode</em>.';
  let h = '<div class="hello"><div class="d">' + longDate(d) + '</div><h1>' + title + '</h1></div>';
  if (S.welcome) h += welcomeHTML();
  if (!p.rest || !p.redRest) h += (rd && !editCI) ? lightHTML(rd) : checkinHTML(d);
  else h += lightHTML(rd);
  h += p.rest ? restHTML(p) : workoutHTML(p);
  const exId = p.rest ? E.EXTRAS[E.hash(d) % E.EXTRAS.length].id : p.extra;
  if (S.profile.sports.strength && exId && (p.rest || p.level <= 2)) h += extraHTML(exId, d);
  h += tomorrowHTML(d);
  $('#v-oggi').innerHTML = h;
  bindOggi(p);
}

function bindOggi(p) {
  const d = today();
  const on = (id, fn) => { const el = document.getElementById(id); if (el) el.onclick = fn; };
  on('wClose', () => { S.welcome = false; save(); render(); });
  document.querySelectorAll('[data-feel]').forEach(b => b.onclick = () => {
    document.querySelectorAll('[data-feel]').forEach(x => x.classList.toggle('on', x === b));
  });
  on('ciGo', () => {
    const sel = document.querySelector('[data-feel].on');
    if (!sel) { toast('Dimmi prima come ti senti'); return; }
    const c = S.checkins[d] || {}; c.src = c.src || {};
    c.feel = +sel.dataset.feel;
    ['hrv', 'rhr', 'sleep', 'garmin'].forEach(k => {
      const v = document.getElementById('ci_' + k).value.replace(',', '.').trim();
      const n = v === '' ? null : +v;
      if (n !== c[k]) { if (c.src[k] === 'icu') delete c.src[k]; }
      c[k] = n == null || isNaN(n) ? null : n;
    });
    c.pain = document.getElementById('ci_pain').checked;
    S.checkins[d] = c; editCI = false; save();
    refreshToday(false); render(); window.scrollTo({ top: 0, behavior: 'smooth' });
  });
  on('ciEdit', () => { editCI = true; render(); });
  on('ciCancel', () => { editCI = false; render(); });
  document.querySelectorAll('[data-sport]').forEach(b => b.onclick = () => setOpts(o => { o.forceSport = b.dataset.sport || undefined; o.reroll = 0; o.exclude = []; }));
  document.querySelectorAll('[data-dur]').forEach(b => b.onclick = () => setOpts(o => { o.forceDur = b.dataset.dur ? +b.dataset.dur : undefined; }));
  on('aReroll', () => setOpts((o, pp) => { o.reroll = (o.reroll || 0) + 1; o.exclude = [...(o.exclude || []), pp.tid].slice(-4); }));
  on('aPush', () => icuPush(S.plans[d]));
  on('aIcuHow', () => openSheet('<h3 style="margin:0 0 8px;font-size:20px">Inviala a Fenix, Edge e MyWhoosh</h3><p class="t2">Collega Intervals.icu nel Profilo: da lì la seduta arriva da sola su Garmin Connect (e quindi su orologio e ciclocomputer) e nel calendario di MyWhoosh.</p><button class="btn hot full" id="goProf">Vai al Profilo</button>',
    () => { document.getElementById('goProf').onclick = () => { closeSheet(); go('profilo'); }; }));
  on('aDone', () => { const x = S.plans[d]; x.status = 'done'; x.via = 'manual'; save(); toast('Grande! Sudato e goduto 💪'); render(); window.scrollTo({ top: 0, behavior: 'smooth' }); });
  on('aSkip', () => { const x = S.plans[d]; x.status = 'skipped'; if (x.pushed) { x.pushed = false; icuDelete(d); } save(); render(); });
  on('aUndo', () => { const x = S.plans[d]; x.status = 'planned'; delete x.via; save(); render(); });
  on('aExtraDay', () => { const x = S.plans[d]; x.opts = Object.assign({}, x.opts, { extra: true }); save(); const np = planFor(d, true); syncPushState(np); render(); });
  on('aExtra', e => { const id = e.currentTarget.dataset.x; S.extraDone[d] = S.extraDone[d] === id ? null : id; save(); render(); });
}

/* ------------------------------------------------------------------ */
/* Vista: Diario                                                       */
/* ------------------------------------------------------------------ */
function dayDone(d) {
  const p = S.plans[d]; const acts = (S.activities[d] || []).filter(a => a.min >= 10);
  if (acts.length) return { min: acts.reduce((a, b) => a + b.min, 0), load: acts.reduce((a, b) => a + (b.load || 0), 0), level: Math.max(...acts.map(a => a.level)) };
  if (p && !p.rest && p.status === 'done') { const st = E.stats(E.build(p, S.profile), p.sport, S.profile); return { min: st.min, load: st.tss, level: p.level }; }
  return null;
}
function renderDiario() {
  const t = today(); const mon = E.addDays(E.monday(t), weekOff * 7); const sun = E.addDays(mon, 6);
  const a = E.parse(mon), b = E.parse(sun);
  const label = a.getDate() + (a.getMonth() !== b.getMonth() ? ' ' + MM[a.getMonth()].slice(0, 3) : '') + ' – ' + b.getDate() + ' ' + MM[b.getMonth()].slice(0, 3);
  let n = 0, min = 0, load = 0, hard = 0, rows = '';
  for (let i = 0; i < 7; i++) {
    const d = E.addDays(mon, i); const x = E.parse(d); const p = S.plans[d]; const acts = S.activities[d] || []; const dn = dayDone(d);
    if (dn) { n++; min += dn.min; load += dn.load; if (dn.level >= 4) hard++; }
    const cfg = S.profile.days[x.getDay()] || {};
    let icon = '<div class="sporticon" style="background:var(--s2);color:var(--mut)">' + ico('moon') + '</div>', title = 'Riposo', sub = '', stc = 'rest', stt = '';
    if (p && !p.rest) {
      const tp = E.TEMPLATES[p.tid]; icon = sportIcon(p.sport); title = tp.name; sub = E.SPORTS[p.sport].name + ' · ' + fmtMin(p.dur) + ' · ' + E.LEVELS[p.level];
      stc = p.status === 'done' ? 'done' : p.status === 'skipped' ? 'skip' : 'plan'; stt = p.status === 'done' ? 'Fatta' : p.status === 'skipped' ? 'Saltata' : d < t ? 'Non segnata' : 'Da fare';
    } else if (acts.length) {
      icon = sportIcon(acts[0].sport === 'other' ? 'road' : acts[0].sport); title = acts[0].name; sub = fmtMin(acts.reduce((s, y) => s + y.min, 0)) + ' · da Intervals.icu'; stc = 'done'; stt = 'Fatta';
    } else if (d > t && cfg.on) {
      icon = '<div class="sporticon" style="background:var(--s2);color:var(--mut)">' + ico('cal') + '</div>'; title = cfg.long ? 'Giorno lungo' : 'Allenamento'; sub = 'fino a ' + fmtMin(cfg.max); stc = 'plan'; stt = 'In arrivo';
    } else if (d < t && cfg.on) { title = 'Nessuna attività'; }
    if (p && !p.rest && acts.length && p.status === 'done') sub += ' · ✓ Intervals';
    rows += '<button class="day' + (d === t ? ' today' : '') + '" data-day="' + d + '"><div class="dn"><small>' + GG[x.getDay()].slice(0, 3) + '</small><b>' + x.getDate() + '</b></div>' + icon +
      '<div class="info"><b>' + esc(title) + '</b><small>' + esc(sub) + '</small></div>' + (stt ? '<span class="st ' + stc + '">' + stt + '</span>' : '') + '</button>';
  }
  // costanza: settimane consecutive con almeno 3 sedute
  let streak = 0;
  for (let k = 0; k < 52; k++) {
    const m0 = E.addDays(E.monday(t), -7 * k); let c = 0;
    for (let i = 0; i < 7; i++) if (dayDone(E.addDays(m0, i))) c++;
    if (c >= 3) streak++; else if (k > 0) break;
  }
  const variety = new Set(); for (let i = 0; i < 30; i++) { const p = S.plans[E.addDays(t, -i)]; if (p && p.status === 'done' && p.tid) variety.add(p.tid); }
  const deload = E.isDeload(S.profile, mon);
  let h = '<div class="hello"><div class="d">Diario</div><h1>La tua <em>settimana</em></h1></div>' +
    '<div class="weeknav"><button id="wPrev">' + ico('left') + '</button><b>' + label + (deload ? ' <span class="tag">Scarico</span>' : '') + '</b><button id="wNext"' + (weekOff >= 1 ? ' disabled style="opacity:.3"' : '') + '>' + ico('right') + '</button></div>' +
    '<div class="tiles"><div class="tile"><b class="num">' + n + '</b><small>Sedute</small></div><div class="tile"><b class="num">' + fmtMin(min) + '</b><small>Tempo</small></div>' +
    '<div class="tile"><b class="num">' + Math.round(load) + '</b><small>Carico</small></div><div class="tile"><b class="num">' + hard + '</b><small>Dure</small></div></div>' + rows +
    '<div class="card" style="margin-top:14px"><div class="streak"><div class="fire">' + streak + '</div><div><b>' + (streak === 1 ? 'settimana' : 'settimane') + ' di fila con almeno 3 sedute</b><div class="mut" style="font-size:13px">' +
    variety.size + ' sedute diverse negli ultimi 30 giorni</div></div></div></div>';
  $('#v-diario').innerHTML = h;
  $('#wPrev').onclick = () => { weekOff--; render(); };
  $('#wNext').onclick = () => { if (weekOff < 1) { weekOff++; render(); } };
  document.querySelectorAll('[data-day]').forEach(b => b.onclick = () => {
    const d = b.dataset.day; const p = S.plans[d];
    if (d === t) { go('oggi'); return; }
    if (!p || p.rest) return;
    let extra = '';
    if (d < t) extra = '<div class="row" style="margin-top:4px"><button class="btn" data-set="done">' + ico('check') + 'Fatta</button><button class="btn" data-set="skipped">' + ico('x') + 'Saltata</button></div>';
    openSheet('<div class="d mut" style="font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:1.2px;margin:0 2px 10px">' + longDate(d) + '</div>' + workoutHTML(p, true) + extra, () => {
      document.querySelectorAll('[data-set]').forEach(x => x.onclick = () => { p.status = x.dataset.set; save(); closeSheet(); render(); });
    });
  });
}

/* ------------------------------------------------------------------ */
/* Vista: Profilo                                                      */
/* ------------------------------------------------------------------ */
function renderProfilo() {
  const P = S.profile;
  const pace = s => Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
  const sw = (id, on) => '<span class="switch"><input type="checkbox" id="' + id + '"' + (on ? ' checked' : '') + '><i></i></span>';
  const num = (id, v, unit) => '<div class="unit field"><div class="unit"><input inputmode="decimal" id="' + id + '" value="' + v + '"><span>' + unit + '</span></div></div>';
  let h = '<div class="hello"><div class="d">Profilo</div><h1>Il tuo <em>motore</em></h1></div>';

  h += '<div class="card"><h3>Atleta</h3>' +
    '<div class="set"><div class="l"><b>FTP</b><small>' + (P.ftp / P.weight).toFixed(2) + ' W/kg</small></div><div class="v">' + num('pFtp', P.ftp, 'W') + '</div></div>' +
    '<div class="set"><div class="l"><b>Peso</b></div><div class="v">' + num('pW', P.weight, 'kg') + '</div></div>' +
    '<div class="set"><div class="l"><b>FC di soglia</b><small>Zone cardio per bici e corsa</small></div><div class="v">' + num('pLthr', P.lthr, 'bpm') + '</div></div>' +
    '<div class="set"><div class="l"><b>Passo di soglia</b><small>Per le sedute di corsa</small></div><div class="v">' + num('pPace', pace(P.thrPace), '/km') + '</div></div>' +
    '<div class="set"><div class="l"><b>Ultimo test FTP</b><small>' + longDate(P.lastTest) + ' · prossimo proposto dopo 7 settimane</small></div><button class="btn sm" id="pTest">Fatto oggi</button></div></div>';

  h += '<div class="card"><h3>Sport</h3>' +
    [['indoor', 'Rulli e MyWhoosh'], ['mtb', 'Il preferito in autunno e inverno'], ['road', 'Con misuratore di potenza']].map(([s, sub]) =>
      '<div class="set">' + sportIcon(s) + '<div class="l"><b>' + E.SPORTS[s].name + '</b><small>' + sub + '</small></div>' + sw('sp_' + s, P.sports[s]) + '</div>').join('') +
    '<div class="set">' + sportIcon('run') + '<div class="l"><b>Corsa</b><small>' + (P.sports.run ? 'Attiva' : 'In pausa') + '</small></div>' + sw('sp_run', P.sports.run) + '</div>' +
    (P.sports.run ? '<div class="set"><div class="l"><b>Fase di rientro</b><small>Tempi e progressione da concordare con chi ti segue</small></div><div class="v w"><select id="pStage">' +
      ['Cammino e corsa', 'Corsa facile', 'Completa'].map((l, i) => '<option value="' + (i + 1) + '"' + (P.runStage === i + 1 ? ' selected' : '') + '>' + l + '</option>').join('') + '</select></div></div>' : '') +
    '<div class="set">' + sportIcon('strength') + '<div class="l"><b>Forza & mobilità</b><small>Extra facoltativi nei giorni leggeri</small></div>' + sw('sp_strength', P.sports.strength) + '</div></div>';

  h += '<div class="card"><h3>La tua settimana</h3>' + [1, 2, 3, 4, 5, 6, 0].map(g => {
    const c = P.days[g] || { on: false, max: 60 };
    return '<div class="dayset"><b>' + cap(GG[g].slice(0, 3)) + '</b>' + sw('d_on_' + g, c.on) +
      '<select id="d_type_' + g + '"' + (c.on ? '' : ' class="off"') + '><option value="0"' + (!c.long ? ' selected' : '') + '>Normale</option><option value="1"' + (c.long ? ' selected' : '') + '>Lungo</option></select>' +
      '<select id="d_max_' + g + '"' + (c.on ? '' : ' class="off"') + '>' + [45, 60, 75, 90, 105, 120, 150, 180].map(m => '<option value="' + m + '"' + (c.max === m ? ' selected' : '') + '>' + fmtMin(m) + '</option>').join('') + '</select></div>';
  }).join('') + '<div class="mut" style="font-size:12.5px;margin-top:8px">Durata massima per giorno. Ogni quarta settimana è di scarico.</div></div>';

  const st = S.icu.ok ? '<div class="status ok"><i></i>Collegato' + (S.icu.name ? ' · ' + esc(S.icu.name) : '') + '</div>' : S.icu.key ? '<div class="status err"><i></i>Non collegato</div>' : '<div class="status"><i></i>Non collegato</div>';
  h += '<div class="card"><h3>Intervals.icu → Garmin e MyWhoosh</h3>' + st +
    (S.icu.ok ? '<div class="mut" style="font-size:12.5px;margin-top:4px">Ultima sincronizzazione: ' + (S.icu.last ? new Date(S.icu.last).toLocaleString('it-IT', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'mai') + '</div>' : '') +
    (!S.icu.ok ? '<div class="help"><b>Come collegarlo</b><ol><li>Crea un account gratuito su intervals.icu</li><li>In Settings collega Garmin Connect: spunta il caricamento degli allenamenti pianificati e lo scaricamento dei dati di benessere</li><li>In MyWhoosh, nelle connessioni, collega Intervals.icu</li><li>In Settings → Developer Settings genera la chiave API e incollala qui sotto</li></ol></div>' : '') +
    '<div class="grid2" style="margin-top:10px"><div class="field"><label>ID atleta</label><input id="iAth" value="' + esc(S.icu.athlete) + '" placeholder="0"></div>' +
    '<div class="field"><label>Chiave API</label><input id="iKey" type="password" value="' + esc(S.icu.key) + '" placeholder="incolla qui" autocomplete="off"></div></div>' +
    '<div class="mut" style="font-size:12px;margin:6px 2px 10px">Con ID 0 si usa il tuo account. La chiave resta solo su questo telefono.</div>' +
    '<label class="check" style="margin-top:0">' + sw('iAuto', S.icu.auto) + 'Invia da solo la seduta del giorno dopo il check-in</label>' +
    '<div class="row"><button class="btn hot" id="iGo">' + ico('link') + (S.icu.ok ? 'Ricollega' : 'Collega') + '</button>' +
    (S.icu.ok ? '<button class="btn" id="iSync">' + ico('sync', busy.sync ? 'spin' : '') + 'Aggiorna</button>' : '') + '</div>' +
    (S.icu.ok ? '<button class="btn ghost sm full" id="iOff" style="margin-top:8px">Scollega</button>' : '') + '</div>';

  h += '<div class="card"><h3>Meteo</h3><div class="set"><div class="l"><b>' + esc(S.loc ? S.loc.name : 'Nessuna località') + '</b><small>Con pioggia o freddo la proposta va sui rulli</small></div><button class="btn sm" id="lHere">' + ico('pin') + 'Qui</button></div>' +
    '<div class="row" style="margin-top:6px"><input id="lQ" placeholder="Cerca un comune…"><button class="btn" id="lFind" style="flex:none">Cerca</button></div><div class="results" id="lRes"></div></div>';

  h += '<div class="card"><h3>Dati</h3><div class="mut" style="font-size:13px;margin-bottom:10px">Tutto resta nel telefono. Fai ogni tanto un backup (la chiave API non viene esportata).</div>' +
    '<div class="row"><button class="btn" id="bExp">Esporta backup</button><button class="btn" id="bImp">Importa</button></div><input type="file" id="bFile" accept="application/json" hidden>' +
    '<button class="btn ghost sm full" id="bReset" style="margin-top:8px;color:var(--red)">Azzera tutto</button></div>' +
    '<div class="foot">SMG · Sudo Ma Godo · v1.0</div>';

  $('#v-profilo').innerHTML = h;
  bindProfilo();
}

function bindProfilo() {
  const P = S.profile; const g = id => document.getElementById(id);
  const numIn = (id, fn) => { const el = g(id); if (el) el.onchange = () => { const v = +el.value.replace(',', '.'); if (!isNaN(v) && v > 0) { fn(v); save(); render(); } else render(); }; };
  numIn('pFtp', v => P.ftp = Math.round(v)); numIn('pW', v => P.weight = v); numIn('pLthr', v => P.lthr = Math.round(v));
  g('pPace').onchange = () => { const m = g('pPace').value.match(/^(\d{1,2})[:.,'](\d{1,2})$/); if (m) { P.thrPace = +m[1] * 60 + +m[2]; save(); } render(); };
  g('pTest').onclick = () => { P.lastTest = today(); save(); toast('Ricordati di aggiornare l\'FTP'); render(); };
  const changed = () => { save(); const p = S.plans[today()]; if (p && p.status === 'planned') refreshToday(true); render(); };
  ['indoor', 'mtb', 'road', 'run', 'strength'].forEach(s => g('sp_' + s).onchange = e => {
    P.sports[s] = e.target.checked;
    if (!['indoor', 'mtb', 'road', 'run'].some(x => P.sports[x])) { P.sports[s] = true; toast('Serve almeno uno sport attivo'); }
    if (s === 'run' && e.target.checked) { P.runStage = P.runStage || 1; toast('Corsa attiva: si riparte con calma'); }
    changed();
  });
  if (g('pStage')) g('pStage').onchange = e => { P.runStage = +e.target.value; changed(); };
  [0, 1, 2, 3, 4, 5, 6].forEach(d => {
    const c = P.days[d] || (P.days[d] = { on: false, max: 60 });
    g('d_on_' + d).onchange = e => { c.on = e.target.checked; changed(); };
    g('d_type_' + d).onchange = e => { c.long = e.target.value === '1'; if (c.long && c.max < 90) c.max = 150; if (!c.long && c.max > 90) c.max = 75; changed(); };
    g('d_max_' + d).onchange = e => { c.max = +e.target.value; changed(); };
  });
  g('iGo').onclick = async () => { S.icu.key = g('iKey').value.trim(); S.icu.athlete = g('iAth').value.trim() || '0'; save(); if (!S.icu.key) { toast('Incolla la chiave API'); return; } await icuConnect(); render(); };
  g('iAuto').onchange = e => { S.icu.auto = e.target.checked; save(); };
  if (g('iSync')) g('iSync').onclick = () => icuSync(false);
  if (g('iOff')) g('iOff').onclick = () => { S.icu = { key: '', athlete: '0', auto: S.icu.auto, name: '', last: 0, ok: false }; save(); render(); };
  g('lHere').onclick = locate;
  const find = async () => {
    const q = g('lQ').value.trim(); if (q.length < 2) return;
    try {
      const res = await searchPlace(q);
      g('lRes').innerHTML = res.length ? res.map((r, i) => '<button data-i="' + i + '">' + esc(r.name) + '</button>').join('') : '<div class="mut" style="margin-top:8px">Nessun risultato</div>';
      g('lRes').querySelectorAll('button').forEach(b => b.onclick = async () => { S.loc = res[+b.dataset.i]; save(); await fetchWeather(true); refreshToday(true); toast('Meteo di ' + S.loc.name); render(); });
    } catch (e) { toast('Ricerca non riuscita'); }
  };
  g('lFind').onclick = find; g('lQ').onkeydown = e => { if (e.key === 'Enter') find(); };
  g('bExp').onclick = () => {
    const data = JSON.parse(JSON.stringify(S)); data.icu.key = ''; data.icu.ok = false;
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(data, null, 1)], { type: 'application/json' }));
    a.download = 'smg-backup-' + today() + '.json'; document.body.appendChild(a); a.click(); a.remove();
  };
  g('bImp').onclick = () => g('bFile').click();
  g('bFile').onchange = e => {
    const f = e.target.files[0]; if (!f) return; const r = new FileReader();
    r.onload = () => { try { const x = JSON.parse(r.result); if (!x.profile) throw 0; const key = S.icu; S = Object.assign(fresh(), x); S.icu = Object.assign(S.icu, { key: key.key, ok: key.ok, name: key.name }); save(); toast('Backup importato'); render(); } catch (err) { toast('File non valido'); } };
    r.readAsText(f);
  };
  g('bReset').onclick = () => openSheet('<h3 style="margin:0 0 8px;font-size:20px">Azzerare tutto?</h3><p class="t2">Profilo, check-in e diario verranno cancellati da questo telefono.</p><div class="row"><button class="btn" id="rNo">Annulla</button><button class="btn hot" id="rYes">Azzera</button></div>', () => {
    g('rNo').onclick = closeSheet; g('rYes').onclick = () => { localStorage.removeItem(KEY); S = fresh(); save(); closeSheet(); go('oggi'); };
  });
}

/* ------------------------------------------------------------------ */
/* Navigazione                                                         */
/* ------------------------------------------------------------------ */
function openSheet(html, bind) { $('#sheetBody').innerHTML = html; $('#sheet').classList.add('on'); if (bind) bind(); }
function closeSheet() { $('#sheet').classList.remove('on'); }
$('#sheet').onclick = e => { if (e.target.id === 'sheet') closeSheet(); };
function go(v) { view = v; if (v === 'diario') weekOff = 0; document.querySelectorAll('nav button').forEach(b => b.classList.toggle('on', b.dataset.v === v)); render(); window.scrollTo(0, 0); }
document.querySelectorAll('nav button').forEach(b => b.onclick = () => go(b.dataset.v));
$('#wx').onclick = () => { if (!S.loc) locate(); else go('profilo'); };

function render() {
  document.querySelectorAll('.view').forEach(v => v.classList.toggle('on', v.id === 'v-' + view));
  renderWx();
  if (view === 'oggi') renderOggi(); else if (view === 'diario') renderDiario(); else renderProfilo();
}

/* ------------------------------------------------------------------ */
/* Avvio                                                               */
/* ------------------------------------------------------------------ */
let lastDay = today();
async function boot() {
  render();
  const d = today(); const p = S.plans[d];
  const got = await fetchWeather(false);
  if (got) { const q = S.plans[d]; if (q && q.status === 'planned' && !q.wxUsed && !(q.opts && Object.keys(q.opts).length)) refreshToday(true); render(); }
  if (icuOn() && Date.now() - (S.icu.last || 0) > 10 * 60e3) icuSync(true);
  void p;
}
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState !== 'visible') return;
  if (today() !== lastDay) { lastDay = today(); editCI = false; }
  boot();
});
boot();

if ('serviceWorker' in navigator && location.protocol === 'https:') {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}

// per i test
window.__smg = { get state() { return S; }, render, go, planFor, refreshToday };
})();
