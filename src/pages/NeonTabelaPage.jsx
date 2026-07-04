import React, { useState } from 'react';
import { hesapla, defaultInputs } from '../engine/neonTabela.js';
import { Section, Radio, Toggle } from '../components/Controls.jsx';
import {
  MekanBlock, IscilikBlock, LedBlock, BoyutBlock, YuzeyBlock, BaskiBlock,
  CerceveBlock, KumandaBlock, AdaptorBlock, PaketBlock,
} from '../components/CommonFields.jsx';
import Result from '../components/Result.jsx';
import EkKalemler from '../components/EkKalemler.jsx';
import { birlestir } from '../engine/ekKalem.js';

export default function NeonTabelaPage({ prices, constants, rates, materials }) {
  const [inp, setInp] = useState(defaultInputs);
  const [ekler, setEkler] = useState([]);
  const set = (patch) => setInp((p) => ({ ...p, ...patch }));
  const sonuc = birlestir(hesapla(inp, prices, constants, rates), ekler, prices, rates.karOrani);

  return (
    <div className="calc">
      <div className="form">
        <Section title="Ürün Tipi">
          <Radio value={inp.urunTipi} onChange={(v) => set({ urunTipi: v })} options={[
            { value: 'tabela', label: 'Neon Tabela' },
            { value: 'openBox', label: 'Open Box' },
            { value: 'pleksiKutu', label: 'Pleksi Kutu' },
            { value: 'tablo', label: 'Neon Tablo' },
            { value: 'selfie', label: 'Selfie Aynası' },
          ]} />
        </Section>
        <MekanBlock inp={inp} set={set} />
        <IscilikBlock inp={inp} set={set} />
        <LedBlock inp={inp} set={set} />
        <BoyutBlock inp={inp} set={set} />
        <YuzeyBlock inp={inp} set={set} />
        <BaskiBlock inp={inp} set={set} />
        <CerceveBlock inp={inp} set={set} />
        <KumandaBlock inp={inp} set={set} />
        <AdaptorBlock inp={inp} set={set} />
        <Section title="Montaj">
          <div className="toggle-grid two">
            <Toggle label="Standart Montaj Paketi" value={inp.montajStandart} onChange={(v) => set({ montajStandart: v })} />
            <Toggle label="Çelik Askı Aparatı" value={inp.celikAski} onChange={(v) => set({ celikAski: v })} />
          </div>
        </Section>
        <PaketBlock inp={inp} set={set} />
        <EkKalemler kalemler={ekler} onChange={setEkler} materials={materials} prices={prices} />
      </div>
      <div className="output">
        <Result sonuc={sonuc} karOrani={rates.karOrani} urunAdi="Neon Tabela" />
      </div>
    </div>
  );
}
