import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Section, Num, Radio, Select, fmt } from '../components/Controls.jsx';
import { hesapla as tabelaHesapla } from '../engine/neonTabela.js';
import { tasarimGirdi } from '../engine/neonTasarim.js';
import { teklifPdf } from '../lib/pdf.js';
import UruneDonustur from '../components/UruneDonustur.jsx';

const FONTLAR = ['Neonderthaw', 'Pacifico', 'Dancing Script', 'Great Vibes', 'Sacramento', 'Satisfy', 'Kaushan Script', 'Monoton'];
const RENKLER = ['#ff4d88', '#22e3c3', '#4d7cff', '#ffcf5c', '#ff6b3d', '#c04dff', '#ffffff', '#39ff14'];
const ZEMINLER = [
  { value: 'seffaf38', label: 'Şeffaf Pleksi 3.8mm' },
  { value: 'siyah38', label: 'Siyah Pleksi 3.8mm' },
  { value: 'beyaz38', label: 'Beyaz Pleksi 3.8mm' },
  { value: 'seffaf58', label: 'Şeffaf Pleksi 5.8mm' },
];
const ZEMIN_AD = Object.fromEntries(ZEMINLER.map((z) => [z.value, z.label]));

// Neon parlaması ile metin çiz
function neonYaz(x, cx, cy, text, fontPx, font, renk) {
  x.font = `${fontPx}px "${font}", cursive`;
  x.textAlign = 'center'; x.textBaseline = 'middle';
  x.save();
  x.shadowColor = renk; x.fillStyle = renk;
  for (const b of [fontPx * 0.55, fontPx * 0.32, fontPx * 0.16]) { x.shadowBlur = b; x.fillText(text, cx, cy); }
  x.shadowBlur = fontPx * 0.06; x.fillStyle = '#ffffff'; x.fillText(text, cx, cy);
  x.restore();
}

