import React from 'react';
import { fmt } from '../components/Controls.jsx';
import { REGISTRY, hesaplaUrun } from '../engine/registry.js';

function tarihStr(ts) {
  try { return new Date(ts).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric' }); }
  catch { return ''; }
}

export default function UrunlerPage({ urunler, urunSil, prices, constants, rates }) {
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
    <div className="urun-liste">
      {urunler.map((u) => {
        const g = hesaplaUrun(u, prices, constants, rates);           // güncel
        const fark = g.satis - (u.olusturmaFiyat || 0);
        const yuzde = u.olusturmaFiyat ? (fark / u.olusturmaFiyat) * 100 : 0;
        return (
          <div className="urun-kart" key={u.id}>
            <div className="urun-kart-foto">
              {u.gorsel ? <img src={u.gorsel} alt={u.ad} /> : <span>{(REGISTRY[u.urunTipi]?.ad || '').slice(0, 1) || '◈'}</span>}
            </div>
            <div className="urun-kart-govde">
              <div className="urun-kart-bas">
                <div>
                  <h4>{u.ad}</h4>
                  <p className="muted">{REGISTRY[u.urunTipi]?.ad}{u.sku ? ` · ${u.sku}` : ''}</p>
                </div>
                <button className="urun-sil" title="Sil" onClick={() => urunSil(u.id)}>✕</button>
              </div>

              <div className="urun-fiyatlar">
                <div className="uf">
                  <span>Güncel Maliyet</span>
                  <b>{fmt(g.toplam)} ₺</b>
                </div>
                <div className="uf vurgu">
                  <span>Güncel Satış (× {g.marj}{u.marjTipi === 'ozel' ? ' özel' : ''})</span>
                  <b>{fmt(g.satis)} ₺</b>
                </div>
              </div>

              <div className="urun-kart-alt">
                <span className="muted">Kayıt: {tarihStr(u.olusturmaTarihi)} · {fmt(u.olusturmaFiyat)} ₺</span>
                {Math.abs(fark) > 0.5 && (
                  <span className={`fark ${fark > 0 ? 'up' : 'down'}`}>
                    {fark > 0 ? '▲' : '▼'} {fmt(Math.abs(fark))} ₺ ({yuzde > 0 ? '+' : ''}{yuzde.toFixed(1)}%)
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
