import React, { useState } from 'react';
import { useAyarlar } from './store.js';
import NeonTabelaPage from './pages/NeonTabelaPage.jsx';
import SonsuzlukPage from './pages/SonsuzlukPage.jsx';
import MasaPage from './pages/MasaPage.jsx';
import AvizePage from './pages/AvizePage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';

const SEKMELER = [
  { key: 'tabela', ad: 'Neon Tabela', ikon: '🪧' },
  { key: 'sonsuzluk', ad: 'Sonsuzluk Aynası', ikon: '🪞' },
  { key: 'masa', ad: 'Neon Masa', ikon: '🟦' },
  { key: 'avize', ad: 'Neon Avize', ikon: '💡' },
  { key: 'ayarlar', ad: 'Ayarlar', ikon: '⚙️' },
];

export default function App() {
  const [sekme, setSekme] = useState('tabela');
  const ayarlar = useAyarlar();
  const ortak = { prices: ayarlar.prices, constants: ayarlar.constants, rates: ayarlar.rates };

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <span className="logo">◈</span>
          <div>
            <h1>Neon Maliyet</h1>
            <p>Ürün maliyeti & satış fiyatı hesaplama</p>
          </div>
        </div>
        <nav className="tabs">
          {SEKMELER.map((s) => (
            <button key={s.key} className={`tab ${sekme === s.key ? 'active' : ''}`} onClick={() => setSekme(s.key)}>
              <span className="tab-ikon">{s.ikon}</span>{s.ad}
            </button>
          ))}
        </nav>
      </header>

      <main className="content">
        {sekme === 'tabela' && <NeonTabelaPage {...ortak} />}
        {sekme === 'sonsuzluk' && <SonsuzlukPage {...ortak} />}
        {sekme === 'masa' && <MasaPage {...ortak} />}
        {sekme === 'avize' && <AvizePage {...ortak} />}
        {sekme === 'ayarlar' && <SettingsPage ayarlar={ayarlar} />}
      </main>

      <footer className="foot">
        Kurlar: 1$ = {ayarlar.rates.usd}₺ · 1€ = {ayarlar.rates.eur}₺ · KDV ×{ayarlar.rates.kdv} · Kar ×{ayarlar.rates.karOrani}
        &nbsp;·&nbsp; Değerler tarayıcınızda kayıtlıdır.
      </footer>
    </div>
  );
}
