// ============================================================================
//  NEON MASA hesaplayıcısı  (Excel "NM" sayfası)
// ============================================================================
import { derived, icAdapter, disAdapter, kumandaTutar, round0 } from './helpers.js';

export const defaultInputs = {
  disMekan: 0,
  harfAdet: 10, cizgiAdet: 5,
  ledPvc: 250, ledRgb: 150, ledFuji: 0, ledNorm: 0, ledPixel: 100,
  en: 1, boy: 0.3,                        // U18/V18 (üst yüzey kesim)
  yuzey: { seffaf38: 0, seffaf58: 1, siyah38: 0, siyah58: 0, beyaz38: 0, beyaz58: 0,
           renkli38: 0, renkli58: 0, gumusAyna: 0, dekota45: 0, dekota10: 0, dekota18: 0,
           camAyna: 0, dalgaliAyna: 0, canvas: 0 },
  baskiUv: 1, baskiFolyo: 0, baskiEn: 4, baskiBoy: 0.3,
  cerceve: { altin: 0, gumus: 0, siyah: 0, beyaz: 0 },
  // Masa'ya özel
  camTipi: 'fume',                        // normal | fume  (V48/V49)
  masaLed: 'rgb',                         // pvc | rgb | pixel (V51/V52/V53)
  mEn: 1, mBoy: 0.5, mYuk: 0.5,           // U55/V55/U57
  cubukSayisi: 10,                        // V57
  kumanda: { tus11: 0, rgb: 0, pixel: 0 },
  adaptorDis: 0,
  paketVar: 1, kartonPanel: 0, petekPanel: 1,
};

