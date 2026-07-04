// Ek Maliyet Kalemleri düzenleyici — ürün ekranlarında kullanılır
import React, { useMemo } from 'react';
import { Section, fmt } from './Controls.jsx';
import { bosKalem, ekTutar } from '../engine/ekKalem.js';

export default function EkKalemler({ kalemler, onChange, materials, prices }) {
  // Malzeme açılır listesi seçenekleri (gruplu)
  const gruplar = useMemo(() => {
    const g = {};
    for (const [key, m] of Object.entries(materials)) (g[m.grup] ||= []).push([key, m]);
    return g;
  }, [materials]);

  const guncelle = (i, patch) => onChange(kalemler.map((k, j) => (j === i ? { ...k, ...patch } : k)));
  const ekle = () => onChange([...kalemler, bosKalem()]);
  const sil = (i) => onChange(kalemler.filter((_, j) => j !== i));

  return (
    <Section title="Ek Maliyet Kalemleri" className="full">
      {kalemler.length === 0 && <p className="hint">Bu ürüne özel ekstra malzeme/işçilik eklemek için aşağıdan ekleyin.</p>}
      {kalemler.map((k, i) => (
        <div className="ek-row" key={i}>
          <select className="ek-tip" value={k.tip}
            onChange={(e) => guncelle(i, { tip: e.target.value })}>
            <option value="elle">Elle</option>
            <option value="malzeme">Malzeme</option>
          </select>

          {k.tip === 'malzeme' ? (
            <select className="ek-ad" value={k.malzemeKey}
              onChange={(e) => {
                const key = e.target.value;
                guncelle(i, { malzemeKey: key, ad: key ? materials[key].ad : '' });
              }}>
              <option value="">— Malzeme seç —</option>
              {Object.entries(gruplar).map(([grup, list]) => (
                <optgroup label={grup} key={grup}>
                  {list.map(([key, m]) => (
                    <option value={key} key={key}>{m.ad}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          ) : (
            <input className="ek-ad" placeholder="Kalem adı (örn. Özel Kutu)"
              value={k.ad} onChange={(e) => guncelle(i, { ad: e.target.value })} />
          )}

          <input className="ek-miktar" type="number" step="0.01" title="Miktar"
            value={k.miktar} onChange={(e) => guncelle(i, { miktar: e.target.value })} />
          <span className="ek-carpi">×</span>

          {k.tip === 'malzeme' ? (
            <span className="ek-birim" title="Birim fiyat (KDV'li)">{fmt(prices[k.malzemeKey] || 0)} ₺</span>
          ) : (
            <input className="ek-birim-input" type="number" step="0.01" title="Birim fiyat (₺)"
              value={k.birimFiyat} onChange={(e) => guncelle(i, { birimFiyat: e.target.value })} />
          )}

          <span className="ek-tutar">{fmt(ekTutar(k, prices))} ₺</span>
          <button className="ek-sil" title="Kaldır" onClick={() => sil(i)}>✕</button>
        </div>
      ))}
      <button className="ek-ekle" onClick={ekle}>+ Ek Kalem Ekle</button>
    </Section>
  );
}
