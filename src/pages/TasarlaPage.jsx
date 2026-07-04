import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Section, Num, Radio, Select, fmt } from '../components/Controls.jsx';
import { hesapla as tabelaHesapla } from '../engine/neonTabela.js';
import { tasarimGirdi, PLEKSI_SECENEK } from '../engine/neonTasarim.js';
import { birlestir } from '../engine/ekKalem.js';
import { teklifPdf } from '../lib/pdf.js';
import { PRESETLER, presetUrl } from '../lib/arkaplanlar.js';
import UruneDonustur from '../components/UruneDonustur.jsx';

const FONTLAR = [
  // El yazısı / script
  'Great Vibes', 'Alex Brush', 'Allura', 'Tangerine', 'Sacramento', 'Satisfy',
  'Dancing Script', 'Pacifico', 'Cookie', 'Parisienne', 'Yellowtail', 'Kaushan Script', 'Marck Script',
  'Norican', 'Clicker Script', 'Pinyon Script', 'Rouge Script', 'Sofia', 'Niconne', 'Monsieur La Doulaise', 'Mr Dafoe',
  // Görsel / teknik
  'Monoton', 'Gruppo', 'Kodchasan', 'Meow Script', 'Megrim', 'Sue Ellen Francisco', 'Bungee Hairline',
  'Bungee', 'Wire One', 'Poiret One', 'Syncopate', 'Orbitron', 'Gugi', 'Tulpen One', 'Julius Sans One',
];
const RENKLER = ['#ff4d88', '#22e3c3', '#4d7cff', '#ffcf5c', '#ff6b3d', '#c04dff', '#ffffff', '#39ff14'];
const PLEKSI_AD = Object.fromEntries(PLEKSI_SECENEK.map((p) => [p.key, p.ad]));
const PLEKSI_RENK = Object.fromEntries(PLEKSI_SECENEK.map((p) => [p.key, p.renk]));
const KESIMLER = [
  { value: 'sekilli', label: 'Şekilli Kesim' },
  { value: 'koseli', label: 'Köşeli Kesim' },
  { value: 'kutu', label: 'Kutu (Su Geçirmez)' },
  { value: 'masaustu', label: 'Masa Üstü Stand' },
];
const ASKILAR = [
  { value: 'vida', label: 'Duvar Vidası' },
  { value: 'tavan', label: 'Tavan Askı Kiti' },
  { value: 'bant', label: 'Bant' },
  { value: 'yukseltme', label: 'Yükseltme Vidası' },
];
const KESIM_AD = Object.fromEntries(KESIMLER.map((k) => [k.value, k.label]));
const ASKI_AD = Object.fromEntries(ASKILAR.map((a) => [a.value, a.label]));
const REF = 200;

// Fiyatı etkileyen tasarım alanları — bunlar değişince ince ayar (override) sıfırlanır
const MALIYET_ALANLARI = ['metin', 'harfYuksekligiCm', 'ledTipi', 'pleksi', 'disMekan', 'ledCmManuel', 'kesim', 'aski', 'kumandaVar'];

export const VARSAYILAN_TASARIM = {
  metin: 'Merhaba', font: 'Great Vibes', ledTipi: 'tekRenk', neonRengi: '#ff4d88',
  harfYuksekligiCm: 20, pleksi: 'seffaf', disMekan: false, arkaGorsel: '', ledCmManuel: '',
  pozX: 0, pozY: 0, kesim: 'sekilli', aski: 'vida', kumandaVar: true, neonAcik: true,
};

function neonYaz(x, cx, cy, text, fontPx, font, renk) {
  x.font = `${fontPx}px "${font}", cursive`;
  x.textAlign = 'center'; x.textBaseline = 'middle';
  x.save();
  x.shadowColor = renk; x.fillStyle = renk;
  for (const b of [fontPx * 0.55, fontPx * 0.32, fontPx * 0.16]) { x.shadowBlur = b; x.fillText(text, cx, cy); }
  x.shadowBlur = fontPx * 0.06; x.fillStyle = '#ffffff'; x.fillText(text, cx, cy);
  x.restore();
}

