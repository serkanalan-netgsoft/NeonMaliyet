import React, { useState } from 'react';
import { hesapla, defaultInputs } from '../engine/neonMasa.js';
import { Section, Radio, Num } from '../components/Controls.jsx';
import {
  MekanBlock, IscilikBlock, LedBlock, BoyutBlock, YuzeyBlock, BaskiBlock,
  KumandaBlock, AdaptorBlock, PaketBlock,
} from '../components/CommonFields.jsx';
import Result from '../components/Result.jsx';
import EkKalemler from '../components/EkKalemler.jsx';
import { birlestir } from '../engine/ekKalem.js';

export default function MasaPage({ prices, constants, rates, materials }) {
  const [inp, setInp] = useState(defaultInputs);
  const [ekler, setEkler] = useState([]);
  const set = (patch) => setInp((p) => ({ ...p, ...patch }));
  const sonuc = birlestir(hesapla(inp, prices, constants, rates), ekler, prices, rates.karOrani);

  return (
    <div className="calc">
      <div className="form">
        <Section title="Masa Özellikleri">
          <Radio label="Cam Tipi" value={inp.camTipi} onChange={(v) => set({ camTipi: v })}
            options={[{ value: 'normal', label: 'Normal Cam' }, { value: 'fume', label: 'Füme Cam' }]} />
          <Radio label="Masa LED Tipi" value={inp.masaLed} onChange={(v) => set({ masaLed: v })}
            options={[{ value: 'pvc', label: 'Turkuaz PVC' }, { value: 'rgb', label: 'RGB' }, { value: 'pixel', label: 'Pixel' }]} />
          <Num label="Masa En" value={inp.mEn} onChange={(v) => set({ mEn: v })} step={0.01} suffix="m" />
          <Num label="Masa Boy" value={inp.mBoy} onChange={(v) => set({ mBoy: v })} step={0.01} suffix="m" />
          <Num label="Masa Yükseklik" value={inp.mYuk} onChange={(v) => set({ mYuk: v })} step={0.01} suffix="m" />
          <Num label="Neon Çubuk Sayısı" value={inp.cubukSayisi} onChange={(v) => set({ cubukSayisi: v })} />
        </Section>
        <MekanBlock inp={inp} set={set} />
        <IscilikBlock inp={inp} set={set} />
        <LedBlock inp={inp} set={set} title="Üst Yüzey LED (cm)" />
        <BoyutBlock inp={inp} set={set} title="Üst Kesim Yüzeyi" />
        <YuzeyBlock inp={inp} set={set} />
        <BaskiBlock inp={inp} set={set} />
        <KumandaBlock inp={inp} set={set} />
        <AdaptorBlock inp={inp} set={set} />
        <PaketBlock inp={inp} set={set} />
        <EkKalemler kalemler={ekler} onChange={setEkler} materials={materials} prices={prices} />
      </div>
      <div className="output">
        <Result sonuc={sonuc} karOrani={rates.karOrani} urunAdi="Neon Masa" />
      </div>
    </div>
  );
}
