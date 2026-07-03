import React from 'react';
import { fmt } from './Controls.jsx';

// Maliyet dökümü + toplam maliyet + satış fiyatı paneli
export default function Result({ sonuc, karOrani, urunAdi }) {
  const gorunur = sonuc.items.filter((i) => Math.abs(i.val) > 0.001);
  return (
    <div className="result">
      <div className="result-head">
        <h3>Maliyet Dökümü</h3>
        <span className="muted">{urunAdi}</span>
      </div>
      <div className="result-lines">
        {gorunur.length === 0 && <p className="muted">Henüz maliyet oluşmadı — girişleri doldurun.</p>}
        {gorunur.map((i) => (
          <div className="line" key={i.ad}>
            <span>{i.ad}</span>
            <span className="line-val">{fmt(i.val)} ₺</span>
          </div>
        ))}
      </div>
      <div className="totals">
        <div className="total-row cost">
          <span>Toplam Maliyet</span>
          <span>{fmt(sonuc.toplam)} ₺</span>
        </div>
        <div className="total-row sale">
          <span>Satış Fiyatı <em>(× {karOrani} kar)</em></span>
          <span>{fmt(sonuc.satis)} ₺</span>
        </div>
      </div>
    </div>
  );
}
