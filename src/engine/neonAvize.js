// ============================================================================
//  NEON AVİZE hesaplayıcısı  (Excel "NA" sayfası)
//
//  NOT: Orijinal Excel'de avize çap SEÇİMİ ile FİYAT listesi ters eşlenmişti
//  (ör. "80cm" seçilince 160cm avize fiyatı hesaplanıyordu). Bu hata burada
//  DÜZELTİLDİ — her çap artık kendi fiyatıyla eşleşir. Bu nedenle avize
//  maliyet kalemi bilinçli olarak Excel'den farklıdır (doğru olan budur).
// ============================================================================
import { derived, icAdapter, disAdapter, kumandaTutar, round0 } from './helpers.js';

// Seçim etiketleri (küçükten büyüğe)
export const AVIZE_CAPLAR = ['60cm', '80cm', '90cm', '100cm', '120cm', '130cm', '150cm', '160cm', '190cm'];
// Doğru fiyat eşlemesi: her çap kendi fiyatına bağlı
const avizeFiyatKeys = ['avize60', 'avize80', 'avize90', 'avize100', 'avize120', 'avize130', 'avize150', 'avize160', 'avize180'];

export const defaultInputs = {
  disMekan: 0,
  harfAdet: 10, cizgiAdet: 5,
  ledPvc: 250, ledRgb: 150, ledFuji: 0, ledNorm: 0, ledPixel: 100,
  en: 1, boy: 0.3,                        // U18/V18 (üst yüzey; boy = ürün yüksekliği)
  yuzey: { seffaf38: 0, seffaf58: 1, siyah38: 0, siyah58: 0, beyaz38: 0, beyaz58: 0,
           renkli38: 0, renkli58: 0, gumusAyna: 0, dekota45: 0, dekota10: 0, dekota18: 0,
           camAyna: 0, dalgaliAyna: 0, canvas: 0 },
  baskiUv: 1, baskiFolyo: 0, baskiEn: 0.2, baskiBoy: 0.3,
  avizeCap: '80cm',                       // AVIZE_CAPLAR içinden
  kumanda: { tus11: 0, rgb: 1, pixel: 0 },
  adaptorDis: 0,
  paketVar: 1, kartonPanel: 0, petekPanel: 1,
};

