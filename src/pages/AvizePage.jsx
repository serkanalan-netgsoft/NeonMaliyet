import React, { useState, useEffect } from 'react';
import { hesapla, defaultInputs, AVIZE_CAPLAR } from '../engine/neonAvize.js';
import { Section, Select } from '../components/Controls.jsx';
import {
  MekanBlock, IscilikBlock, LedBlock, BoyutBlock, YuzeyBlock, BaskiBlock,
  KumandaBlock, AdaptorBlock, PaketBlock,
} from '../components/CommonFields.jsx';
import Result from '../components/Result.jsx';
import EkKalemler from '../components/EkKalemler.jsx';
import UruneDonustur from '../components/UruneDonustur.jsx';
import { birlestir } from '../engine/ekKalem.js';

export default function AvizePage({ prices, constants, rates, materials, urunEkle, urunGuncelle, duzenlenen, onDuzenlemeBitti }) {
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
        <button className="urune-btn" onClick={() => setModal(true)}>{duzenlenen ? '★ Değişiklikleri Kaydet' : '★ Ürüne Dönüştür'}</button>
      </div>
      {modal && (
        <UruneDonustur urunTipi="avize" urunAdiVarsayilan="Neon Avize" inputs={inp} ekler={ekler}
          sonuc={sonuc} rates={rates} mevcut={duzenlenen}
          onKaydet={(p) => { if (duzenlenen) { urunGuncelle(duzenlenen.id, p); onDuzenlemeBitti(); } else { urunEkle(p); } }}
          onKapat={() => setModal(false)} />
      )}
    </div>
  );
}
