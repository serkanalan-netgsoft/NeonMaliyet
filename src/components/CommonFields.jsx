// 4 ürün formunun paylaştığı ortak giriş blokları.
// Her blok: inp (girişler) + set(patch) — patch üst düzey alanları merge eder.
import React from 'react';
import { Section, Num, Toggle, Radio } from './Controls.jsx';

const YUZEYLER = [
  ['seffaf38', 'Şeffaf 3.8mm'], ['seffaf58', 'Şeffaf 5.8mm'], ['siyah38', 'Siyah 3.8mm'],
  ['siyah58', 'Siyah 5.8mm'], ['beyaz38', 'Beyaz 3.8mm'], ['beyaz58', 'Beyaz 5.8mm'],
  ['renkli38', 'Renkli 3.8mm'], ['renkli58', 'Renkli 5.8mm'], ['gumusAyna', 'Gümüş Aynalı 1.8mm'],
  ['dekota45', 'Dekota 4,5mm'], ['dekota10', 'Dekota 10mm'], ['dekota18', 'Dekota 18mm'],
  ['camAyna', 'Cam Ayna'], ['dalgaliAyna', 'Dalgalı Asimetrik Ayna'], ['canvas', 'Canvas'],
];

export function MekanBlock({ inp, set }) {
  return (
    <Section title="Mekan">
      <Radio value={inp.disMekan} onChange={(v) => set({ disMekan: v })}
        options={[{ value: 0, label: 'İç Mekan' }, { value: 1, label: 'Dış Mekan' }]} />
    </Section>
  );
}

export function IscilikBlock({ inp, set }) {
  return (
    <Section title="İşçilik">
      <Num label="Harf Adedi" value={inp.harfAdet} onChange={(v) => set({ harfAdet: v })} />
      <Num label="Çizgi (Tek Lehim) Adedi" value={inp.cizgiAdet} onChange={(v) => set({ cizgiAdet: v })} />
    </Section>
  );
}

export function LedBlock({ inp, set, title = 'LED (cm)' }) {
  return (
    <Section title={title}>
      <Num label="Turkuaz PVC" value={inp.ledPvc} onChange={(v) => set({ ledPvc: v })} suffix="cm" />
      <Num label="Turkuaz RGB" value={inp.ledRgb} onChange={(v) => set({ ledRgb: v })} suffix="cm" />
      <Num label="Fuji Dış Mekan" value={inp.ledFuji} onChange={(v) => set({ ledFuji: v })} suffix="cm" />
      <Num label="Norm" value={inp.ledNorm} onChange={(v) => set({ ledNorm: v })} suffix="cm" />
      <Num label="Pixel" value={inp.ledPixel} onChange={(v) => set({ ledPixel: v })} suffix="cm" />
    </Section>
  );
}

export function BoyutBlock({ inp, set, title = 'Kesim Yüzey Boyutu' }) {
  return (
    <Section title={title}>
      <Num label="En" value={inp.en} onChange={(v) => set({ en: v })} step={0.01} suffix="m" />
      <Num label="Boy" value={inp.boy} onChange={(v) => set({ boy: v })} step={0.01} suffix="m" />
    </Section>
  );
}

export function YuzeyBlock({ inp, set }) {
  const y = inp.yuzey;
  return (
    <Section title="Yüzey Seçimi (0/1)">
      <div className="toggle-grid">
        {YUZEYLER.map(([key, ad]) => (
          <Toggle key={key} label={ad} value={y[key]}
            onChange={(v) => set({ yuzey: { ...y, [key]: v } })} />
        ))}
      </div>
    </Section>
  );
}

export function BaskiBlock({ inp, set }) {
  return (
    <Section title="Baskı">
      <div className="toggle-grid two">
        <Toggle label="UV Baskı" value={inp.baskiUv} onChange={(v) => set({ baskiUv: v })} />
        <Toggle label="Folyo Baskı" value={inp.baskiFolyo} onChange={(v) => set({ baskiFolyo: v })} />
      </div>
      <Num label="Baskı En" value={inp.baskiEn} onChange={(v) => set({ baskiEn: v })} step={0.01} suffix="m" />
      <Num label="Baskı Boy" value={inp.baskiBoy} onChange={(v) => set({ baskiBoy: v })} step={0.01} suffix="m" />
    </Section>
  );
}

export function CerceveBlock({ inp, set }) {
  const c = inp.cerceve;
  return (
    <Section title="Çerçeve (Tablo için)">
      <div className="toggle-grid two">
        <Toggle label="Altın" value={c.altin} onChange={(v) => set({ cerceve: { ...c, altin: v } })} />
        <Toggle label="Gümüş" value={c.gumus} onChange={(v) => set({ cerceve: { ...c, gumus: v } })} />
        <Toggle label="Siyah" value={c.siyah} onChange={(v) => set({ cerceve: { ...c, siyah: v } })} />
        <Toggle label="Beyaz" value={c.beyaz} onChange={(v) => set({ cerceve: { ...c, beyaz: v } })} />
      </div>
    </Section>
  );
}

export function KumandaBlock({ inp, set }) {
  const k = inp.kumanda;
  return (
    <Section title="Uzaktan Kumanda">
      <div className="toggle-grid">
        <Toggle label="11 Tuş Dimmer" value={k.tus11} onChange={(v) => set({ kumanda: { ...k, tus11: v } })} />
        <Toggle label="RGB Kumanda" value={k.rgb} onChange={(v) => set({ kumanda: { ...k, rgb: v } })} />
        <Toggle label="Pixel Kumanda" value={k.pixel} onChange={(v) => set({ kumanda: { ...k, pixel: v } })} />
      </div>
    </Section>
  );
}

export function AdaptorBlock({ inp, set }) {
  return (
    <Section title="Adaptör">
      <Radio value={inp.adaptorDis} onChange={(v) => set({ adaptorDis: v })}
        options={[{ value: 0, label: 'İç Mekan' }, { value: 1, label: 'Dış Mekan' }]} />
      <p className="hint">Adaptör gücü toplam ampere göre otomatik seçilir.</p>
    </Section>
  );
}

export function PaketBlock({ inp, set }) {
  return (
    <Section title="Paketleme">
      <Toggle label="Paket Var" value={inp.paketVar} onChange={(v) => set({ paketVar: v })} />
      <div className="toggle-grid two">
        <Toggle label="Karton Panel" value={inp.kartonPanel} onChange={(v) => set({ kartonPanel: v })} />
        <Toggle label="Petek Panel" value={inp.petekPanel} onChange={(v) => set({ petekPanel: v })} />
      </div>
    </Section>
  );
}
