import React, { useState, useEffect } from 'react';
import { hesapla, defaultInputs } from '../engine/neonMasa.js';
import { Section, Radio, Num } from '../components/Controls.jsx';
import {
  MekanBlock, IscilikBlock, LedBlock, BoyutBlock, YuzeyBlock, BaskiBlock,
  KumandaBlock, AdaptorBlock, PaketBlock,
} from '../components/CommonFields.jsx';
import Result from '../components/Result.jsx';
import EkKalemler from '../components/EkKalemler.jsx';
import UruneDonustur from '../components/UruneDonustur.jsx';
import { birlestir } from '../engine/ekKalem.js';

export default function MasaPage({ prices, constants, rates, materials, urunEkle, urunGuncelle, duzenlenen, onDuzenlemeBitti }) {
  const [inp, setInp] = useState(duzenlenen?.inputs || defaultInputs);
  const [ekler, setEkler] = useState(duzenlenen?.ekler || []);
  const [modal, setModal] = useState(false);
  useEffect(() => { if (duzenlenen) { setInp(duzenlenen.inputs); setEkler(duzenlenen.ekler || []); } }, [duzenlenen]);
  const set = (patch) => setInp((p) => ({ ...p, ...patch }));
  const sonuc = birlestir(hesapla(inp, prices, constants, rates), ekler, prices, rates.karOrani);

  return (
    <div className="calc">
      <div className="form">
        {duzenlenen && (
          <div className="duzenle-banner">
            <span>📝 <b>{duzenlenen.ad}</b> düzenleniyor</span>
            <button onClick={onDuzenlemeBitti}>Vazgeç</button>
          </div>
        )}
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
        <button className="urune-btn" onClick={() => setModal(true)}>{duzenlenen ? '★ Değişiklikleri Kaydet' : '★ Ürüne Dönüştür'}</button>
      </div>
      {modal && (
        <UruneDonustur urunTipi="masa" urunAdiVarsayilan="Neon Masa" inputs={inp} ekler={ekler}
          sonuc={sonuc} rates={rates} mevcut={duzenlenen}
          onKaydet={(p) => { if (duzenlenen) { urunGuncelle(duzenlenen.id, p); onDuzenlemeBitti(); } else { urunEkle(p); } }}
          onKapat={() => setModal(false)} />
      )}
    </div>
  );
}
