// ============================================================================
//  Hazır duvar/ortam arka planları — canvas ile üretilir (telifsiz, çevrimdışı)
//  SignCustomiser/neuneon tarzı oda sahneleri; her preset bir dataURL üretir.
// ============================================================================

const rnd = (a, b) => a + Math.random() * (b - a);

function vignette(x, w, h, s) {
  const g = x.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.15, w / 2, h / 2, Math.max(w, h) * 0.75);
  g.addColorStop(0, 'rgba(0,0,0,0)');
  g.addColorStop(1, `rgba(0,0,0,${s})`);
  x.fillStyle = g; x.fillRect(0, 0, w, h);
}

function rr(x, rx, ry, w, h, r) {
  x.beginPath();
  x.moveTo(rx + r, ry);
  x.arcTo(rx + w, ry, rx + w, ry + h, r);
  x.arcTo(rx + w, ry + h, rx, ry + h, r);
  x.arcTo(rx, ry + h, rx, ry, r);
  x.arcTo(rx, ry, rx + w, ry, r);
  x.closePath();
}

// Saksı bitkisi silüeti
function bitki(x, cx, cy, s) {
  x.fillStyle = '#241d18';
  rr(x, cx - 16 * s, cy, 32 * s, 26 * s, 4); x.fill();
  for (let i = 0; i < 22; i++) {
    const a = Math.PI + rnd(0.15, 0.85) * Math.PI;
    const len = rnd(24, 62) * s;
    x.strokeStyle = `hsl(${rnd(95, 140)}, ${rnd(30, 55)}%, ${rnd(16, 30)}%)`;
    x.lineWidth = rnd(3, 7) * s; x.lineCap = 'round';
    x.beginPath(); x.moveTo(cx, cy); x.lineTo(cx + Math.cos(a) * len, cy + Math.sin(a) * len); x.stroke();
  }
}

// ---- Doku arka planlar ----
function tugla(x, w, h, harc, renkler) {
  x.fillStyle = harc; x.fillRect(0, 0, w, h);
  const bh = h / 9, bw = w / 6, gap = Math.max(3, bh * 0.09);
  for (let row = 0, y = 0; y < h; row++, y += bh) {
    const off = (row % 2) ? bw / 2 : 0;
    for (let bx = -bw; bx < w + bw; bx += bw) {
      x.fillStyle = renkler[Math.floor(Math.random() * renkler.length)];
      x.fillRect(bx + off + gap / 2, y + gap / 2, bw - gap, bh - gap);
      x.fillStyle = `rgba(255,255,255,${rnd(0, 0.05)})`;
      x.fillRect(bx + off + gap / 2, y + gap / 2, bw - gap, (bh - gap) * 0.35);
    }
  }
  vignette(x, w, h, 0.5);
}

function ahsap(x, w, h) {
  const pw = w / 5;
  for (let px = 0; px < w; px += pw) {
    x.fillStyle = `hsl(${rnd(22, 34)}, 42%, ${rnd(18, 28)}%)`;
    x.fillRect(px, 0, pw, h);
    for (let i = 0; i < 16; i++) {
      x.strokeStyle = `rgba(0,0,0,${rnd(0.04, 0.12)})`; x.lineWidth = rnd(0.5, 1.6);
      x.beginPath(); const gx = px + Math.random() * pw; x.moveTo(gx, 0);
      for (let yy = 0; yy <= h; yy += 22) x.lineTo(gx + Math.sin(yy * 0.05 + i) * 3, yy); x.stroke();
    }
    x.fillStyle = 'rgba(0,0,0,0.45)'; x.fillRect(px, 0, 2.5, h);
  }
  vignette(x, w, h, 0.42);
}

function beton(x, w, h, base) {
  x.fillStyle = base; x.fillRect(0, 0, w, h);
  for (let i = 0; i < 2600; i++) {
    x.fillStyle = `rgba(${Math.random() < 0.5 ? 255 : 0},${Math.random() < 0.5 ? 255 : 0},${Math.random() < 0.5 ? 255 : 0},${rnd(0.008, 0.03)})`;
    x.beginPath(); x.arc(Math.random() * w, Math.random() * h, rnd(1, 34), 0, 7); x.fill();
  }
  vignette(x, w, h, 0.5);
}

function dumanli(x, w, h, c1, c2) {
  const g = x.createLinearGradient(0, 0, w, h);
  g.addColorStop(0, c1); g.addColorStop(1, c2);
  x.fillStyle = g; x.fillRect(0, 0, w, h);
  for (let i = 0; i < 40; i++) {
    const rg = x.createRadialGradient(rnd(0, w), rnd(0, h), 0, rnd(0, w), rnd(0, h), rnd(60, 220));
    rg.addColorStop(0, `rgba(255,255,255,${rnd(0.01, 0.05)})`); rg.addColorStop(1, 'rgba(255,255,255,0)');
    x.fillStyle = rg; x.fillRect(0, 0, w, h);
  }
  vignette(x, w, h, 0.55);
}

// ---- Oda sahneleri ----
function duvarDoku(x, w, hh) {
  for (let i = 0; i < 700; i++) { x.fillStyle = `rgba(255,255,255,${rnd(0, 0.018)})`; x.fillRect(rnd(0, w), rnd(0, hh), rnd(1, 3), rnd(1, 3)); }
}

