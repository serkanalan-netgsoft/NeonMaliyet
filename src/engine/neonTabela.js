// ============================================================================
//  NEON TABELA hesaplayıcısı  (Excel "N" sayfası)
//  5 alt tip: Tabela, Open Box, Pleksi Kutu, Tablo, Selfie Aynası
// ============================================================================
import { derived, adaptorTutar, kumandaTutar, round0 } from './helpers.js';

// Excel örnek değerleriyle birebir varsayılan girişler (doğrulama için)
export const defaultInputs = {
  urunTipi: 'tabela',        // tabela | openBox | pleksiKutu | tablo | selfie
  disMekan: 0,               // 0=iç, 1=dış (V6)
  harfAdet: 10,              // U9
  cizgiAdet: 5,              // V9
  // LED cm (V11-V15)
  ledPvc: 250, ledRgb: 150, ledFuji: 0, ledNorm: 0, ledPixel: 100,
  en: 1, boy: 0.3,           // U18 / V18 (metre)
  // Yüzey seçimi (V20-V34) — 0/1
  yuzey: {
    seffaf38: 0, seffaf58: 1, siyah38: 0, siyah58: 0, beyaz38: 0, beyaz58: 0,
    renkli38: 0, renkli58: 0, gumusAyna: 0, dekota45: 0, dekota10: 0, dekota18: 0,
    camAyna: 0, dalgaliAyna: 0, canvas: 0,
  },
  baskiUv: 1, baskiFolyo: 0, // V36/V37
  baskiEn: 0.2, baskiBoy: 0.3, // U39/V39
  cerceve: { altin: 1, gumus: 0, siyah: 0, beyaz: 0 }, // V41-V44
  kumanda: { tus11: 0, rgb: 0, pixel: 0 }, // V48-V50
  adaptorDis: 0,             // V53 (1 ise dış, aksi iç). İç = V52
  montajStandart: 1,         // V56
  celikAski: 0,              // V57
  paketVar: 1,               // V60
  kartonPanel: 1, petekPanel: 0, // V61/V62
};

const TIPLER = ['tabela', 'openBox', 'pleksiKutu', 'tablo', 'selfie'];

