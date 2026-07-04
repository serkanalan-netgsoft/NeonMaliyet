import React, { useMemo, useState } from 'react';
import { Section, Num, fmt } from '../components/Controls.jsx';
import { KATSAYI_META } from '../data/pricing.js';

const CUR_LABEL = { USD: '$', EUR: '€', TL: '₺' };
const getIn = (obj, path) => path.reduce((o, k) => (o == null ? undefined : o[k]), obj);

export default function SettingsPage({ ayarlar }) {
  const { rates, setRate, materials, setMaterialBase, prices, constants, setConstant, sifirla } = ayarlar;
  const [ara, setAra] = useState('');

  const gruplar = useMemo(() => {
    const g = {};
    for (const [key, m] of Object.entries(materials)) {
      if (ara && !m.ad.toLocaleLowerCase('tr').includes(ara.toLocaleLowerCase('tr'))) continue;
      (g[m.grup] ||= []).push([key, m]);
    }
    return g;
  }, [materials, ara]);

  return (
    <div className="settings">
      <Section title="Kurlar & Genel Parametreler">
        <div className="rates-grid">
          <Num label="Dolar Kuru ($)" value={rates.usd} onChange={(v) => setRate('usd', v)} step={0.01} suffix="₺" />
          <Num label="Euro Kuru (€)" value={rates.eur} onChange={(v) => setRate('eur', v)} step={0.01} suffix="₺" />
          <Num label="KDV Çarpanı" value={rates.kdv} onChange={(v) => setRate('kdv', v)} step={0.01} />
          <Num label="Kar Oranı (Satış = Maliyet ×)" value={rates.karOrani} onChange={(v) => setRate('karOrani', v)} step={0.1} />
        </div>
        <p className="hint">Bir malzemenin fiyatı: <b>baz fiyat × kur × KDV</b>. Kur değişince tüm ürünler otomatik güncellenir.</p>
        <button className="btn-reset" onClick={sifirla}>↺ Tüm Ayarları Varsayılana Döndür</button>
      </Section>

      <Section title="Katsayılar & Sabit Değişkenler">
        <p className="hint">Excel'deki tüm hesap katsayıları. Değiştirdiğinizde ilgili ürün maliyetleri anında güncellenir.</p>
        {KATSAYI_META.map((grup) => (
          <div className="mat-group" key={grup.grup}>
            <h4>{grup.grup}</h4>
            <div className="katsayi-grid">
              {grup.items.map((it) => (
                <Num
                  key={it.path.join('.')}
                  label={it.label}
                  value={getIn(constants, it.path)}
                  step={0.01}
                  onChange={(v) => setConstant(it.path, v)}
                />
              ))}
            </div>
          </div>
        ))}
      </Section>

      <Section title="Malzeme Baz Fiyatları">
        <input className="search" placeholder="Malzeme ara…" value={ara} onChange={(e) => setAra(e.target.value)} />
        {Object.entries(gruplar).map(([grup, list]) => (
          <div className="mat-group" key={grup}>
            <h4>{grup}</h4>
            <div className="mat-table">
              <div className="mat-head">
                <span>Malzeme</span><span>Baz</span><span>Birim</span><span>KDV'li TL</span>
              </div>
              {list.map(([key, m]) => (
                <div className="mat-row" key={key}>
                  <span className="mat-ad">{m.ad}</span>
                  <input type="number" step="0.0001" value={m.base}
                    onChange={(e) => setMaterialBase(key, e.target.value === '' ? 0 : parseFloat(e.target.value))} />
                  <span className="mat-cur">{CUR_LABEL[m.cur]}</span>
                  <span className="mat-price">{fmt(prices[key])} ₺</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </Section>
    </div>
  );
}