export default function TasarlaPage({ prices, constants, rates, firma, urunEkle }) {
  const [design, setDesign] = useState({
    metin: 'Merhaba', font: 'Neonderthaw', ledTipi: 'tekRenk', neonRengi: '#ff4d88',
    harfYuksekligiCm: 20, pleksi: 'seffaf38', disMekan: false, arkaGorsel: '', ledCmManuel: '',
  });
  const [olcum, setOlcum] = useState({ satirGenislikleriCm: [0], harfYuksekligiCm: 20, harfSayisi: 0 });
  const [fontHazir, setFontHazir] = useState(false);
  const [modal, setModal] = useState(false);
  const canvasRef = useRef(null);
  const arkaImgRef = useRef(null);

  const set = (patch) => setDesign((d) => ({ ...d, ...patch }));

  // Fontları yükle
  useEffect(() => {
    let iptal = false;
    Promise.all(FONTLAR.map((f) => document.fonts.load(`48px "${f}"`).catch(() => {})))
      .then(() => document.fonts.ready)
      .then(() => { if (!iptal) setFontHazir(true); });
    return () => { iptal = true; };
  }, []);

  // Arka plan görselini yükle
  useEffect(() => {
    if (!design.arkaGorsel) { arkaImgRef.current = null; ciz(); return; }
    const img = new Image();
    img.onload = () => { arkaImgRef.current = img; ciz(); };
    img.src = design.arkaGorsel;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [design.arkaGorsel]);

  // Ölçüm (metin/font/yükseklik değişince)
  useEffect(() => {
    const c = canvasRef.current; if (!c) return;
    const x = c.getContext('2d');
    const REF = 200;
    x.font = `${REF}px "${design.font}", cursive`;
    const lines = design.metin.split('\n').filter((l) => l.trim().length);
    const gen = (lines.length ? lines : ['']).map((l) => (l ? x.measureText(l).width * design.harfYuksekligiCm / REF : 0));
    setOlcum({
      satirGenislikleriCm: gen.length ? gen : [0],
      harfYuksekligiCm: design.harfYuksekligiCm,
      harfSayisi: design.metin.replace(/\s/g, '').length,
    });
    ciz();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [design.metin, design.font, design.harfYuksekligiCm, design.neonRengi, fontHazir]);

  function ciz() {
    const c = canvasRef.current; if (!c) return;
    const dpr = 2;
    const cssW = c.clientWidth || 640;
    const lines = design.metin.split('\n').filter((l) => l.trim().length);
    const n = lines.length || 1;
    const W = Math.round(cssW * dpr);
    const H = Math.round(W * 0.5); // 2:1 sahne
    c.width = W; c.height = H;
    const x = c.getContext('2d');

    if (arkaImgRef.current) {
      const img = arkaImgRef.current;
      const ir = img.width / img.height, cr = W / H;
      let dw, dh; if (ir > cr) { dh = H; dw = H * ir; } else { dw = W; dh = W / ir; }
      x.drawImage(img, (W - dw) / 2, (H - dh) / 2, dw, dh);
      x.fillStyle = 'rgba(4,6,12,0.35)'; x.fillRect(0, 0, W, H);
    } else {
      const g = x.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, Math.max(W, H) / 1.1);
      g.addColorStop(0, '#1a2140'); g.addColorStop(1, '#07080f');
      x.fillStyle = g; x.fillRect(0, 0, W, H);
    }

    const padY = H * 0.16;
    const lineH = (H - padY * 2) / n;
    let fontPx = lineH / 1.35;
    // Genişliğe sığdır (taşmayı önle)
    x.font = `${fontPx}px "${design.font}", cursive`;
    let maxW = 0;
    (lines.length ? lines : ['']).forEach((l) => { maxW = Math.max(maxW, x.measureText(l).width); });
    const izin = W * 0.88;
    if (maxW > izin) fontPx *= izin / maxW;
    (lines.length ? lines : ['']).forEach((line, i) => {
      neonYaz(x, W / 2, padY + lineH * (i + 0.5), line, fontPx, design.font, design.neonRengi);
    });
  }

  // Görsel yükle → küçültmeden dataURL (arka plan foto)
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

  // Maliyet
  const gir = useMemo(() => tasarimGirdi(design, olcum, constants), [design, olcum, constants]);
  const sonuc = useMemo(() => tabelaHesapla(gir.inputs, prices, constants, rates), [gir, prices, constants, rates]);

  const pdfYap = () => teklifPdf({
    firma, design, previewCanvas: canvasRef.current,
    ozet: {
      enCm: Math.round(gir.enM * 100), boyCm: Math.round(gir.boyM * 100), ledCm: gir.ledCm,
      zeminAd: ZEMIN_AD[design.pleksi], satis: sonuc.satis,
    },
    tarihStr: new Date().toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' }),
  });

  return (
    <div className="tasarla">
      <div className="tasarla-sol">
        <div className="onizleme">
          <canvas ref={canvasRef} className="neon-canvas" />
          {!fontHazir && <span className="onizleme-not">Fontlar yükleniyor…</span>}
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
            <p className="hint">Ölçülen genişlik: <b>{Math.round(Math.max(0, ...olcum.satirGenislikleriCm))} cm</b> · Tahmini LED: <b>{gir.ledCmAuto} cm</b></p>
            <Num label="LED Uzunluğu (elle, opsiyonel)" value={design.ledCmManuel} onChange={(v) => set({ ledCmManuel: v })} suffix="cm" />
          </Section>
          <Section title="Zemin & Mekan">
            <Select label="Pleksi Zemin" value={design.pleksi} onChange={(v) => set({ pleksi: v })} options={ZEMINLER} />
            <Radio label="Mekan" value={design.disMekan ? 1 : 0} onChange={(v) => set({ disMekan: !!v })}
              options={[{ value: 0, label: 'İç Mekan' }, { value: 1, label: 'Dış Mekan' }]} />
          </Section>
          <Section title="Arka Plan Görseli (opsiyonel)">
            <label className="dosya-btn">
              {design.arkaGorsel ? 'Görseli Değiştir' : '🖼️ Duvar/Ortam Fotoğrafı Yükle'}
              <input type="file" accept="image/*" hidden onChange={gorselSec} />
            </label>
            {design.arkaGorsel && <button className="btn-reset" onClick={() => set({ arkaGorsel: '' })}>Kaldır</button>}
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
          sonuc={sonuc} rates={rates}
          onKaydet={(p) => urunEkle({ ...p, gorsel: p.gorsel })} onKapat={() => setModal(false)} />
      )}
    </div>
  );
}
