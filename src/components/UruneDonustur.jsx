// "Ürüne Dönüştür" modalı — hesaplanan maliyeti kalıcı ürüne çevirir
import React, { useState, useRef } from 'react';
import { fmt } from './Controls.jsx';

// Görseli tarayıcıda küçültüp JPEG data URL'e çevirir (localStorage'ı şişirmemek için)
function gorselKucult(file, maxDim = 400) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale), h = Math.round(img.height * scale);
        const c = document.createElement('canvas');
        c.width = w; c.height = h;
        c.getContext('2d').drawImage(img, 0, 0, w, h);
        resolve(c.toDataURL('image/jpeg', 0.82));
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function UruneDonustur({ urunTipi, urunAdiVarsayilan, inputs, ekler, sonuc, rates, onKaydet, onKapat }) {
  const [ad, setAd] = useState('');
  const [sku, setSku] = useState('');
  const [gorsel, setGorsel] = useState('');
  const [marjTipi, setMarjTipi] = useState('genel');       // genel | ozel
  const [ozelMarj, setOzelMarj] = useState(rates.karOrani);
  const [yukleniyor, setYukleniyor] = useState(false);
  const fileRef = useRef(null);

  const marj = marjTipi === 'ozel' ? (Number(ozelMarj) || rates.karOrani) : rates.karOrani;
  const satis = sonuc.toplam * marj;

  const gorselSec = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setYukleniyor(true);
    try { setGorsel(await gorselKucult(file)); } catch { alert('Görsel yüklenemedi.'); }
    setYukleniyor(false);
  };

  const kaydet = () => {
    if (!ad.trim()) { alert('Lütfen ürün adı girin.'); return; }
    onKaydet({
      urunTipi, ad: ad.trim(), sku: sku.trim(), gorsel,
      inputs, ekler,
      marjTipi, ozelMarj: Number(ozelMarj) || rates.karOrani,
      olusturmaTarihi: Date.now(),
      olusturmaMaliyet: sonuc.toplam,
      olusturmaFiyat: satis,
    });
    onKapat();
  };

  return (
    <div className="modal-arka" onClick={onKapat}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-bas">
          <h3>Ürüne Dönüştür</h3>
          <button className="modal-kapat" onClick={onKapat}>✕</button>
        </div>

        <div className="modal-govde">
          <div className="urun-foto" onClick={() => fileRef.current?.click()}>
            {gorsel ? <img src={gorsel} alt="ürün" /> : <span>{yukleniyor ? 'Yükleniyor…' : '🖼️ Görsel Yükle'}</span>}
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={gorselSec} />
          </div>

          <label className="field">
            <span className="field-label">Ürün Adı *</span>
            <span className="field-input"><input value={ad} onChange={(e) => setAd(e.target.value)} placeholder={urunAdiVarsayilan} autoFocus /></span>
          </label>
          <label className="field">
            <span className="field-label">SKU / Ürün Kodu</span>
            <span className="field-input"><input value={sku} onChange={(e) => setSku(e.target.value)} placeholder="örn. NT-001" /></span>
          </label>

          <div className="marj-sec">
            <span className="field-label">Kar Marjı</span>
            <button type="button" className={`chip ${marjTipi === 'genel' ? 'active' : ''}`} onClick={() => setMarjTipi('genel')}>
              Genel marj (× {rates.karOrani})
            </button>
            <button type="button" className={`chip ${marjTipi === 'ozel' ? 'active' : ''}`} onClick={() => setMarjTipi('ozel')}>
              Bu ürüne özel marj
            </button>
            {marjTipi === 'ozel' && (
              <input className="ozel-marj" type="number" step="0.1" value={ozelMarj}
                onChange={(e) => setOzelMarj(e.target.value)} />
            )}
          </div>

          <div className="modal-ozet">
            <div><span>Güncel Maliyet</span><b>{fmt(sonuc.toplam)} ₺</b></div>
            <div className="vurgu"><span>Satış Fiyatı (× {marj})</span><b>{fmt(satis)} ₺</b></div>
          </div>
        </div>

        <div className="modal-alt">
          <button className="btn-iptal" onClick={onKapat}>İptal</button>
          <button className="btn-kaydet" onClick={kaydet}>★ Ürünü Kaydet</button>
        </div>
      </div>
    </div>
  );
}