export function hesapla(inp, P, C, rates) {
  const D = derived(P);
  const idx = AVIZE_CAPLAR.indexOf(inp.avizeCap);
  const sel = AVIZE_CAPLAR.map((_, i) => (i === idx ? 1 : 0)); // V42-V50

  // Üst yüzey amperi
  const amperNeon = (inp.ledPvc + inp.ledFuji + inp.ledNorm) / C.amperBolen; // S4
  const amperRgb = inp.ledRgb / C.amperBolen * C.amperRgb;                   // S5
  const amperPix = inp.ledPixel / C.amperBolen * C.amperPixel;              // S6
  const amperToplam = amperNeon + amperRgb + amperPix;                     // S7

  const X15 = inp.en * inp.boy;

  // Ürün ölçü (S9/S10 = seçilen çap; S11 = boy)
  const urunCap = C.avizeCap.reduce((s, cap, i) => s + cap * sel[i], 0);
  const urunEn = urunCap, urunBoy = urunCap, urunYuk = inp.boy;
  const paketEn = urunCap + C.avizePaketEn;
  const paketBoy = urunCap + C.avizePaketBoy;
  const paketYuk = inp.boy + C.avizePaketYuk;
  const paketM2 = ((paketYuk * paketEn) + (paketYuk * paketBoy) + (paketEn * paketBoy)) * 2;

  const y = inp.yuzey, en = inp.en, boy = inp.boy;
  const items = [];
  const add = (ad, val) => items.push({ ad, val });

  // 1- Led İşçilik (S25)
  add('1- Led Tabela İşçilik', inp.harfAdet * P.neonHarfIscilik + inp.cizgiAdet * P.neonCizgiIscilik);
  // 2- Led Neon (S26)
  add('2- Led Neon Tutarı', D.pvcCm * inp.ledPvc + D.rgbCm * inp.ledRgb + D.fujiCm * inp.ledFuji + D.normCm * inp.ledNorm + D.pixelCm * inp.ledPixel);
  // 3- Kesimsiz Yüzey (S27) — NA sürümü: gümüş ayna I66'yı iki kez ekler
  const pleksiKismi = (
    (X15 * P.pleksiSeffaf38) * y.seffaf38 + (X15 * P.pleksiSeffaf48) * y.seffaf58 +
    (X15 * P.pleksiSiyah38) * y.siyah38 + (X15 * P.pleksiSiyah58) * y.siyah58 +
    (X15 * P.pleksiBeyaz38) * y.beyaz38 + (X15 * P.pleksiBeyaz58) * y.beyaz58 +
    (X15 * P.pleksiRenkli38) * y.renkli38 + (X15 * P.pleksiRenkli58) * y.renkli58 +
    ((X15 * P.pleksiGumusAyna) + (X15 * P.pleksiSeffaf18) + (X15 * P.pleksiSeffaf18)) * y.gumusAyna +
    (X15 * P.dekota45) * y.dekota45 + (X15 * P.dekota10) * y.dekota10 + (X15 * P.dekota18) * y.dekota18
  ) * C.fireOrani;
  let canvasFrame = 0;
  if (en + boy !== 0) {
    if (en < boy) canvasFrame = (en * P.canvasMdfM) * round0(boy);
    else if (boy < en) canvasFrame = (boy * P.canvasMdfM) * round0(en);
  }
  const yuzeyEk = ((boy + C.aynaBoyPay) * (en + C.aynaEnPay)) * P.ayna * y.camAyna
    + ((boy + C.dalgaliBoyPay) * (en + C.dalgaliEnPay)) * P.dalgaliAyna * y.dalgaliAyna
    + y.canvas * (P.canvasM2 * (en * boy) + canvasFrame + ((boy + en) * 2) * P.canvasMdfM);
  add('3- Kesimsiz Yüzey Tutarı', pleksiKismi + yuzeyEk);
  // 4- Lehim (S28)
  add('4- Lehim Tutarı', (P.lehimTeli500 / C.lehimRulo) * C.lehimHarf * inp.harfAdet + (P.lehimTeli500 / C.lehimRulo) * C.lehimCizgi * inp.cizgiAdet);
  // 7- Baskı (S29)
  add('7- Baskı', inp.baskiUv * (P.uvBaski * inp.baskiEn * inp.baskiBoy) + inp.baskiFolyo * (P.folyoBaski * inp.baskiEn * inp.baskiBoy));
  // 25- Metal Avize (S30) — düzeltilmiş doğru fiyat eşlemesi
  add('25- Metal Avize', avizeFiyatKeys.reduce((s, key, i) => s + P[key] * sel[i], 0));
  // 26- Çelik Askı (S31)
  add('26- Çelik Askı Aparatı', P.celikAski);
  // 27- Şeffaf Pleksi Kapak (S32)
  add('27- Şeffaf Pleksi Kapak', C.avizePleksiKapak * P.pleksiSeffaf18);
  // 28- Lazer Kesim (S33)
  add('28- Lazer Kesim 6dk', C.lazerSure * P.lazerKesimSaat / C.lazerDk);
  // 29- Dış Mekan Silikon (S34)
  add('29- Dış Mekan Silikon Yalıtım', ((P.sistaSeffafSilikonMl * inp.harfAdet * C.lehimHarf) + (inp.cizgiAdet * C.lehimCizgi * P.sistaSeffafSilikonMl)) * inp.disMekan);
  // 30- Yapıştırıcı (S35)
  add('30- Yapıştırıcı', P.neonYapistirici * C.yapistiriciOran);
  // 31- Bağlantı Kabloları (S36)
  add('31- Bağlantı Kabloları', P.seffafKabloM * C.kabloOnAvize + P.beyazKabloM * C.kabloArkaAvize);
  // 32- 220V Fişli Kablo (S37)
  add('32- 220V Fişli Kablo', P.elektrikKabloM * C.fisliKablo + P.fisSoketi);
  // 33- Adaptör (S38)
  add('33- Adaptör (Trafo)', disAdapter(amperToplam, P, C) * (inp.adaptorDis ? 1 : 0) + icAdapter(amperToplam, P, C) * (inp.adaptorDis ? 0 : 1));
  // 34- Uzaktan Kumanda (S39)
  add('34- Uzaktan Kumanda', kumandaTutar({ neon: amperNeon, rgb: amperRgb, pixel: amperPix }, inp.kumanda, P, C));
  // 38- Kilitli Poşet (S40)
  add('38- Kilitli Poşet', P.kilitliPoset);
  // 39- Kargo Kutusu (S41)
  add('39- Kargo Kutusu', ((paketM2 * (((P.kartonPanelM2 * C.kartonFire) * inp.kartonPanel) + ((P.petekPanelM2 * C.petekFire) * inp.petekPanel) + (P.balonluNaylonM * C.patPatKat))) + (((paketEn + paketBoy + paketYuk) * 3) * P.koliBantM) + (paketM2 * P.kargoSunger)) * inp.paketVar);

  const toplam = items.reduce((s, i) => s + i.val, 0);
  const satis = toplam * rates.karOrani;
  return { items, toplam, satis, ara: { amperToplam, paketM2 } };
}

export default { defaultInputs, hesapla };