export function hesapla(inp, P, C, rates) {
  const D = derived(P);
  const t = TIPLER.map((k) => (inp.urunTipi === k ? 1 : 0)); // [tabela,openBox,pleksiKutu,tablo,selfie]
  const [tabela, openBox, pleksiKutu, tablo, selfie] = t;
  const en = inp.en, boy = inp.boy;

  // --- Ara hesaplar ---
  const kesilenM2 = en * boy;                                          // S12
  const amperNeon = (inp.ledPvc + inp.ledFuji + inp.ledNorm) / C.amperBolen; // S14
  const amperRgb = inp.ledRgb / C.amperBolen * C.amperRgb;             // S15
  const amperPixel = inp.ledPixel / C.amperBolen * C.amperPixel;       // S16
  const amperToplam = amperNeon + amperRgb + amperPixel;              // S17

  // Ürün ölçüleri (S19-S21)
  const urunEn  = en * tabela + en * openBox + en * pleksiKutu + (en + C.tabloEnPay) * tablo + en * selfie;
  const urunBoy = boy * tabela + boy * openBox + boy * pleksiKutu + (boy + C.tabloBoyPay) * tablo + boy * selfie;
  const urunYuk = C.yukseklik[0] * tabela + C.yukseklik[1] * openBox + C.yukseklik[2] * pleksiKutu
                + C.yukseklik[3] * tablo + C.yukseklik[4] * selfie;
  // Paket kutu (S22-S24)
  const pk = C.paket;
  const paketEn  = (urunEn + pk.tabela[0]) * tabela + (urunEn + pk.openBox[0]) * openBox
                 + (urunEn + pk.pleksiKutu[0]) * pleksiKutu + (urunEn + pk.tablo[0]) * tablo + (urunEn + pk.selfie[0]) * selfie;
  const paketBoy = (urunBoy + pk.tabela[1]) * tabela + (urunBoy + pk.openBox[1]) * openBox
                 + (urunBoy + pk.pleksiKutu[1]) * pleksiKutu + (urunBoy + pk.tablo[1]) * tablo + (urunBoy + pk.selfie[1]) * selfie;
  const paketYuk = (urunYuk + pk.tabela[2]) * tabela + (urunYuk + pk.openBox[2]) * openBox
                 + (urunYuk + pk.pleksiKutu[2]) * pleksiKutu + (urunYuk + pk.tablo[2]) * tablo + (urunYuk + pk.selfie[2]) * selfie;
  const paketM2 = ((paketYuk * paketEn) + (paketYuk * paketBoy) + (paketEn * paketBoy)) * 2; // S25

  const y = inp.yuzey;
  const S = kesilenM2;

  // --- Maliyet kalemleri ---
  const items = [];
  const add = (ad, val) => items.push({ ad, val });

  // 1- Led Tabela İşçilik (S35)
  add('1- Led Tabela İşçilik', inp.harfAdet * P.neonHarfIscilik + inp.cizgiAdet * P.neonCizgiIscilik);
  // 2- Led Neon Tutarı (S36)
  add('2- Led Neon Tutarı', D.pvcCm * inp.ledPvc + D.rgbCm * inp.ledRgb + D.fujiCm * inp.ledFuji + D.normCm * inp.ledNorm + D.pixelCm * inp.ledPixel);
  // 3- Kesimsiz Yüzey Tutarı (S37)
  const pleksiKismi = (
    (S * P.pleksiSeffaf38) * y.seffaf38 + (S * P.pleksiSeffaf48) * y.seffaf58 +
    (S * P.pleksiSiyah38) * y.siyah38 + (S * P.pleksiSiyah58) * y.siyah58 +
    (S * P.pleksiBeyaz38) * y.beyaz38 + (S * P.pleksiBeyaz58) * y.beyaz58 +
    (S * P.pleksiRenkli38) * y.renkli38 + (S * P.pleksiRenkli58) * y.renkli58 +
    ((S * P.pleksiGumusAyna) + (S * P.pleksiSeffaf18)) * y.gumusAyna +
    (S * P.dekota45) * y.dekota45 + (S * P.dekota10) * y.dekota10 + (S * P.dekota18) * y.dekota18
  ) * C.fireOrani;
  const camAynaKismi = ((boy + C.aynaBoyPay) * (en + C.aynaEnPay)) * P.ayna * y.camAyna;
  const dalgaliKismi = ((boy + C.dalgaliBoyPay) * (en + C.dalgaliEnPay)) * P.dalgaliAyna * y.dalgaliAyna;
  let canvasFrame = 0;
  if (en + boy !== 0) {
    if (en < boy) canvasFrame = (en * P.canvasMdfM) * round0(boy);
    else if (boy < en) canvasFrame = (boy * P.canvasMdfM) * round0(en);
  }
  const canvasKismi = y.canvas * (P.canvasM2 * (en * boy) + canvasFrame + ((boy + en) * 2) * P.canvasMdfM);
  add('3- Kesimsiz Yüzey Tutarı', pleksiKismi + camAynaKismi + dalgaliKismi + canvasKismi);
  // 4- Lehim Tutarı (S38)
  add('4- Lehim Tutarı', (P.lehimTeli500 / C.lehimRulo) * C.lehimHarf * inp.harfAdet + (P.lehimTeli500 / C.lehimRulo) * C.lehimCizgi * inp.cizgiAdet);
  // 5- Open Box (S39)
  add('5- Open Box', (((en * boy) * ((P.pleksiSeffaf38 * y.seffaf38) + (P.pleksiSeffaf48 * y.seffaf58))) * C.fireOrani + P.yukseltmeVida * C.openBoxVida) * openBox);
  // 6- Pleksi Kutu (S40)
  add('6- Pleksi Kutu', (((en * boy) + (en * C.pleksiKutuYuk) * 2 + (boy * C.pleksiKutuYuk) * 2) * ((P.pleksiSeffaf38 * y.seffaf38) + (P.pleksiSeffaf48 * y.seffaf58))) * pleksiKutu * C.fireOrani);
  // 7- Baskı (S41)
  add('7- Baskı', inp.baskiUv * (P.uvBaski * inp.baskiEn * inp.baskiBoy) + inp.baskiFolyo * (P.folyoBaski * inp.baskiEn * inp.baskiBoy));
  // 8- Çerçeve (S42)
  const c = inp.cerceve;
  add('8- Çerçeve', ((c.altin * P.cerceveAltin + c.gumus * P.cerceveGumus + c.siyah * P.cerceveSiyah + c.beyaz * P.cerceveBeyaz) * ((en + C.cerceveEnFire) * 2 + (boy + C.cerceveBoyFire) * 2)) * tablo);
  // 28- Lazer Kesim (S43)
  add('28- Lazer Kesim 6dk', (C.lazerSure * P.lazerKesimSaat / C.lazerDk) * (tabela + openBox + pleksiKutu));
  // 29- Dış Mekan Silikon Yalıtım (S44)
  add('29- Dış Mekan Silikon Yalıtım', ((P.sistaSeffafSilikonMl * inp.harfAdet * C.lehimHarf) + (inp.cizgiAdet * C.lehimCizgi * P.sistaSeffafSilikonMl)) * inp.disMekan);
  // 30- Yapıştırıcı (S45)
  add('30- Yapıştırıcı', P.neonYapistirici * C.yapistiriciOran);
  // 31- Bağlantı Kabloları (S46)
  const urunTop = tabela + openBox + pleksiKutu + tablo + selfie;
  add('31- Bağlantı Kabloları', (P.seffafKabloM * C.kabloOnTabela + P.beyazKabloM * C.kabloArkaTabela) * urunTop);
  // 32- 220V-Adaptör Fişli Kablo (S47)
  add('32- 220V Fişli Kablo', P.elektrikKabloM * C.fisliKablo + P.fisSoketi);
  // 33- Adaptör (Trafo) (S48)
  add('33- Adaptör (Trafo)', adaptorTutar(amperToplam, inp.adaptorDis ? 0 : 1, inp.adaptorDis ? 1 : 0, P, C));
  // 34- Uzaktan Kumanda (S49)
  add('34- Uzaktan Kumanda', kumandaTutar({ neon: amperNeon, rgb: amperRgb, pixel: amperPixel }, inp.kumanda, P, C));
  // 35- Standart Montaj Paketi (S50)
  add('35- Standart Montaj Paketi', ((P.beyazDubel * 4) + (P.meridyenVida * 4) + (P.nikelajVida * 4) + P.kilitliPoset) * inp.montajStandart);
  // 36- Çelik Askı Aparatı (S51)
  add('36- Çelik Askı Aparatı', P.celikAski * inp.celikAski);
  // 38- Kilitli Poşet (S52)
  add('38- Kilitli Poşet', P.kilitliPoset);
  // 39- Kargo Kutusu (S53)
  add('39- Kargo Kutusu', ((paketM2 * (((P.kartonPanelM2 * C.kartonFire) * inp.kartonPanel) + ((P.petekPanelM2 * C.petekFire) * inp.petekPanel) + (P.balonluNaylonM * C.patPatKat))) + (((paketEn + paketBoy + paketYuk) * 3) * P.koliBantM) + (paketM2 * P.kargoSunger)) * inp.paketVar);

  const toplam = items.reduce((s, i) => s + i.val, 0);
  const satis = toplam * rates.karOrani;
  return { items, toplam, satis, ara: { amperNeon, amperRgb, amperPixel, amperToplam, paketM2, urunEn, urunBoy, urunYuk } };
}

export default { defaultInputs, hesapla };
