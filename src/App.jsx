import React, { useState, useRef, useLayoutEffect } from 'react';
import { useAyarlar } from './store.js';
import NeonTabelaPage from './pages/NeonTabelaPage.jsx';
import SonsuzlukPage from './pages/SonsuzlukPage.jsx';
import MasaPage from './pages/MasaPage.jsx';
import AvizePage from './pages/AvizePage.jsx';
import UrunlerPage from './pages/UrunlerPage.jsx';
import TasarlaPage, { VARSAYILAN_TASARIM } from './pages/TasarlaPage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';

const SEKMELER = [
  { key: 'tasarla', ad: 'Neon Tasarla', ikon: '✨' },
  { key: 'tabela', ad: 'Neon Tabela', ikon: '🪧' },
  { key: 'sonsuzluk', ad: 'Sonsuzluk Aynası', ikon: '🪞' },
  { key: 'masa', ad: 'Neon Masa', ikon: '🟦' },
  { key: 'avize', ad: 'Neon Avize', ikon: '💡' },
  { key: 'urunler', ad: 'Ürünlerim', ikon: '📦' },
  { key: 'ayarlar', ad: 'Ayarlar', ikon: '⚙️' },
];

export default function App() {
  const [sekme, setSekme] = useState('tasarla');
  const [duzenlenen, setDuzenlenen] = useState(null); // hesaplayıcıda düzenlenen ürün
  const [tasarimDesign, setTasarimDesign] = useState(VARSAYILAN_TASARIM); // Neon Tasarla durumu (sekmeler arası korunur)
  const [tasarimOverride, setTasarimOverride] = useState(null); // ince ayarlı girdiler
  const ayarlar = useAyarlar();

  // "Hesaplayıcıda Aç" → ürünü kendi hesaplayıcı sekmesine yükle
  const onDuzenle = (urun) => { setDuzenlenen(urun); setSekme(urun.urunTipi); };
  const duzenlemeBitti = () => setDuzenlenen(null);
  // Neon Tasarla → Neon Tabela hesaplayıcısına aktar (ince ayar için; kayıtlı ürün değil)
  const tasarimiAktar = ({ inputs, ekler }) => {
    setDuzenlenen({ urunTipi: 'tabela', inputs, ekler: ekler || [], ad: 'Tasarım', kaynak: 'tasarim' });
    setSekme('tabela');
  };
  // Neon Tabela ince ayar → Neon Tasarla'ya geri dön (ince ayarlı fiyatla PDF için)
  const tasarimaDon = (inputs, ekler) => {
    setTasarimOverride({ inputs, ekler: ekler || [] });
    setDuzenlenen(null);
    setSekme('tasarla');
  };
  // Sekme değişince (kullanıcı elle başka sekmeye geçerse) düzenleme modunu bırak
  const sekmeSec = (k) => { if (k !== duzenlenen?.urunTipi) setDuzenlenen(null); setSekme(k); };

  const pageProps = (tipKey) => ({
    prices: ayarlar.prices, constants: ayarlar.constants, rates: ayarlar.rates, materials: ayarlar.materials,
    urunEkle: ayarlar.urunEkle, urunGuncelle: ayarlar.urunGuncelle,
    duzenlenen: duzenlenen?.urunTipi === tipKey ? duzenlenen : null,
    onDuzenlemeBitti: duzenlemeBitti,
    onTasarimaDon: tasarimaDon,
  });

  // Topbar yüksekliğini ölçüp CSS değişkenine yaz — sticky panel ofsetleri buna göre hizalanır
  const topbarRef = useRef(null);
  useLayoutEffect(() => {
    const el = topbarRef.current;
    if (!el) return;
    const uygula = () => document.documentElement.style.setProperty('--topbar-h', el.offsetHeight + 'px');
    uygula();
    const ro = new ResizeObserver(uygula);
    ro.observe(el);
    window.addEventListener('resize', uygula);
    return () => { ro.disconnect(); window.removeEventListener('resize', uygula); };
  }, []);

  return (
    <div className="app">
      <header className="topbar" ref={topbarRef}>
        <div className="brand">
          <span className="logo">◈</span>
          <div>
            <h1>Neon Maliyet</h1>
            <p>Ürün maliyeti & satış fiyatı hesaplama</p>
          </div>
        </div>
        <nav className="tabs">
          {SEKMELER.map((s) => (
            <button key={s.key} className={`tab ${sekme === s.key ? 'active' : ''}`} onClick={() => sekmeSec(s.key)}>
              <span className="tab-ikon">{s.ikon}</span>{s.ad}
            </button>
          ))}
        </nav>
      </header>

      <main className="content">
        {sekme === 'tasarla' && <TasarlaPage prices={ayarlar.prices} constants={ayarlar.constants} rates={ayarlar.rates} firma={ayarlar.firma} urunEkle={ayarlar.urunEkle} onInceAyar={tasarimiAktar} design={tasarimDesign} setDesign={setTasarimDesign} override={tasarimOverride} overrideTemizle={() => setTasarimOverride(null)} />}
        {sekme === 'tabela' && <NeonTabelaPage {...pageProps('tabela')} />}
        {sekme === 'sonsuzluk' && <SonsuzlukPage {...pageProps('sonsuzluk')} />}
        {sekme === 'masa' && <MasaPage {...pageProps('masa')} />}
        {sekme === 'avize' && <AvizePage {...pageProps('avize')} />}
        {sekme === 'urunler' && <UrunlerPage urunler={ayarlar.urunler} urunSil={ayarlar.urunSil} urunGuncelle={ayarlar.urunGuncelle} onDuzenle={onDuzenle} prices={ayarlar.prices} constants={ayarlar.constants} rates={ayarlar.rates} />}
        {sekme === 'ayarlar' && <SettingsPage ayarlar={ayarlar} />}
      </main>

      <footer className="foot">
        Kurlar: 1$ = {ayarlar.rates.usd}₺ · 1€ = {ayarlar.rates.eur}₺ · KDV ×{ayarlar.rates.kdv} · Kar ×{ayarlar.rates.karOrani}
        &nbsp;·&nbsp; Değerler tarayıcınızda kayıtlıdır.
      </footer>
    </div>
  );
}
