import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Section, Num, Radio, Select, fmt } from '../components/Controls.jsx';
import { hesapla as tabelaHesapla } from '../engine/neonTabela.js';
import { tasarimGirdi } from '../engine/neonTasarim.js';
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
const ZEMINLER = [
  { value: 'seffaf38', label: 'Şeffaf Pleksi 3.8mm' },
  { value: 'siyah38', label: 'Siyah Pleksi 3.8mm' },
  { value: 'beyaz38', label: 'Beyaz Pleksi 3.8mm' },
  { value: 'seffaf58', label: 'Şeffaf Pleksi 5.8mm' },
];
const ZEMIN_AD = Object.fromEntries(ZEMINLER.map((z) => [z.value, z.label]));
const REF = 200;

function neonYaz(x, cx, cy, text, fontPx, font, renk) {
  x.font = `${fontPx}px "${font}", cursive`;
  x.textAlign = 'center'; x.textBaseline = 'middle';
  x.save();
  x.shadowColor = renk; x.fillStyle = renk;
  for (const b of [fontPx * 0.55, fontPx * 0.32, fontPx * 0.16]) { x.shadowBlur = b; x.fillText(text, cx, cy); }
  x.shadowBlur = fontPx * 0.06; x.fillStyle = '#ffffff'; x.fillText(text, cx, cy);
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

export default function TasarlaPage({ prices, constants, rates, firma, urunEkle }) {
  const [design, setDesign] = useState({
    metin: 'Merhaba', font: 'Great Vibes', ledTipi: 'tekRenk', neonRengi: '#ff4d88',
    harfYuksekligiCm: 20, pleksi: 'seffaf38', disMekan: false, arkaGorsel: '', ledCmManuel: '',
    pozX: 0, pozY: 0,
  });
  const [olcum, setOlcum] = useState({ satirGenislikleriCm: [0], harfYuksekligiCm: 20, yukseklikCm: 20, harfSayisi: 0 });
  const [fontHazir, setFontHazir] = useState(false);
  const [arkaTik, setArkaTik] = useState(0);
  const [modal, setModal] = useState(false);
  const canvasRef = useRef(null);
  const arkaImgRef = useRef(null);
  const dragRef = useRef(null);

  const arkaplanlar = useMemo(() => PRESETLER.map((p) => ({ ...p, url: presetUrl(p) })), []);
  const set = (patch) => setDesign((d) => ({ ...d, ...patch }));

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

  // Çizim — ölçüm/renk/konum/arka plan değişince
  useEffect(() => {
    const c = canvasRef.current; if (!c) return;
    const dpr = 2;
    const cssW = c.clientWidth || 640;
    const W = Math.round(cssW * dpr), H = Math.round(W * 0.5);
    c.width = W; c.height = H;
    const x = c.getContext('2d');

    if (arkaImgRef.current) {
      const img = arkaImgRef.current, ir = img.width / img.height, cr = W / H;
      let dw, dh; if (ir > cr) { dh = H; dw = H * ir; } else { dw = W; dh = W / ir; }
      x.drawImage(img, (W - dw) / 2, (H - dh) / 2, dw, dh);
      x.fillStyle = 'rgba(4,6,12,0.28)'; x.fillRect(0, 0, W, H);
    } else {
      const g = x.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, Math.max(W, H) / 1.1);
      g.addColorStop(0, '#1a2140'); g.addColorStop(1, '#07080f'); x.fillStyle = g; x.fillRect(0, 0, W, H);
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
    dizi.forEach((line, i) => neonYaz(x, cx, topY + lineH * (i + 0.5), line, fontPx, design.font, design.neonRengi));

    // Ölçü çizgileri
    const boxLeft = cx - boxW / 2, boxRight = cx + boxW / 2;
    const gTop = topY + lineH * 0.5 - fontPx * 0.6;
    const gBot = topY + lineH * (n - 0.5) + fontPx * 0.35;
    const enCm = Math.round(Math.max(0, ...olcum.satirGenislikleriCm));
    const boyCm = Math.round(olcum.yukseklikCm || 0);
    if (enCm > 0) {
      olcuCiz(x, boxLeft - 26, gTop, boxLeft - 26, gBot, `${boyCm}cm`, true);
      olcuCiz(x, boxLeft, gBot + 30, boxRight, gBot + 30, `${enCm}cm`, false);
    }
  }, [olcum, design.metin, design.font, design.neonRengi, design.pozX, design.pozY, arkaTik, fontHazir]);

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
  const sonuc = useMemo(() => tabelaHesapla(gir.inputs, prices, constants, rates), [gir, prices, constants, rates]);

  const pdfYap = () => teklifPdf({
    firma, design, previewCanvas: canvasRef.current,
    ozet: { enCm: Math.round(gir.enM * 100), boyCm: Math.round(gir.boyM * 100), ledCm: gir.ledCm, zeminAd: ZEMIN_AD[design.pleksi], satis: sonuc.satis },
    tarihStr: new Date().toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' }),
  });

  return (
    <div className="tasarla">
      <div className="tasarla-sol">
        <div className="onizleme">
          <canvas ref={canvasRef} className="neon-canvas" onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp} />
          {!fontHazir && <span className="onizleme-not">Fontlar yükleniyor…</span>}
          <span className="onizleme-ipucu">✋ Yazıyı sürükleyerek taşıyabilirsiniz</span>
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
          <Section title="Zemin & Mekan">
            <Select label="Pleksi Zemin" value={design.pleksi} onChange={(v) => set({ pleksi: v })} options={ZEMINLER} />
            <Radio label="Mekan" value={design.disMekan ? 1 : 0} onChange={(v) => set({ disMekan: !!v })}
              options={[{ value: 0, label: 'İç Mekan' }, { value: 1, label: 'Dış Mekan' }]} />
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
        <div className="result">
          <div className="result-head"><h3>Anlık Fiyat</h3><span className="muted">LED Neon Tabela</span></div>
          <div className="tasarla-ozet">
            <div><span>Yazı</span><b>{design.metin.replace(/\n/g, ' / ') || '—'}</b></div>
            <div><span>Boyut</span><b>{Math.round(gir.enM * 100)} × {Math.round(gir.boyM * 100)} cm</b></div>
            <div><span>LED Uzunluğu</span><b>{gir.ledCm} cm</b></div>
            <div><span>Harf Sayısı</span><b>{olcum.harfSayisi}</b></div>
            <div><span>Zemin</span><b>{ZEMIN_AD[design.pleksi]}</b></div>
          </div>
          <div className="totals">
            <div className="total-row cost"><span>Maliyet</span><span>{fmt(sonuc.toplam)} ₺</span></div>
            <div className="total-row sale"><span>Satış Fiyatı <em>(× {rates.karOrani})</em></span><span>{fmt(sonuc.satis)} ₺</span></div>
          </div>
        </div>
        <button className="urune-btn" onClick={pdfYap}>📄 PDF Teklif Oluştur</button>
        <button className="urune-btn ikincil" onClick={() => setModal(true)}>★ Ürüne Dönüştür</button>
      </div>

      {modal && (
        <UruneDonustur urunTipi="tabela" urunAdiVarsayilan={design.metin} inputs={gir.inputs} ekler={[]}
          sonuc={sonuc} rates={rates} onKaydet={(p) => urunEkle(p)} onKapat={() => setModal(false)} />
      )}
    </div>
  );
}
