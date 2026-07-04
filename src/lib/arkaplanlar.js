// ============================================================================
//  Arka planlar: gerçek iç mekan fotoğrafları (Unsplash — ücretsiz ticari
//  kullanım) + birkaç canvas ile üretilmiş doku seçeneği.
// ============================================================================

const B = import.meta.env.BASE_URL;
const foto = (dosya) => `${B}backgrounds/${dosya}`;

const rnd = (a, b) => a + Math.random() * (b - a);

function vignette(x, w, h, s) {
  const g = x.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.15, w / 2, h / 2, Math.max(w, h) * 0.75);
  g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(0,0,0,${s})`);
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

function bitkiDuvari(x, w, h) {
  x.fillStyle = '#0a140c'; x.fillRect(0, 0, w, h);
  for (let i = 0; i < 520; i++) {
    x.fillStyle = `hsl(${rnd(95, 140)}, ${rnd(28, 60)}%, ${rnd(9, 27)}%)`;
    x.save(); x.translate(rnd(0, w), rnd(0, h)); x.rotate(rnd(0, 6.28));
    x.beginPath(); x.ellipse(0, 0, rnd(9, 28), rnd(3, 10), 0, 0, 6.28); x.fill(); x.restore();
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

// Preset listesi — gerçek fotoğraflar önce, sonra dokular
export const PRESETLER = [
  { key: 'koyu', ad: 'Koyu', ciz: (x, w, h) => dumanli(x, w, h, '#1a2140', '#07080f') },
  { key: 'oda1', ad: 'Salon · Modern', foto: foto('oda1.jpg') },
  { key: 'oda2', ad: 'Salon · Turuncu', foto: foto('oda2.jpg') },
  { key: 'oda3', ad: 'Ofis · Sarı Koltuk', foto: foto('oda3.jpg') },
  { key: 'oda4', ad: 'Salon · Ferah', foto: foto('oda4.jpg') },
  { key: 'oda5', ad: 'Salon · Yeşil Duvar', foto: foto('oda5.jpg') },
  { key: 'kafe1', ad: 'Kafe · Endüstriyel', foto: foto('kafe1.jpg') },
  { key: 'kafe2', ad: 'Kafe · Ahşap Bar', foto: foto('kafe2.jpg') },
  { key: 'kafe3', ad: 'Bar · Tuğla', foto: foto('kafe3.jpg') },
  { key: 'tuglaKirmizi', ad: 'Kırmızı Tuğla', ciz: (x, w, h) => tugla(x, w, h, '#2a1a14', ['#7a3b2e', '#8a4433', '#6e3327', '#93493a', '#7f3e30']) },
  { key: 'bitki', ad: 'Bitki Duvarı', ciz: bitkiDuvari },
  { key: 'ahsap', ad: 'Ahşap', ciz: ahsap },
];

// Bir preset'in görsel URL'i (foto ise yol, değilse canvas ile üretilmiş dataURL)
export function presetUrl(p, w = 1200, h = 600) {
  if (p.foto) return p.foto;
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  p.ciz(c.getContext('2d'), w, h);
  return c.toDataURL('image/jpeg', 0.85);
}