// Sönük (ışığı kapalı) neon tüp görünümü — parlama yok, buzlu tüp
function sonukYaz(x, cx, cy, text, fontPx, font) {
  x.font = `${fontPx}px "${font}", cursive`;
  x.textAlign = 'center'; x.textBaseline = 'middle';
  x.save(); x.shadowBlur = 0;
  x.fillStyle = 'rgba(228,229,234,0.80)'; x.fillText(text, cx, cy);
  x.lineWidth = Math.max(1, fontPx * 0.03); x.strokeStyle = 'rgba(90,92,105,0.55)'; x.strokeText(text, cx, cy);
  x.restore();
}

function roundRectPath(x, rx, ry, w, h, r) {
  x.beginPath();
  x.moveTo(rx + r, ry); x.arcTo(rx + w, ry, rx + w, ry + h, r);
  x.arcTo(rx + w, ry + h, rx, ry + h, r); x.arcTo(rx, ry + h, rx, ry, r); x.arcTo(rx, ry, rx + w, ry, r);
  x.closePath();
}

// Yazının arkasına pleksi zemin (şekilli = yazı şeklinde, köşeli/kutu = plaka)
function cizPleksi(x, cx, topY, lineH, n, fontPx, boxW, dizi, plexiRenk, kesim, font) {
  const seffaf = plexiRenk === 'transparent';
  x.save();
  x.font = `${fontPx}px "${font}", cursive`;
  x.textAlign = 'center'; x.textBaseline = 'middle'; x.lineJoin = 'round'; x.lineCap = 'round';
  if (kesim === 'sekilli' || kesim === 'masaustu') {
    // Pleksi yazının şeklini takip eder
    x.fillStyle = seffaf ? 'rgba(255,255,255,0.10)' : plexiRenk;
    x.strokeStyle = seffaf ? 'rgba(255,255,255,0.10)' : plexiRenk;
    x.lineWidth = fontPx * 0.3;
    dizi.forEach((line, i) => { const yy = topY + lineH * (i + 0.5); x.strokeText(line, cx, yy); x.fillText(line, cx, yy); });
    if (!seffaf) { x.strokeStyle = 'rgba(255,255,255,0.10)'; x.lineWidth = fontPx * 0.3; dizi.forEach((line, i) => x.strokeText(line, cx, topY + lineH * (i + 0.5))); }
  } else {
    // Köşeli / Kutu → dikdörtgen plaka
    const pad = fontPx * 0.42;
    const rx = cx - boxW / 2 - pad, ry = topY + lineH * 0.5 - fontPx * 0.62 - pad;
    const rw = boxW + pad * 2, rh = lineH * (n - 1) + fontPx * 1.2 + pad * 2;
    if (seffaf) { x.fillStyle = 'rgba(255,255,255,0.07)'; x.strokeStyle = 'rgba(255,255,255,0.22)'; }
    else { x.fillStyle = plexiRenk; x.strokeStyle = 'rgba(255,255,255,0.16)'; }
    x.lineWidth = 2;
    roundRectPath(x, rx, ry, rw, rh, kesim === 'kutu' ? fontPx * 0.08 : fontPx * 0.18);
    x.fill(); x.stroke();
  }
  x.restore();
}

// Ölçü çizgisi (SignCustomiser tarzı: mor çizgi + uç çentikleri + etiket)
function olcuCiz(x, x1, y1, x2, y2, label, dikey) {
  x.strokeStyle = '#ff5cf0'; x.fillStyle = '#ff5cf0'; x.lineWidth = 2.5;
  const t = 9;
  x.beginPath(); x.moveTo(x1, y1); x.lineTo(x2, y2); x.stroke();
  x.beginPath();
  if (dikey) { x.moveTo(x1 - t, y1); x.lineTo(x1 + t, y1); x.moveTo(x2 - t, y2); x.lineTo(x2 + t, y2); }
  else { x.moveTo(x1, y1 - t); x.lineTo(x1, y1 + t); x.moveTo(x2, y2 - t); x.lineTo(x2, y2 + t); }
  x.stroke();
  x.font = 'bold 26px Arial';
  if (dikey) {
    x.save(); x.translate(x1 - 12, (y1 + y2) / 2); x.rotate(-Math.PI / 2);
    x.textAlign = 'center'; x.textBaseline = 'bottom'; x.fillText(label, 0, 0); x.restore();
  } else {
    x.textAlign = 'center'; x.textBaseline = 'top'; x.fillText(label, (x1 + x2) / 2, y2 + 10);
  }
}

