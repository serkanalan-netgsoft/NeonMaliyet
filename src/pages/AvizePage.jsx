import React, { useState } from 'react';
import { hesapla, defaultInputs, AVIZE_CAPLAR } from '../engine/neonAvize.js';
import { Section, Select } from '../components/Controls.jsx';
import {
  MekanBlock, IscilikBlock, LedBlock, BoyutBlock, YuzeyBlock, BaskiBlock,
  KumandaBlock, AdaptorBlock, PaketBlock,
} from '../components/CommonFields.jsx';
import Result from '../components/Result.jsx';
import EkKalemler from '../components/EkKalemler.jsx';
import { birlestir } from '../engine/ekKalem.js';

export default function AvizePage({ prices, constants, rates, materials }) {
  const [inp, setInp] = useState(defaultInputs);
  const [ekler, setEkler] = useState([]);
  const set = (patch) => setInp((p) => ({ ...p, ...patch }));
  const sonuc = birlestir(hesapla(inp, prices, constants, rates), ekler, prices, rates.karOrani);

  return (
    <div className="calc">
      <div className="form">
        <Section title="Avize Seçimi">
          <Select label="Metal Avize Çapı" value={inp.avizeCap} onChange={(v) => set({ avizeCap: v })}
            options={AVIZE_CAPLAR} />
          <p className="hint">
            ✓ Avize fiyat eşlemesi düzeltildi: her çap artık kendi fiyatıyla hesaplanır
            (Excel'deki ters eşleme hatası giderildi).
          </p>
        </Section>
        <MekanBlock inp={inp} set={set} />
        <IscilikBlock inp={inp} set={set} />
        <LedBlock inp={inp} set={set} title="Üst Yüzey LED (cm)" />
        <BoyutBlock inp={inp} set={set} title="Üst Kesim / Yükseklik (En × Boy)" />
        <YuzeyBlock inp={inp} set={set} />
        <BaskiBlock inp={inp} set={set} />
        <KumandaBlock inp={inp} set={set} />
        <AdaptorBlock inp={inp} set={set} />
        <PaketBlock inp={inp} set={set} />
        <EkKalemler kalemler={ekler} onChange={setEkler} materials={materials} prices={prices} />
      </div>
      <div className="output">
        <Result sonuc={sonuc} karOrani={rates.karOrani} urunAdi="Neon Avize" />
      </div>
    </div>
  );
}
