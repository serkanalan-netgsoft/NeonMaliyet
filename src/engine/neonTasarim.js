// ============================================================================
//  Neon Tasarım → Maliyet köprüsü
//  Ölçülen metin (satır genişlikleri, harf yüksekliği, harf sayısı) ve tasarım
//  seçimlerinden Neon Tabela motoru için girdi üretir.
// ============================================================================
import { defaultInputs as tabelaDefaults } from './neonTabela.js';

// Boş yüzey nesnesi
function bosYuzey() {
  const y = {};
  Object.keys(tabelaDefaults.yuzey).forEach((k) => (y[k] = 0));
  return y;
}

// olcum: { satirGenislikleriCm: number[], harfYuksekligiCm, harfSayisi }
export function tasarimGirdi(design, olcum, C) {
  const genislikler = olcum.satirGenislikleriCm.length ? olcum.satirGenislikleriCm : [0];
  const maxGenislikCm = Math.max(0, ...genislikler);
  const toplamGenislikCm = genislikler.reduce((a, b) => a + b, 0);
  const satirSayisi = genislikler.length;
  const toplamYukseklikCm = olcum.yukseklikCm != null
    ? olcum.yukseklikCm
    : satirSayisi * olcum.harfYuksekligiCm * C.tasarimSatirAralik;

  // LED uzunluğu (cm): otomatik = toplam metin genişliği × yoğunluk; manuel override öncelikli
  const ledCmAuto = Math.round(toplamGenislikCm * C.tasarimYogunluk);
  const manuel = design.ledCmManuel;
  const ledCm = (manuel != null && manuel !== '' && !Number.isNaN(Number(manuel))) ? Number(manuel) : ledCmAuto;

  const enM = +((maxGenislikCm / 100) + C.tasarimZeminPay * 2).toFixed(3);
  const boyM = +((toplamYukseklikCm / 100) + C.tasarimZeminPay * 2).toFixed(3);

  const yuzey = bosYuzey();
  yuzey[design.pleksi] = 1;

  const rgb = design.ledTipi === 'rgb';
  const inputs = {
    ...tabelaDefaults,
    urunTipi: 'tabela',
    disMekan: design.disMekan ? 1 : 0,
    harfAdet: olcum.harfSayisi,      // işçilik & lehim için harf sayısı
    cizgiAdet: 0,
    ledPvc: rgb ? 0 : ledCm,
    ledRgb: rgb ? ledCm : 0,
    ledFuji: 0, ledNorm: 0, ledPixel: 0,
    en: enM, boy: boyM,
    yuzey,
    baskiUv: 0, baskiFolyo: 0,
    cerceve: { altin: 0, gumus: 0, siyah: 0, beyaz: 0 },
    kumanda: { tus11: rgb ? 0 : 1, rgb: rgb ? 1 : 0, pixel: 0 },
    adaptorDis: design.disMekan ? 1 : 0,
    montajStandart: 1, celikAski: 0,
    paketVar: 1, kartonPanel: 1, petekPanel: 0,
  };

  return { inputs, ledCm, ledCmAuto, enM, boyM, maxGenislikCm, toplamYukseklikCm, satirSayisi };
}