export default function TasarlaPage({ prices, constants, rates, firma, urunEkle, onInceAyar, design, setDesign, override, overrideTemizle }) {
  const [olcum, setOlcum] = useState({ satirGenislikleriCm: [0], harfYuksekligiCm: 20, yukseklikCm: 20, harfSayisi: 0 });
  const [fontHazir, setFontHazir] = useState(false);
  const [arkaTik, setArkaTik] = useState(0);
  const [modal, setModal] = useState(false);
  const canvasRef = useRef(null);
  const arkaImgRef = useRef(null);
  const dragRef = useRef(null);

  const arkaplanlar = useMemo(() => PRESETLER.map((p) => ({ ...p, url: presetUrl(p) })), []);
  // Fiyatı etkileyen bir alan değişince ince ayarı sıfırla
  const set = (patch) => {
    if (override && Object.keys(patch).some((k) => MALIYET_ALANLARI.includes(k))) overrideTemizle?.();
    setDesign((d) => ({ ...d, ...patch }));
  };

  useEffect(() => {
    let iptal = false;
    Promise.all(FONTLAR.map((f) => document.fonts.load(`48px "${f}"`).catch(() => {})))
      .then(() => document.fonts.ready).then(() => { if (!iptal) setFontHazir(true); });
    return () => { iptal = true; };
  }, []);

  // Arka plan görseli yükle
  useEffect(() => {
    if (!design.arkaGorsel) { arkaImgRef.current = null; setArkaTik((t) => t + 1); return; }
    const img = new Image();
    img.onload = () => { arkaImgRef.current = img; setArkaTik((t) => t + 1); };
    img.src = design.arkaGorsel;
  }, [design.arkaGorsel]);

  // Ölçüm — metin/font/yükseklik değişince (harf yüksekliği = gerçek harf boyu)
  useEffect(() => {
    const c = canvasRef.current; if (!c) return;
    const x = c.getContext('2d');
    x.font = `${REF}px "${design.font}", cursive`;
    const lines = design.metin.split('\n').filter((l) => l.trim().length);
    const dizi = lines.length ? lines : [''];
    let maxGlyph = 1;
    dizi.forEach((l) => {
      const m = x.measureText(l || 'X');
      const gh = (m.actualBoundingBoxAscent || REF * 0.72) + (m.actualBoundingBoxDescent || REF * 0.2);
      if (gh > maxGlyph) maxGlyph = gh;
    });
    const scale = design.harfYuksekligiCm / maxGlyph; // cm/px → harf = harfYuksekligiCm
    const gen = dizi.map((l) => (l ? x.measureText(l).width * scale : 0));
    const n = dizi.length;
    const yukPx = maxGlyph + (n - 1) * maxGlyph * constants.tasarimSatirAralik;
    setOlcum({
      satirGenislikleriCm: gen,
      harfYuksekligiCm: design.harfYuksekligiCm,
      yukseklikCm: yukPx * scale,
      harfSayisi: design.metin.replace(/\s/g, '').length,
    });
  }, [design.metin, design.font, design.harfYuksekligiCm, fontHazir, constants.tasarimSatirAralik]);

  // Önizleme/PDF çizimi — neonAcik: yanan/sönük; sabitW: PDF için sabit genişlik
  const cizCanvas = (c, neonAcik, sabitW, olcuGoster = true) => {
    if (!c) return;
    const dpr = 2;
    const W = sabitW || Math.round((c.clientWidth || 640) * dpr);
    const H = Math.round(W * 0.5);
    c.width = W; c.height = H;
    const x = c.getContext('2d');

    if (arkaImgRef.current) {
      const img = arkaImgRef.current, ir = img.width / img.height, cr = W / H;
      let dw, dh; if (ir > cr) { dh = H; dw = H * ir; } else { dw = W; dh = W / ir; }
      x.drawImage(img, (W - dw) / 2, (H - dh) / 2, dw, dh);
      x.fillStyle = neonAcik ? 'rgba(4,6,12,0.30)' : 'rgba(4,6,12,0.10)';
      x.fillRect(0, 0, W, H);
    } else {
      const g = x.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, Math.max(W, H) / 1.1);
      g.addColorStop(0, neonAcik ? '#1a2140' : '#23262f'); g.addColorStop(1, '#07080f'); x.fillStyle = g; x.fillRect(0, 0, W, H);
    }

    const lines = design.metin.split('\n').filter((l) => l.trim().length);
    const dizi = lines.length ? lines : [''];
    const n = dizi.length;
    const padY = H * 0.18;
    const lineH = (H - padY * 2) / Math.max(n, 1);
    let fontPx = lineH / 1.35;
    x.font = `${fontPx}px "${design.font}", cursive`;
    let boxW = 0; dizi.forEach((l) => { boxW = Math.max(boxW, x.measureText(l || 'X').width); });
    const izin = W * 0.82;
    if (boxW > izin) { fontPx *= izin / boxW; boxW = izin; }

    const cx = W / 2 + design.pozX * W;
    const topY = padY + design.pozY * H;

    // Yazının arkasına pleksi zemin
    cizPleksi(x, cx, topY, lineH, n, fontPx, boxW, dizi, PLEKSI_RENK[design.pleksi] || 'transparent', design.kesim, design.font);

    // Neon (yanan/sönük)
    dizi.forEach((line, i) => {
      const yy = topY + lineH * (i + 0.5);
      if (neonAcik) neonYaz(x, cx, yy, line, fontPx, design.font, design.neonRengi);
      else sonukYaz(x, cx, yy, line, fontPx, design.font);
    });

    // Ölçü çizgileri
    if (olcuGoster) {
      const boxLeft = cx - boxW / 2, boxRight = cx + boxW / 2;
      const gTop = topY + lineH * 0.5 - fontPx * 0.6;
      const gBot = topY + lineH * (n - 0.5) + fontPx * 0.35;
      const enCm = Math.round(Math.max(0, ...olcum.satirGenislikleriCm));
      const boyCm = Math.round(olcum.yukseklikCm || 0);
      if (enCm > 0) {
        olcuCiz(x, boxLeft - 26, gTop, boxLeft - 26, gBot, `${boyCm}cm`, true);
        olcuCiz(x, boxLeft, gBot + 30, boxRight, gBot + 30, `${enCm}cm`, false);
      }
    }
  };

  useEffect(() => {
    cizCanvas(canvasRef.current, design.neonAcik);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [olcum, design.metin, design.font, design.neonRengi, design.pozX, design.pozY, design.pleksi, design.kesim, design.neonAcik, arkaTik, fontHazir]);

  // Sürükleme (yazıyı taşı)
  const onDown = (e) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    const r = e.currentTarget.getBoundingClientRect();
    dragRef.current = { sx: e.clientX, sy: e.clientY, px: design.pozX, py: design.pozY, rw: r.width, rh: r.height };
  };
  const onMove = (e) => {
    const d = dragRef.current; if (!d) return;
    const nx = Math.max(-0.45, Math.min(0.45, d.px + (e.clientX - d.sx) / d.rw));
    const ny = Math.max(-0.4, Math.min(0.4, d.py + (e.clientY - d.sy) / d.rh));
    set({ pozX: nx, pozY: ny });
  };
  const onUp = () => { dragRef.current = null; };

  const gorselSec = (e) => {
    const f = e.target.files?.[0]; if (!f) return;
    const rd = new FileReader();
    rd.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const maxD = 1000, s = Math.min(1, maxD / Math.max(img.width, img.height));
        const cv = document.createElement('canvas');
        cv.width = Math.round(img.width * s); cv.height = Math.round(img.height * s);
        cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height);
        set({ arkaGorsel: cv.toDataURL('image/jpeg', 0.85) });
      };
      img.src = ev.target.result;
    };
    rd.readAsDataURL(f);
  };

  const gir = useMemo(() => tasarimGirdi(design, olcum, constants), [design, olcum, constants]);
  // İnce ayar (override) aktifse onun girdilerini kullan; değilse sihirbazdan üretilen
  const etkinInputs = override ? override.inputs : gir.inputs;
  const etkinEkler = override ? override.ekler : gir.ekler;
  const sonuc = useMemo(
    () => birlestir(tabelaHesapla(etkinInputs, prices, constants, rates), etkinEkler, prices, rates.karOrani),
    [etkinInputs, etkinEkler, prices, constants, rates],
  );
  const enCm = Math.round((etkinInputs.en || 0) * 100);
  const boyCm = Math.round((etkinInputs.boy || 0) * 100);
  const ledCm = (etkinInputs.ledPvc || 0) + (etkinInputs.ledRgb || 0) + (etkinInputs.ledFuji || 0) + (etkinInputs.ledNorm || 0) + (etkinInputs.ledPixel || 0);

  const pdfYap = () => {
    const yanan = document.createElement('canvas'); cizCanvas(yanan, true, 1200, false);
    const sonuk = document.createElement('canvas'); cizCanvas(sonuk, false, 1200, false);
    teklifPdf({
      firma, design, yananCanvas: yanan, sonukCanvas: sonuk,
      ozet: {
        enCm, boyCm, ledCm,
        zeminAd: PLEKSI_AD[design.pleksi], kesimAd: KESIM_AD[design.kesim], askiAd: ASKI_AD[design.aski],
        kumanda: design.kumandaVar, satis: sonuc.satis,
      },
      tarihStr: new Date().toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' }),
    });
  };

  return (
    <div className="tasarla">
      <div className="tasarla-sol">
        <div className="onizleme">
          <canvas ref={canvasRef} className="neon-canvas" onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp} />
          {!fontHazir && <span className="onizleme-not">Fontlar yükleniyor…</span>}
          <span className="onizleme-ipucu">✋ Yazıyı sürükleyerek taşıyabilirsiniz</span>
          <button className={`isik-btn ${design.neonAcik ? 'acik' : ''}`} onClick={() => set({ neonAcik: !design.neonAcik })}>
            {design.neonAcik ? '💡 Işık Açık' : '🌙 Işık Kapalı'}
          </button>
        </div>

        <Section title="Yazı">
          <textarea className="metin-alan" rows={2} value={design.metin}
            onChange={(e) => set({ metin: e.target.value })} placeholder="Neon yazınız… (Enter ile alt satır)" />
        </Section>

        <div className="form">
          <Section title="Font">
            <div className="font-grid">
              {FONTLAR.map((f) => (
                <button key={f} className={`font-btn ${design.font === f ? 'active' : ''}`}
                  style={{ fontFamily: `"${f}", cursive` }} onClick={() => set({ font: f })}>Aa</button>
              ))}
            </div>
          </Section>
          <Section title="Renk & Tip">
            <div className="renk-grid">
              {RENKLER.map((r) => (
                <button key={r} className={`renk-btn ${design.neonRengi === r ? 'active' : ''}`}
                  style={{ background: r, boxShadow: `0 0 10px ${r}` }} onClick={() => set({ neonRengi: r })} />
              ))}
            </div>
            <Radio label="LED Tipi" value={design.ledTipi} onChange={(v) => set({ ledTipi: v })}
              options={[{ value: 'tekRenk', label: 'Tek Renk' }, { value: 'rgb', label: 'RGB (çok renkli)' }]} />
          </Section>
          <Section title="Boyut">
            <Num label="Harf Yüksekliği" value={design.harfYuksekligiCm} onChange={(v) => set({ harfYuksekligiCm: v })} suffix="cm" />
            <p className="hint">Ölçülen: <b>{Math.round(Math.max(0, ...olcum.satirGenislikleriCm))} × {Math.round(olcum.yukseklikCm || 0)} cm</b> · Tahmini LED: <b>{gir.ledCmAuto} cm</b></p>
            <Num label="LED Uzunluğu (elle, opsiyonel)" value={design.ledCmManuel} onChange={(v) => set({ ledCmManuel: v })} suffix="cm" />
          </Section>
          <Section title="Arka Plan Kesimi">
            <Radio value={design.kesim} onChange={(v) => set({ kesim: v })} options={KESIMLER} />
            {design.kesim === 'kutu' && <p className="hint">Su geçirmez kutu — dış mekan için uygun (silikon yalıtım + kutu maliyeti eklenir).</p>}
            {design.kesim === 'masaustu' && <p className="hint">Kendinden destekli stand maliyeti eklenir.</p>}
          </Section>
          <Section title="Pleksi (Zemin) Rengi & Kullanım Yeri">
            <span className="field-label">Pleksi Rengi</span>
            <div className="renk-grid">
              {PLEKSI_SECENEK.map((p) => (
                <button key={p.key} title={p.ad}
                  className={`renk-btn ${design.pleksi === p.key ? 'active' : ''} ${p.renk === 'transparent' ? 'seffaf' : ''}`}
                  style={p.renk !== 'transparent' ? { background: p.renk } : undefined}
                  onClick={() => set({ pleksi: p.key })} />
              ))}
            </div>
            <p className="hint">Seçilen renkteki pleksi, önizlemede yazının arkasına konur (şekilli kesimde yazı şeklinde kesilir).</p>
            <Radio label="Kullanım Yeri" value={design.disMekan ? 1 : 0} onChange={(v) => set({ disMekan: !!v })}
              options={[{ value: 0, label: 'İç Mekan' }, { value: 1, label: 'Dış Mekan (Su Geçirmez)' }]} />
          </Section>
          <Section title="Askı Seçeneği">
            <Radio value={design.aski} onChange={(v) => set({ aski: v })} options={ASKILAR} />
          </Section>
          <Section title="Uzaktan Kumanda (Dimmer)">
            <Radio value={design.kumandaVar ? 1 : 0} onChange={(v) => set({ kumandaVar: !!v })}
              options={[{ value: 1, label: 'Evet' }, { value: 0, label: 'Hayır' }]} />
          </Section>
          <Section title="Arka Plan">
            <div className="arka-grid">
              <button className={`arka-btn ${!design.arkaGorsel ? 'active' : ''}`} onClick={() => set({ arkaGorsel: '' })}>
                <span className="arka-yok">Koyu</span>
              </button>
              {arkaplanlar.map((a) => (
                <button key={a.key} title={a.ad} className={`arka-btn ${design.arkaGorsel === a.url ? 'active' : ''}`} onClick={() => set({ arkaGorsel: a.url })}>
                  <img src={a.url} alt={a.ad} /><em>{a.ad}</em>
                </button>
              ))}
            </div>
            <label className="dosya-btn">🖼️ Kendi Fotoğrafını Yükle
              <input type="file" accept="image/*" hidden onChange={gorselSec} />
            </label>
          </Section>
        </div>
      </div>

      <div className="tasarla-sag">
        {override && (
          <div className="duzenle-banner">
            <span>🔧 İnce ayarlı fiyat kullanılıyor</span>
            <button onClick={() => overrideTemizle?.()}>Sıfırla</button>
          </div>
        )}
        <div className="result">
          <div className="result-head"><h3>Anlık Fiyat</h3><span className="muted">LED Neon Tabela</span></div>
          <div className="tasarla-ozet">
            <div><span>Yazı</span><b>{design.metin.replace(/\n/g, ' / ') || '—'}</b></div>
            <div><span>Boyut</span><b>{enCm} × {boyCm} cm</b></div>
            <div><span>LED Uzunluğu</span><b>{ledCm} cm</b></div>
            <div><span>Kesim</span><b>{KESIM_AD[design.kesim]}</b></div>
            <div><span>Askı</span><b>{ASKI_AD[design.aski]}</b></div>
            <div><span>Kumanda</span><b>{design.kumandaVar ? 'Var' : 'Yok'}</b></div>
            <div><span>Mekan</span><b>{design.disMekan ? 'Dış Mekan' : 'İç Mekan'}</b></div>
            <div><span>Pleksi</span><b>{PLEKSI_AD[design.pleksi]}</b></div>
          </div>
          <div className="totals">
            <div className="total-row cost"><span>Maliyet</span><span>{fmt(sonuc.toplam)} ₺</span></div>
            <div className="total-row sale"><span>Satış Fiyatı <em>(× {rates.karOrani})</em></span><span>{fmt(sonuc.satis)} ₺</span></div>
          </div>
        </div>
        <button className="urune-btn" onClick={pdfYap}>📄 PDF Teklif Oluştur</button>
        <button className="urune-btn ikincil" onClick={() => setModal(true)}>★ Ürüne Dönüştür</button>
        <button className="urune-btn ikincil" onClick={() => onInceAyar({ inputs: etkinInputs, ekler: etkinEkler })}>🔧 Neon Tabela'da İnce Ayar</button>
        <p className="hint">İnce ayar: Neon Tabela hesaplayıcısında tüm detayları (işçilik, kablo, montaj, yüzey vb.) elle düzenleyip fiyatı hassaslaştırabilirsiniz.</p>
      </div>

      {modal && (
        <UruneDonustur urunTipi="tabela" urunAdiVarsayilan={design.metin} inputs={etkinInputs} ekler={etkinEkler}
          sonuc={sonuc} rates={rates} onKaydet={(p) => urunEkle(p)} onKapat={() => setModal(false)} />
      )}
    </div>
  );
}
