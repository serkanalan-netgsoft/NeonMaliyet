import React, { useMemo, useState } from 'react';
import { Section, Num, fmt } from '../components/Controls.jsx';
import { KATSAYI_META } from '../data/pricing.js';
import { guncelKur } from '../lib/kur.js';

const CUR_LABEL = { USD: '$', EUR: '€', TL: '₺' };
const getIn = (obj, path) => path.reduce((o, k) => (o == null ? undefined : o[k]), obj);

export default function SettingsPage({ ayarlar }) {
  const { rates, setRate, materials, setMaterialBase, addMaterial, removeMaterial, prices, constants, setConstant, sifirla, firma, setFirma } = ayarlar;
  const [ara, setAra] = useState('');
  const [yeni, setYeni] = useState({ ad: '', base: '', cur: 'TL' });
  const [kurDurum, setKurDurum] = useState('');

  const kurCek = async () => {
    setKurDurum('yukleniyor');
    try {
      const k = await guncelKur();
      setRate('usd', k.usd);
      if (k.eur) setRate('eur', k.eur);
      setKurDurum(`✓ Güncellendi — 1$=${k.usd}₺ · 1€=${k.eur ?? '-'}₺`);
    } catch {
      setKurDurum('⚠️ Kur alınamadı (internet bağlantısını kontrol edin)');
    }
  };

  const yeniEkle = () => {
    if (!yeni.ad.trim()) return;
    addMaterial(yeni.ad.trim(), yeni.base, yeni.cur);
    setYeni({ ad: '', base: '', cur: 'TL' });
  };

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
        <div className="kur-cek">
          <button className="btn-add" onClick={kurCek} disabled={kurDurum === 'yukleniyor'}>
            {kurDurum === 'yukleniyor' ? 'Çekiliyor…' : '🔄 Güncel Kuru Çek'}
          </button>
          {kurDurum && kurDurum !== 'yukleniyor' && <span className="kur-durum">{kurDurum}</span>}
        </div>
        <p className="hint">Güncel piyasa kuru internetten çekilir. İsterseniz üstüne kendi payınızı (malzeme alım kuru) ekleyip düzenleyebilirsiniz.</p>
        <button className="btn-reset" onClick={sifirla}>↺ Tüm Ayarları Varsayılana Döndür</button>
      </Section>

      <Section title="Firma Bilgileri (PDF teklif başlığı)">
        <div className="firma-grid">
          <label className="field"><span className="field-label">Firma Adı</span>
            <span className="field-input"><input value={firma.ad} onChange={(e) => setFirma('ad', e.target.value)} /></span></label>
          <label className="field"><span className="field-label">Telefon</span>
            <span className="field-input"><input value={firma.telefon} onChange={(e) => setFirma('telefon', e.target.value)} placeholder="0555 000 00 00" /></span></label>
          <label className="field"><span className="field-label">Web / Instagram</span>
            <span className="field-input"><input value={firma.web} onChange={(e) => setFirma('web', e.target.value)} placeholder="@firma" /></span></label>
          <label className="field"><span className="field-label">Teklif Notu</span>
            <span className="field-input"><input value={firma.not} onChange={(e) => setFirma('not', e.target.value)} /></span></label>
        </div>
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
        <div className="yeni-malzeme">
          <input placeholder="Yeni malzeme adı" value={yeni.ad}
            onChange={(e) => setYeni({ ...yeni, ad: e.target.value })} />
          <input type="number" step="0.0001" placeholder="Baz fiyat" value={yeni.base}
            onChange={(e) => setYeni({ ...yeni, base: e.target.value })} />
          <select value={yeni.cur} onChange={(e) => setYeni({ ...yeni, cur: e.target.value })}>
            <option value="TL">₺ TL</option>
            <option value="USD">$ USD</option>
            <option value="EUR">€ EUR</option>
          </select>
          <button className="btn-add" onClick={yeniEkle}>+ Malzeme Ekle</button>
        </div>
        <p className="hint">Eklediğiniz özel malzemeler ürün ekranlarındaki "Ek Kalem → Malzeme" listesinde çıkar.</p>

        <input className="search" placeholder="Malzeme ara…" value={ara} onChange={(e) => setAra(e.target.value)} />
        {Object.entries(gruplar).map(([grup, list]) => (
          <div className="mat-group" key={grup}>
            <h4>{grup}</h4>
            <div className="mat-table">
              <div className="mat-head">
                <span>Malzeme</span><span>Baz</span><span>Birim</span><span>KDV'li TL</span>
              </div>
              {list.map(([key, m]) => (
                <div className={`mat-row ${m.ozel ? 'ozel' : ''}`} key={key}>
                  <span className="mat-ad">{m.ozel && <em className="ozel-tag">özel</em>} {m.ad}</span>
                  <input type="number" step="0.0001" value={m.base}
                    onChange={(e) => setMaterialBase(key, e.target.value === '' ? 0 : parseFloat(e.target.value))} />
                  <span className="mat-cur">{CUR_LABEL[m.cur]}</span>
                  <span className="mat-price">
                    {fmt(prices[key])} ₺
                    {m.ozel && <button className="mat-sil" title="Sil" onClick={() => removeMaterial(key)}>✕</button>}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </Section>
    </div>
  );
}
