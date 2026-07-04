// ============================================================================
//  Hazır duvar/ortam arka planları — canvas ile üretilir (telifsiz, çevrimdışı)
//  Her preset bir dataURL üretir; hem önizlemede hem PDF'te kullanılır.
// ============================================================================

const rnd = (a, b) => a + Math.random() * (b - a);

function vignette(x, w, h, s) {
  const g = x.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.15, w / 2, h / 2, Math.max(w, h) * 0.75);
  g.addColorStop(0, 'rgba(0,0,0,0)');
  g.addColorStop(1, `rgba(0,0,0,${s})`);
  x.fillStyle = g; x.fillRect(0, 0, w, h);
}

function tugla(x, w, h, harc, renkler) {
  x.fillStyle = harc; x.fillRect(0, 0, w, h);
  const bh = h / 9, bw = w / 6, gap = Math.max(3, bh * 0.09);
  for (let row = 0, y = 0; y < h; row++, y += bh) {
    const off = (row % 2) ? bw / 2 : 0;
    for (let bx = -bw; bx < w + bw; bx += bw) {
      x.fillStyle = renkler[Math.floor(Math.random() * renkler.length)];
      x.fillRect(bx + off + gap / 2, y + gap / 2, bw - gap, bh - gap);
      // hafif gölge/ışık
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
      x.strokeStyle = `rgba(0,0,0,${rnd(0.04, 0.12)})`;
      x.lineWidth = rnd(0.5, 1.6);
      x.beginPath();
      const gx = px + Math.random() * pw;
      x.moveTo(gx, 0);
      for (let yy = 0; yy <= h; yy += 22) x.lineTo(gx + Math.sin(yy * 0.05 + i) * 3, yy);
      x.stroke();
    }
    x.fillStyle = 'rgba(0,0,0,0.45)'; x.fillRect(px, 0, 2.5, h);
  }
  vignette(x, w, h, 0.42);
}

function beton(x, w, h, base) {
  x.fillStyle = base; x.fillRect(0, 0, w, h);
  for (let i = 0; i < 2600; i++) {
    const r = rnd(1, 34);
    x.fillStyle = `rgba(${Math.random() < 0.5 ? 255 : 0},${Math.random() < 0.5 ? 255 : 0},${Math.random() < 0.5 ? 255 : 0},${rnd(0.008, 0.03)})`;
    x.beginPath(); x.arc(Math.random() * w, Math.random() * h, r, 0, 7); x.fill();
  }
  vignette(x, w, h, 0.5);
}

function dumanli(x, w, h, c1, c2) {
  const g = x.createLinearGradient(0, 0, w, h);
  g.addColorStop(0, c1); g.addColorStop(1, c2);
  x.fillStyle = g; x.fillRect(0, 0, w, h);
  for (let i = 0; i < 40; i++) {
    const rg = x.createRadialGradient(rnd(0, w), rnd(0, h), 0, rnd(0, w), rnd(0, h), rnd(60, 220));
    rg.addColorStop(0, `rgba(255,255,255,${rnd(0.01, 0.05)})`);
    rg.addColorStop(1, 'rgba(255,255,255,0)');
    x.fillStyle = rg; x.fillRect(0, 0, w, h);
  }
  vignette(x, w, h, 0.55);
}

// Preset tanımları
export const PRESETLER = [
  { key: 'koyu', ad: 'Koyu Duvar', ciz: (x, w, h) => dumanli(x, w, h, '#1a2140', '#07080f') },
  { key: 'antrasit', ad: 'Antrasit', ciz: (x, w, h) => beton(x, w, h, '#20242c') },
  { key: 'beton', ad: 'Beton', ciz: (x, w, h) => beton(x, w, h, '#4a4e57') },
  { key: 'tuglaKirmizi', ad: 'Kırmızı Tuğla', ciz: (x, w, h) => tugla(x, w, h, '#2a1a14', ['#7a3b2e', '#8a4433', '#6e3327', '#93493a', '#7f3e30']) },
  { key: 'tuglaBeyaz', ad: 'Beyaz Tuğla', ciz: (x, w, h) => tugla(x, w, h, '#8a8a86', ['#e8e6e0', '#dcd9d2', '#efece6', '#d4d0c8', '#e2ded6']) },
  { key: 'tuglaAntrasit', ad: 'Koyu Tuğla', ciz: (x, w, h) => tugla(x, w, h, '#0e0f14', ['#2b2f38', '#232730', '#33373f', '#1e2129']) },
  { key: 'ahsap', ad: 'Ahşap', ciz: ahsap },
  { key: 'gece', ad: 'Gece Mavisi', ciz: (x, w, h) => dumanli(x, w, h, '#122a4a', '#03060f') },
];

// Bir preset'i dataURL olarak üretir
export function presetUret(key, w = 1200, h = 600) {
  const p = PRESETLER.find((p) => p.key === key);
  if (!p) return '';
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const x = c.getContext('2d');
  p.ciz(x, w, h);
  return c.toDataURL('image/jpeg', 0.85);
}
