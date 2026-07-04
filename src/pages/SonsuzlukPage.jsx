import React, { useState } from 'react';
import { hesapla, defaultInputs } from '../engine/sonsuzluk.js';
import { Section, Radio, Num, Toggle } from '../components/Controls.jsx';
import {
  MekanBlock, IscilikBlock, LedBlock, BoyutBlock, YuzeyBlock,
  KumandaBlock, AdaptorBlock, PaketBlock,
} from '../components/CommonFields.jsx';
import Result from '../components/Result.jsx';
import EkKalemler from '../components/EkKalemler.jsx';
import UruneDonustur from '../components/UruneDonustur.jsx';
import { birlestir } from '../engine/ekKalem.js';

export default function SonsuzlukPage({ prices, constants, rates, materials, urunEkle }) {
  const [inp, setInp] = useState(defaultInputs);
  const [ekler, setEkler] = useState([]);
  const [modal, setModal] = useState(false);
  const set = (patch) => setInp((p) => ({ ...p, ...patch }));
  const sonuc = birlestir(hesapla(inp, prices, constants, rates), ekler, prices, rates.karOrani);

  return (
    <div className="calc">
      <div className="form">
        <Section title="Kasa Tipi & Ölçüler">
          <Radio label="Kasa Şekli" value={inp.kasaSekli} onChange={(v) => set({ kasaSekli: v })}
            options={[{ value: 'kare', label: 'Kare / Dikdörtgen' }, { value: 'daire', label: 'Daire / Yuvarlak' }]} />
          <Num label="En" value={inp.sEn} onChange={(v) => set({ sEn: v })} step={0.01} suffix="m" />
          <Num label="Boy" value={inp.sBoy} onChange={(v) => set({ sBoy: v })} step={0.01} suffix="m" />
          <Num label="Yükseklik" value={inp.sYuk} onChange={(v) => set({ sYuk: v })} step={0.01} suffix="m" />
          <Num label="Daire Çapı" value={inp.daireCap} onChange={(v) => set({ daireCap: v })} step={0.01} suffix="m" />
          <Num label="Ayna Delik Sayısı" value={inp.aynaDelikSayi} onChange={(v) => set({ aynaDelikSayi: v })} />
        </Section>
        <Section title="Sonsuzluk LED & Desen">
          <Radio label="LED Tipi" value={inp.sonsuzlukLed} onChange={(v) => set({ sonsuzlukLed: v })}
            options={[{ value: 'pvc', label: 'Turkuaz PVC' }, { value: 'rgb', label: 'RGB' }, { value: 'pixel', label: 'Pixel' }]} />
          <Radio label="Desen Tipi" value={inp.desenTipi} onChange={(v) => set({ desenTipi: v })}
            options={[{ value: 'duz', label: 'Düz' }, { value: 'zigzag', label: 'Zig Zag' }, { value: 'dalgali', label: 'Dalgalı' }, { value: 'ozel', label: 'Özel' }]} />
          <Radio label="İç Kenar Desen" value={inp.icDesen} onChange={(v) => set({ icDesen: v })}
            options={[{ value: 'dekota', label: 'Siyah Dekota' }, { value: 'pleksi', label: 'Siyah Pleksi' }]} />
          <Num label="Özel Desen Aralık" value={inp.ozelAralik} onChange={(v) => set({ ozelAralik: v })} step={0.01} suffix="m" />
          <Num label="Özel Desen LED" value={inp.ozelLedCm} onChange={(v) => set({ ozelLedCm: v })} suffix="cm" />
        </Section>
        <MekanBlock inp={inp} set={set} />
        <IscilikBlock inp={inp} set={set} />
        <LedBlock inp={inp} set={set} title="Üst Yüzey LED (cm) — opsiyonel" />
        <BoyutBlock inp={inp} set={set} title="Üst Kesim Yüzeyi (opsiyonel)" />
        <YuzeyBlock inp={inp} set={set} />
        <KumandaBlock inp={inp} set={set} />
        <AdaptorBlock inp={inp} set={set} />
        <Section title="Montaj">
          <div className="toggle-grid two">
            <Toggle label="Standart Montaj" value={inp.montajStandart} onChange={(v) => set({ montajStandart: v })} />
            <Toggle label="Çelik Askı" value={inp.celikAski} onChange={(v) => set({ celikAski: v })} />
            <Toggle label="Sonsuzluk Montaj Paketi" value={inp.sonsuzlukMontaj} onChange={(v) => set({ sonsuzlukMontaj: v })} />
          </div>
        </Section>
        <PaketBlock inp={inp} set={set} />
        <EkKalemler kalemler={ekler} onChange={setEkler} materials={materials} prices={prices} />
      </div>
      <div className="output">
        <Result sonuc={sonuc} karOrani={rates.karOrani} urunAdi="Sonsuzluk Aynası" />
        <button className="urune-btn" onClick={() => setModal(true)}>★ Ürüne Dönüştür</button>
      </div>
      {modal && (
        <UruneDonustur urunTipi="sonsuzluk" urunAdiVarsayilan="Sonsuzluk Aynası" inputs={inp} ekler={ekler}
          sonuc={sonuc} rates={rates} onKaydet={urunEkle} onKapat={() => setModal(false)} />
      )}
    </div>
  );
}
