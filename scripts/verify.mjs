import { defaultRates, defaultConstants, computePrices } from '../src/data/pricing.js';
import * as N from '../src/engine/neonTabela.js';
import * as NSA from '../src/engine/sonsuzluk.js';
import * as NM from '../src/engine/neonMasa.js';
import * as NA from '../src/engine/neonAvize.js';

const P = computePrices(defaultRates);
const C = defaultConstants;
let genelOk = true;

function suite(ad, r, expToplam, expSatis, expItems) {
  console.log(`\n===== ${ad} =====`);
  let ok = true;
  for (const it of r.items) {
    if (it.ad in expItems) {
      const good = Math.abs(it.val - expItems[it.ad]) < 0.06;
      if (!good) { console.log(`  ❌ ${it.ad.padEnd(32)} bek=${expItems[it.ad]}  bul=${it.val.toFixed(2)}`); ok = false; }
    }
  }
  const tOk = Math.abs(r.toplam - expToplam) < 0.1;
  const sOk = Math.abs(r.satis - expSatis) < 0.2;
  console.log(`  ${tOk ? '✅' : '❌'} TOPLAM MALİYET  bek=${expToplam}  bul=${r.toplam.toFixed(2)}`);
  console.log(`  ${sOk ? '✅' : '❌'} SATIŞ TUTARI    bek=${expSatis}  bul=${r.satis.toFixed(2)}`);
  ok = ok && tOk && sOk;
  console.log(ok ? `  🎉 ${ad} birebir doğrulandı` : `  ⚠️  ${ad} FARK VAR`);
  genelOk = genelOk && ok;
}

suite('NEON TABELA', N.hesapla(N.defaultInputs, P, C, defaultRates), 2439.44, 4878.87, {
  '1- Led Tabela İşçilik': 799.5, '2- Led Neon Tutarı': 725.7, '3- Kesimsiz Yüzey Tutarı': 465.27,
  '4- Lehim Tutarı': 20.66, '7- Baskı': 14.76, '28- Lazer Kesim 6dk': 72, '30- Yapıştırıcı': 20.66,
  '31- Bağlantı Kabloları': 34.06, '32- 220V Fişli Kablo': 51.6, '33- Adaptör (Trafo)': 123,
  '35- Standart Montaj Paketi': 26.57, '38- Kilitli Poşet': 0.36, '39- Kargo Kutusu': 85.29,
});

suite('SONSUZLUK AYNASI', NSA.hesapla(NSA.defaultInputs, P, C, defaultRates), 9193.97, 18387.93, {
  '3- Kesimsiz Yüzey Tutarı': 775.44, '9- Sonsuzluk Aynası İşçilik': 1230, '10- Sonsuzluk Aynası Led': 442.8,
  '11- Sonsuzluk Aynası MDF Kasası': 3000, '12- Sonsuzluk İç Kenarlar Desen Yüzeyi': 284.54,
  '13- Sonsuzluk Aynası Ayna': 840, '14- Sonsuzluk Ayna Silikonlama': 103.32, '15- Sonsuzluk Ayna Delik Maliyeti': 36.9,
  '16- Sonsuzluk Aynası Cam': 717.34, '17- Sonsuzluk Cam Silikonlama': 73.8, '18- Sonsuzluk Cam Filmi': 369.6,
  '33- Adaptör (Trafo)': 123, '34- Uzaktan Kumanda': 578.1, '37- Sonsuzluk Aynası Montaj Paketi': 124.7,
  '39- Kargo Kutusu': 270.24,
});

suite('NEON MASA', NM.hesapla(NM.defaultInputs, P, C, defaultRates), 21108.2, 42216.41, {
  '7- Baskı': 295.2, '19- Masa İşçilik': 615, '20- Masa Led': 7380, '21- Masa MDF Kasası': 759,
  '22- Masa Cam': 6494.4, '23- Masa Cam Füme': 1320, '24- Masa Pleksi Zemin': 565.8, '25- Masa Pleksi Çubuk': 452.64,
  '33- Adaptör (Trafo)': 393.6, '39- Kargo Kutusu': 623.83,
});

// NEON AVİZE: avize fiyat eşlemesi Excel'deki hatadan DÜZELTİLDİ.
// 80cm → avize80 = 5805.60 (Excel'in hatalı 7822.80'i yerine). Toplam bu yüzden Excel'den farklı.
suite('NEON AVİZE (avize fiyatı düzeltildi)', NA.hesapla(NA.defaultInputs, P, C, defaultRates), 9323.0, 18646.0, {
  '7- Baskı': 14.76, '25- Metal Avize': 5805.6, '26- Çelik Askı Aparatı': 409.84, '27- Şeffaf Pleksi Kapak': 15.88,
  '31- Bağlantı Kabloları': 94.61, '33- Adaptör (Trafo)': 123, '34- Uzaktan Kumanda': 135.3, '39- Kargo Kutusu': 568.26,
});

console.log('\n' + (genelOk ? '════════ ✅ TÜM ÜRÜNLER EXCEL İLE BİREBİR DOĞRULANDI ════════' : '════════ ⚠️  BAZI FARKLAR VAR ════════'));
process.exit(genelOk ? 0 : 1);
