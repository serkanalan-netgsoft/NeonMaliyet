// ============================================================================
//  Neon Tasarım → Maliyet köprüsü
//  Tasarım seçimlerini (kesim, askı, kumanda, mekan) Neon Tabela motorunun
//  girdilerine ve ek maliyet kalemlerine çevirir. Fiyatlar bizim motordan.
// ============================================================================
import { defaultInputs as tabelaDefaults } from './neonTabela.js';

function bosYuzey() {
  const y = {};
  Object.keys(tabelaDefaults.yuzey).forEach((k) => (y[k] = 0));
  return y;
}

// olcum: { satirGenislikleriCm, harfYuksekligiCm, yukseklikCm, harfSayisi }
export function tasarimGirdi(design, olcum, C) {
  const genislikler = olcum.satirGenislikleriCm.length ? olcum.satirGenislikleriCm : [0];
  const maxGenislikCm = Math.max(0, ...genislikler);
  const toplamGenislikCm = genislikler.reduce((a, b) => a + b, 0);
  const satirSayisi = genislikler.length;
  const toplamYukseklikCm = olcum.yukseklikCm != null ? olcum.yukseklikCm : satirSayisi * olcum.harfYuksekligiCm * C.tasarimSatirAralik;

  const ledCmAuto = Math.round(toplamGenislikCm * C.tasarimYogunluk);
  const manuel = design.ledCmManuel;
  const ledCm = (manuel != null && manuel !== '' && !Number.isNaN(Number(manuel))) ? Number(manuel) : ledCmAuto;

  const enM = +((maxGenislikCm / 100) + C.tasarimZeminPay * 2).toFixed(3);
  const boyM = +((toplamYukseklikCm / 100) + C.tasarimZeminPay * 2).toFixed(3);

  // --- Kesim tipi → ürün tipi / mekan ---
  let urunTipi = 'tabela';
  let disMekan = design.disMekan ? 1 : 0;
  if (design.kesim === 'kutu') { urunTipi = 'pleksiKutu'; disMekan = 1; } // su geçirmez kutu

  // --- Askı seçeneği → montaj ---
  const montajStandart = design.aski === 'vida' ? 1 : 0;
  const celikAski = design.aski === 'tavan' ? 1 : 0;

  // --- Kumanda ---
  const rgb = design.ledTipi === 'rgb';
  const kAcik = design.kumandaVar;

  const yuzey = bosYuzey();
  yuzey[design.pleksi] = 1;

  const inputs = {
    ...tabelaDefaults,
    urunTipi,
    disMekan,
    harfAdet: olcum.harfSayisi,
    cizgiAdet: 0,
    ledPvc: rgb ? 0 : ledCm,
    ledRgb: rgb ? ledCm : 0,
    ledFuji: 0, ledNorm: 0, ledPixel: 0,
    en: enM, boy: boyM,
    yuzey,
    baskiUv: 0, baskiFolyo: 0,
    cerceve: { altin: 0, gumus: 0, siyah: 0, beyaz: 0 },
    kumanda: { tus11: kAcik && !rgb ? 1 : 0, rgb: kAcik && rgb ? 1 : 0, pixel: 0 },
    adaptorDis: disMekan,
    montajStandart,
    celikAski,
    paketVar: 1, kartonPanel: 1, petekPanel: 0,
  };

  // --- Motorda doğrudan olmayan seçenekler → ek maliyet kalemleri (malzeme fiyatlarımızdan) ---
  const ekler = [];
  if (design.kesim === 'masaustu') ekler.push({ tip: 'malzeme', malzemeKey: 'pleksiSeffaf38', miktar: 0.25, ad: 'Masa Üstü Stand' });
  if (design.aski === 'yukseltme') ekler.push({ tip: 'malzeme', malzemeKey: 'yukseltmeVida', miktar: 4, ad: 'Yükseltme Vidası (4 adet)' });
  if (design.aski === 'bant') ekler.push({ tip: 'elle', birimFiyat: 15, miktar: 1, ad: 'Montaj Bandı' });

  return { inputs, ekler, ledCm, ledCmAuto, enM, boyM, maxGenislikCm, toplamYukseklikCm, satirSayisi };
}