export function hesapla(inp, P, C, rates) {
  const D = derived(P);
  const normalCam = inp.camTipi === 'normal' ? 1 : 0;  // V48
  const fumeCam = inp.camTipi === 'fume' ? 1 : 0;       // V49
  const lPvc = inp.masaLed === 'pvc' ? 1 : 0;           // V51
  const lRgb = inp.masaLed === 'rgb' ? 1 : 0;           // V52
  const lPix = inp.masaLed === 'pixel' ? 1 : 0;         // V53
  const En = inp.mEn, Boy = inp.mBoy, Yuk = inp.mYuk, Cubuk = inp.cubukSayisi;

  // Masa led amperi (X47/X49/X51) = (çubuk × 100cm × 3sıra)/100 × amper × ledSeçim
  const masaLedAmper = (kat, sel) => ((Cubuk * C.masaCubukLed * C.masaCubukSira) / C.amperBolen * kat) * sel;
  const X47 = masaLedAmper(C.amperNeon, lPvc);
  const X49 = masaLedAmper(C.amperRgb, lRgb);
  const X51 = masaLedAmper(C.amperPixel, lPix);

  // Üst yüzey amperi
  const X5 = (inp.ledPvc + inp.ledFuji + inp.ledNorm) / C.amperBolen;
  const X7 = inp.ledRgb / C.amperBolen * C.amperRgb;
  const X9 = inp.ledPixel / C.amperBolen * C.amperPixel;

  const amperNeon = X5 + X47;   // S4
  const amperRgb = X7 + X49;    // S5
  const amperPix = X9 + X51;    // S6
  const amperToplam = amperNeon + amperRgb + amperPix; // S7

  const X15 = inp.en * inp.boy;

  // Ürün ölçü & paket
  const urunEn = En, urunBoy = Boy, urunYuk = Yuk;
  const paketEn = urunEn + C.paket.masa[0];
  const paketBoy = urunBoy + C.paket.masa[1];
  const paketYuk = urunYuk + C.paket.masa[2];
  const paketM2 = ((paketYuk * paketEn) + (paketYuk * paketBoy) + (paketEn * paketBoy)) * 2;

  const y = inp.yuzey, en = inp.en, boy = inp.boy;
  const items = [];
  const add = (ad, val) => items.push({ ad, val });

  // 1- Led İşçilik (S25)
  add('1- Led Tabela İşçilik', inp.harfAdet * P.neonHarfIscilik + inp.cizgiAdet * P.neonCizgiIscilik);
  // 2- Led Neon (S26)
  add('2- Led Neon Tutarı', D.pvcCm * inp.ledPvc + D.rgbCm * inp.ledRgb + D.fujiCm * inp.ledFuji + D.normCm * inp.ledNorm + D.pixelCm * inp.ledPixel);
  // 3- Kesimsiz Yüzey (S27)
  const pleksiKismi = (
    (X15 * P.pleksiSeffaf38) * y.seffaf38 + (X15 * P.pleksiSeffaf48) * y.seffaf58 +
    (X15 * P.pleksiSiyah38) * y.siyah38 + (X15 * P.pleksiSiyah58) * y.siyah58 +
    (X15 * P.pleksiBeyaz38) * y.beyaz38 + (X15 * P.pleksiBeyaz58) * y.beyaz58 +
    (X15 * P.pleksiRenkli38) * y.renkli38 + (X15 * P.pleksiRenkli58) * y.renkli58 +
    ((X15 * P.pleksiGumusAyna) + (X15 * P.pleksiSeffaf18)) * y.gumusAyna +
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
  // 8- Çerçeve (S30)
  const c = inp.cerceve;
  add('8- Çerçeve', ((c.altin * P.cerceveAltin + c.gumus * P.cerceveGumus + c.siyah * P.cerceveSiyah + c.beyaz * P.cerceveBeyaz) * ((en + C.cerceveEnFire) * 2 + (boy + C.cerceveBoyFire) * 2)));
  // 19- Masa İşçilik (S31)
  add('19- Masa İşçilik', P.masaSonsuzlukIscilik * (En * Boy));
  // 20- Masa Led (S32)
  add('20- Masa Led', (Cubuk * C.masaCubukLed * C.masaCubukSira) * ((P.turkuazPvcM / 100 * lPvc) + (P.turkuazRgbM / 100 * lRgb) + (P.pixelM / 100 * lPix)));
  // Not: S32 formülü I20/I22/I31 (cm fiyatları) kullanır; lPvc/lRgb/lPix seçim çarpanı V51/V52/V53
  // 21- Masa MDF Kasa (S33)
  add('21- Masa MDF Kasası', (En * Boy) * P.masaMdfM2);
  // 22- Masa Cam (S34)
  const camAlan = (En * Boy) + (Yuk * En * 2) + (Yuk * Boy * 2);
  add('22- Masa Cam', camAlan * (P.masaCam6 + P.fanusYapistirma) * normalCam + camAlan * (P.masaFumeCam6 + P.fanusYapistirma) * fumeCam);
  // 23- Masa Cam Füme (S35)
  add('23- Masa Cam Füme', camAlan * fumeCam * P.fumeCam4);
  // 24- Masa Pleksi Zemin (S36)
  add('24- Masa Pleksi Zemin', P.pleksiSiyah38 * (En * Boy));
  // 25- Masa Pleksi Çubuk (S37)
  add('25- Masa Pleksi Çubuk', (P.pleksiSiyah38 * C.masaCubukBoy) * Cubuk);
  // 28- Lazer Kesim (S38)
  add('28- Lazer Kesim 6dk', C.lazerSure * P.lazerKesimSaat / C.lazerDk);
  // 29- Dış Mekan Silikon (S39)
  add('29- Dış Mekan Silikon Yalıtım', ((P.sistaSeffafSilikonMl * inp.harfAdet * C.lehimHarf) + (inp.cizgiAdet * C.lehimCizgi * P.sistaSeffafSilikonMl)) * inp.disMekan);
  // 30- Yapıştırıcı (S40)
  add('30- Yapıştırıcı', P.neonYapistirici * C.yapistiriciOran);
  // 31- Bağlantı Kabloları (S41)
  add('31- Bağlantı Kabloları', P.seffafKabloM * C.kabloOnMasa + P.beyazKabloM * C.kabloArkaMasa);
  // 32- 220V Fişli Kablo (S42)
  add('32- 220V Fişli Kablo', P.elektrikKabloM * C.fisliKablo + P.fisSoketi);
  // 33- Adaptör (S43)
  add('33- Adaptör (Trafo)', disAdapter(amperToplam, P, C) * (inp.adaptorDis ? 1 : 0) + icAdapter(amperToplam, P, C) * (inp.adaptorDis ? 0 : 1));
  // 34- Uzaktan Kumanda (S44)
  add('34- Uzaktan Kumanda', kumandaTutar({ neon: amperNeon, rgb: amperRgb, pixel: amperPix }, inp.kumanda, P, C));
  // 38- Kilitli Poşet (S45)
  add('38- Kilitli Poşet', P.kilitliPoset);
  // 39- Kargo Kutusu (S46)
  add('39- Kargo Kutusu', ((paketM2 * (((P.kartonPanelM2 * C.kartonFire) * inp.kartonPanel) + ((P.petekPanelM2 * C.petekFire) * inp.petekPanel) + (P.balonluNaylonM * C.patPatKat))) + (((paketEn + paketBoy + paketYuk) * 3) * P.koliBantM) + (paketM2 * P.kargoSunger)) * inp.paketVar);

  const toplam = items.reduce((s, i) => s + i.val, 0);
  const satis = toplam * rates.karOrani;
  return { items, toplam, satis, ara: { amperToplam, paketM2 } };
}

export default { defaultInputs, hesapla };