function oturmaOdasi(x, w, h) {
  const fl = h * 0.66;
  const g = x.createLinearGradient(0, 0, 0, fl); g.addColorStop(0, '#3c382f'); g.addColorStop(1, '#2c2921');
  x.fillStyle = g; x.fillRect(0, 0, w, fl); duvarDoku(x, w, fl);
  const fg = x.createLinearGradient(0, fl, 0, h); fg.addColorStop(0, '#4a3a2a'); fg.addColorStop(1, '#2a2117');
  x.fillStyle = fg; x.fillRect(0, fl, w, h - fl);
  for (let px = 0; px < w; px += w / 9) { x.fillStyle = 'rgba(0,0,0,0.15)'; x.fillRect(px, fl, 2, h - fl); }
  // kanepe
  x.fillStyle = '#1e241d';
  const sw = w * 0.44, sx = w * 0.28, sy = fl - h * 0.02;
  rr(x, sx, sy, sw, h * 0.17, 14); x.fill();
  rr(x, sx - 8, sy - 26, sw * 0.14, h * 0.12, 8); x.fill();
  rr(x, sx + sw - sw * 0.14 + 8, sy - 26, sw * 0.14, h * 0.12, 8); x.fill();
  bitki(x, w * 0.87, fl - 4, 1.25);
  vignette(x, w, h, 0.46);
}

function bitkiDuvari(x, w, h) {
  x.fillStyle = '#0a140c'; x.fillRect(0, 0, w, h);
  for (let i = 0; i < 520; i++) {
    x.fillStyle = `hsl(${rnd(95, 140)}, ${rnd(28, 60)}%, ${rnd(9, 27)}%)`;
    x.save(); x.translate(rnd(0, w), rnd(0, h)); x.rotate(rnd(0, 6.28));
    x.beginPath(); x.ellipse(0, 0, rnd(9, 28), rnd(3, 10), 0, 0, 6.28); x.fill(); x.restore();
  }
  vignette(x, w, h, 0.5);
}

function panelDuvar(x, w, h) {
  const fl = h * 0.72;
  x.fillStyle = '#4b4e52'; x.fillRect(0, 0, w, fl);
  for (let px = 0; px < w; px += w / 26) {
    x.fillStyle = 'rgba(0,0,0,0.18)'; x.fillRect(px, 0, 2, fl);
    x.fillStyle = 'rgba(255,255,255,0.03)'; x.fillRect(px + 3, 0, 2, fl);
  }
  x.fillStyle = '#2b2a28'; x.fillRect(0, fl, w, h - fl);
  x.fillStyle = '#191816';
  x.fillRect(w * 0.4, fl - 8, w * 0.2, 8);
  x.fillRect(w * 0.42, fl, 6, h * 0.1); x.fillRect(w * 0.57, fl, 6, h * 0.1);
  vignette(x, w, h, 0.42);
}

function betonSahne(x, w, h) {
  beton(x, w, h, '#3b3e43');
  const fl = h * 0.74;
  x.fillStyle = 'rgba(0,0,0,0.28)'; x.fillRect(0, fl, w, h - fl);
  x.fillStyle = '#17181a';
  x.fillRect(w * 0.32, fl - 14, w * 0.36, 14);
  x.fillRect(w * 0.34, fl, 8, h * 0.12); x.fillRect(w * 0.63, fl, 8, h * 0.12);
  bitki(x, w * 0.14, fl - 2, 1);
}

function acikDuvar(x, w, h) {
  const g = x.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, '#e9e7e1'); g.addColorStop(0.7, '#dad7cf'); g.addColorStop(1, '#c6c2b8');
  x.fillStyle = g; x.fillRect(0, 0, w, h);
  duvarDoku(x, w, h);
  x.strokeStyle = 'rgba(0,0,0,0.06)'; x.lineWidth = 2;
  x.beginPath(); x.moveTo(0, h * 0.78); x.lineTo(w, h * 0.78); x.stroke();
  vignette(x, w, h, 0.22);
}

// Preset tanımları — oda sahneleri öne
export const PRESETLER = [
  { key: 'koyu', ad: 'Koyu', ciz: (x, w, h) => dumanli(x, w, h, '#1a2140', '#07080f') },
  { key: 'oturma', ad: 'Oturma Odası', ciz: oturmaOdasi },
  { key: 'tuglaKirmizi', ad: 'Kırmızı Tuğla', ciz: (x, w, h) => tugla(x, w, h, '#2a1a14', ['#7a3b2e', '#8a4433', '#6e3327', '#93493a', '#7f3e30']) },
  { key: 'bitki', ad: 'Bitki Duvarı', ciz: bitkiDuvari },
  { key: 'panel', ad: 'Panel Duvar', ciz: panelDuvar },
  { key: 'beton', ad: 'Beton', ciz: betonSahne },
  { key: 'acik', ad: 'Açık Duvar', ciz: acikDuvar },
  { key: 'ahsap', ad: 'Ahşap', ciz: ahsap },
  { key: 'tuglaBeyaz', ad: 'Beyaz Tuğla', ciz: (x, w, h) => tugla(x, w, h, '#8a8a86', ['#e8e6e0', '#dcd9d2', '#efece6', '#d4d0c8', '#e2ded6']) },
  { key: 'tuglaAntrasit', ad: 'Koyu Tuğla', ciz: (x, w, h) => tugla(x, w, h, '#0e0f14', ['#2b2f38', '#232730', '#33373f', '#1e2129']) },
  { key: 'antrasit', ad: 'Antrasit', ciz: (x, w, h) => beton(x, w, h, '#20242c') },
  { key: 'gece', ad: 'Gece Mavisi', ciz: (x, w, h) => dumanli(x, w, h, '#122a4a', '#03060f') },
];

export function presetUret(key, w = 1200, h = 600) {
  const p = PRESETLER.find((p) => p.key === key);
  if (!p) return '';
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  p.ciz(c.getContext('2d'), w, h);
  return c.toDataURL('image/jpeg', 0.85);
}
