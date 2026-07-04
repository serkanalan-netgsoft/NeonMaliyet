import React, { useState, useMemo } from 'react';
import { fmt } from '../components/Controls.jsx';
import { REGISTRY, hesaplaUrun } from '../engine/registry.js';
import UruneDonustur from '../components/UruneDonustur.jsx';

function tarihStr(ts) {
  try { return new Date(ts).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric' }); }
  catch { return ''; }
}

const TIP_FILTRE = [
  { key: 'hepsi', ad: 'Tümü' },
  { key: 'tabela', ad: 'Neon Tabela' },
  { key: 'sonsuzluk', ad: 'Sonsuzluk Aynası' },
  { key: 'masa', ad: 'Neon Masa' },
  { key: 'avize', ad: 'Neon Avize' },
];

const SIRALAMA = [
  { key: 'yeni', ad: 'En yeni' },
  { key: 'eski', ad: 'En eski' },
  { key: 'fiyatArtan', ad: 'Fiyat (artan)' },
  { key: 'fiyatAzalan', ad: 'Fiyat (azalan)' },
  { key: 'isim', ad: 'İsme göre (A-Z)' },
];

export default function UrunlerPage({ urunler, urunSil, urunGuncelle, onDuzenle, prices, constants, rates }) {
  const [ara, setAra] = useState('');
  const [tip, setTip] = useState('hepsi');
  const [sira, setSira] = useState('yeni');
  const [modal, setModal] = useState(null); // düzenlenecek ürün (metadata)

  // Her ürünün güncel fiyatını hesapla, sonra filtrele/sırala
  const gorunen = useMemo(() => {
    const q = ara.trim().toLocaleLowerCase('tr');
    let liste = urunler.map((u) => ({ u, g: hesaplaUrun(u, prices, constants, rates) }));
    if (tip !== 'hepsi') liste = liste.filter(({ u }) => u.urunTipi === tip);
    if (q) liste = liste.filter(({ u }) =>
      (u.ad || '').toLocaleLowerCase('tr').includes(q) || (u.sku || '').toLocaleLowerCase('tr').includes(q));
    const s = {
      yeni: (a, b) => (b.u.olusturmaTarihi || 0) - (a.u.olusturmaTarihi || 0),
      eski: (a, b) => (a.u.olusturmaTarihi || 0) - (b.u.olusturmaTarihi || 0),
      fiyatArtan: (a, b) => a.g.satis - b.g.satis,
      fiyatAzalan: (a, b) => b.g.satis - a.g.satis,
      isim: (a, b) => (a.u.ad || '').localeCompare(b.u.ad || '', 'tr'),
    }[sira];
    return liste.sort(s);
  }, [urunler, ara, tip, sira, prices, constants, rates]);

  if (!urunler.length) {
    return (
      <div className="urun-bos">
        <p>Henüz kayıtlı ürün yok.</p>
        <p className="muted">Bir ürünün maliyetini hesaplayıp <b>“★ Ürüne Dönüştür”</b> ile kaydedin.
          Malzeme fiyatları veya kur değiştiğinde burada <b>güncel fiyatı</b> otomatik görürsünüz.</p>
      </div>
    );
  }

  return (
    <div className="urunler">
      <div className="urun-arac">
        <input className="search" placeholder="Ürün adı veya SKU ara…" value={ara} onChange={(e) => setAra(e.target.value)} />
        <select value={sira} onChange={(e) => setSira(e.target.value)}>
          {SIRALAMA.map((s) => <option key={s.key} value={s.key}>{s.ad}</option>)}
        </select>
      </div>
      <div className="urun-filtre">
        {TIP_FILTRE.map((t) => (
          <button key={t.key} className={`chip ${tip === t.key ? 'active' : ''}`} onClick={() => setTip(t.key)}>{t.ad}</button>
        ))}
      </div>

      <p className="muted urun-sayi">{gorunen.length} ürün gösteriliyor</p>

      {gorunen.length === 0 ? (
        <p className="muted">Aramanıza uygun ürün bulunamadı.</p>
      ) : (
        <div className="urun-liste">
          {gorunen.map(({ u, g }) => {
            const fark = g.satis - (u.olusturmaFiyat || 0);
            const yuzde = u.olusturmaFiyat ? (fark / u.olusturmaFiyat) * 100 : 0;
            return (
              <div className="urun-kart" key={u.id}>
                <div className="urun-kart-foto">
                  {u.gorsel ? <img src={u.gorsel} alt={u.ad} /> : <span>{(REGISTRY[u.urunTipi]?.ad || '◈').slice(0, 1)}</span>}
                </div>
                <div className="urun-kart-govde">
                  <div className="urun-kart-bas">
                    <div>
                      <h4>{u.ad}</h4>
                      <p className="muted">{REGISTRY[u.urunTipi]?.ad}{u.sku ? ` · ${u.sku}` : ''}</p>
                    </div>
                    <button className="urun-sil" title="Sil" onClick={() => { if (confirm(`"${u.ad}" silinsin mi?`)) urunSil(u.id); }}>✕</button>
                  </div>

                  <div className="urun-fiyatlar">
                    <div className="uf"><span>Güncel Maliyet</span><b>{fmt(g.toplam)} ₺</b></div>
                    <div className="uf vurgu"><span>Güncel Satış (× {g.marj}{u.marjTipi === 'ozel' ? ' özel' : ''})</span><b>{fmt(g.satis)} ₺</b></div>
                  </div>

                  <div className="urun-kart-alt">
                    <span className="muted">Kayıt: {tarihStr(u.olusturmaTarihi)} · {fmt(u.olusturmaFiyat)} ₺</span>
                    {Math.abs(fark) > 0.5 && (
                      <span className={`fark ${fark > 0 ? 'up' : 'down'}`}>
                        {fark > 0 ? '▲' : '▼'} {fmt(Math.abs(fark))} ₺ ({yuzde > 0 ? '+' : ''}{yuzde.toFixed(1)}%)
                      </span>
                    )}
                  </div>

                  <div className="urun-islem">
                    <button onClick={() => setModal(u)}>✎ Düzenle</button>
                    <button onClick={() => onDuzenle(u)}>⚙ Hesaplayıcıda Aç</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {modal && (
        <UruneDonustur
          urunTipi={modal.urunTipi} urunAdiVarsayilan={REGISTRY[modal.urunTipi]?.ad}
          inputs={modal.inputs} ekler={modal.ekler} mevcut={modal}
          sonuc={hesaplaUrun(modal, prices, constants, rates)} rates={rates}
          onKaydet={(patch) => urunGuncelle(modal.id, patch)}
          onKapat={() => setModal(null)}
        />
      )}
    </div>
  );
}
