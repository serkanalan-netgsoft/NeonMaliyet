// ============================================================================
//  SONSUZLUK AYNASI hesaplayıcısı  (Excel "NSA" sayfası)
// ============================================================================
import { derived, icAdapter, disAdapter, kumandaTutar, round0, roundUp } from './helpers.js';

export const defaultInputs = {
  disMekan: 0,
  harfAdet: 0, cizgiAdet: 0,
  // Üst yüzey led cm (V11-V15) — genelde 0
  ledPvc: 0, ledRgb: 0, ledFuji: 0, ledNorm: 0, ledPixel: 0,
  en: 1, boy: 0.5,                       // U18/V18 (kesimsiz yüzey)
  yuzey: { seffaf38: 0, seffaf58: 1, siyah38: 0, siyah58: 0, beyaz38: 0, beyaz58: 0,
           renkli38: 0, renkli58: 0, gumusAyna: 0, dekota45: 0, dekota10: 0, dekota18: 0,
           camAyna: 0, dalgaliAyna: 0, canvas: 0 },
  baskiUv: 0, baskiFolyo: 0, baskiEn: 0, baskiBoy: 0,
  cerceve: { altin: 0, gumus: 0, siyah: 0, beyaz: 0 },
  // Sonsuzluk'a özel
  kasaSekli: 'kare',                     // kare | daire  (V48/V49)
  sEn: 1, sBoy: 1, sYuk: 0.13,           // U55/V55/U57
  daireCap: 1,                           // V57
  aynaDelikSayi: 1,                      // U59
  icDesen: 'dekota',                     // dekota | pleksi  (V52/V53)
  sonsuzlukLed: 'pvc',                   // pvc | rgb | pixel (V61/V62/V63)
  desenTipi: 'dalgali',                  // duz | zigzag | dalgali | ozel (V65-V68)
  ozelAralik: 0.1,                       // U70
  ozelLedCm: 20,                         // V71
  kumanda: { tus11: 1, rgb: 1, pixel: 1 },
  adaptorDis: 0,
  montajStandart: 1, celikAski: 0, sonsuzlukMontaj: 1,
  paketVar: 1, kartonPanel: 1, petekPanel: 0,
};

export function hesapla(inp, P, C, rates) {
  const D = derived(P);
  const kare = inp.kasaSekli === 'kare' ? 1 : 0;      // V48
  const daire = inp.kasaSekli === 'daire' ? 1 : 0;    // V49
  const En = inp.sEn, Boy = inp.sBoy, Yuk = inp.sYuk, Cap = inp.daireCap;
  const duz = inp.desenTipi === 'duz' ? 1 : 0;
  const zigzag = inp.desenTipi === 'zigzag' ? 1 : 0;
  const dalgali = inp.desenTipi === 'dalgali' ? 1 : 0;
  const ozel = inp.desenTipi === 'ozel' ? 1 : 0;
  const ledPvc = inp.sonsuzlukLed === 'pvc' ? 1 : 0;
  const ledRgb = inp.sonsuzlukLed === 'rgb' ? 1 : 0;
  const ledPix = inp.sonsuzlukLed === 'pixel' ? 1 : 0;

  // Özel desen sayıları (X65/X67/X69)
  const ozelSayi = (uzunluk) => inp.ozelAralik > 0 ? roundUp((uzunluk * 100) / ((inp.ozelAralik + C.desenBosluk) * 100)) * ozel : 0;
  const X65 = ozelSayi(En) * kare;
  const X67 = ozelSayi(Boy) * kare;
  const X69 = (inp.ozelAralik > 0 ? roundUp(((2 * 3.14 * (Cap / 2)) * 100) / ((inp.ozelAralik + C.desenBosluk) * 100)) * ozel : 0) * daire;

  // Sonsuzluk led amperi (X47/X49/X51) — çevre × led seçimi × amper katsayısı × desen çarpanı
  const amperBlok = (ledSel, kat) => {
    const base = ((En * 2 + Boy * 2) * ledSel * kat) * kare + ((2 * 3.14 * (Cap / 2)) * ledSel * kat) * daire;
    return base * C.amperDuz * duz + base * C.amperZigZag * zigzag + base * C.amperDalgali * dalgali
         + ((inp.ozelLedCm * (X65 + X67 + X69)) / 100) * ledSel * kat;
  };
  const X47 = amperBlok(ledPvc, C.amperNeon);
  const X49 = amperBlok(ledRgb, C.amperRgb);
  const X51 = amperBlok(ledPix, C.amperPixel);

  // Üst yüzey amperi (X5/X7/X9)
  const X5 = (inp.ledPvc + inp.ledFuji + inp.ledNorm) / C.amperBolen;
  const X7 = inp.ledRgb / C.amperBolen * C.amperRgb;
  const X9 = inp.ledPixel / C.amperBolen * C.amperPixel;

  const amperNeonTop = X5 + X47;        // S4
  const amperRgbTop = X7 + X49;         // S5
  const amperPixTop = X9 + X51;         // S6
  const amperToplam = amperNeonTop + amperRgbTop + amperPixTop; // S7 = X13+X53

  const X15 = inp.en * inp.boy;          // kesimsiz yüzey m²

  // Ürün ölçüleri & paket
  const urunEn = (En * kare) + (Cap * daire);   // S9
  const urunBoy = (Boy * kare) + (Cap * daire); // S10
  const urunYuk = Yuk;                            // S11
  const paketEn = urunEn + C.paket.sonsuzluk[0];  // S12
  const paketBoy = urunBoy + C.paket.sonsuzluk[1];// S13
  const paketYuk = urunYuk + C.paket.sonsuzluk[2];// S14
  const paketM2 = ((paketYuk * paketEn) + (paketYuk * paketBoy) + (paketEn * paketBoy)) * 2; // S15

  const y = inp.yuzey, en = inp.en, boy = inp.boy;
  const items = [];
  const add = (ad, val) => items.push({ ad, val });

  // 1- Led Tabela İşçilik (S25)
  add('1- Led Tabela İşçilik', inp.harfAdet * P.neonHarfIscilik + inp.cizgiAdet * P.neonCizgiIscilik);
  // 2- Led Neon Tutarı (S26)
  add('2- Led Neon Tutarı', D.pvcCm * inp.ledPvc + D.rgbCm * inp.ledRgb + D.fujiCm * inp.ledFuji + D.normCm * inp.ledNorm + D.pixelCm * inp.ledPixel);
  // 3- Kesimsiz Yüzey Tutarı (S27) — X15 kullanır
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
  // 9- Sonsuzluk İşçilik (S31)
  add('9- Sonsuzluk Aynası İşçilik', P.masaSonsuzlukIscilik * (((En * Boy) * kare) + (((Cap / 2) * (Cap / 2) * 3.14) * daire)));
  // 10- Sonsuzluk Led (S32)
  add('10- Sonsuzluk Aynası Led', ((X47 / C.amperNeon * 100) * D.pvcCm) + ((X49 / C.amperRgb * 100) * D.rgbCm) + ((X51 / C.amperPixel * 100) * D.pixelCm));
  // 11- MDF Kasa (S33)
  add('11- Sonsuzluk Aynası MDF Kasası', (((((Cap + 0.1)) * ((Cap + 0.1)) * daire) * P.sonsuzlukMdfM2) + (((En * Boy) * kare) * P.sonsuzlukMdfM2)) * C.sonsuzlukKasaKat);
  // 12- İç Kenar Desen (S34)
  add('12- Sonsuzluk İç Kenarlar Desen Yüzeyi', (((En * Yuk * 2) + (Boy * Yuk * 2)) * (P.dekota10 * (inp.icDesen === 'dekota' ? 1 : 0))) + (((En * Yuk * 2) + (Boy * Yuk * 2)) * (P.pleksiSiyah38 * (inp.icDesen === 'pleksi' ? 1 : 0))));
  // 13- Ayna (S35)
  add('13- Sonsuzluk Aynası Ayna', ((En * Boy) * P.ayna) * kare + (((Cap + 0.1) * (Cap + 0.1)) * P.ayna) * daire);
  // 14- Ayna Silikonlama (S36)
  add('14- Sonsuzluk Ayna Silikonlama', (P.sistaAynaSilikon * 0.3 * (En * Boy)) * kare + (P.sistaAynaSilikon * 0.3 * ((Cap / 2) * (Cap / 2) * 3.14)) * daire);
  // 15- Ayna Delik (S37)
  add('15- Sonsuzluk Ayna Delik Maliyeti', (inp.aynaDelikSayi * P.aynaDelik) * daire + (inp.aynaDelikSayi * P.aynaDelik) * kare);
  // 16- Cam (S38)
  add('16- Sonsuzluk Aynası Cam', (((Cap + 0.1) * (Cap + 0.1)) * daire + (En * Boy) * kare) * P.cam);
  // 17- Cam Silikonlama (S39)
  add('17- Sonsuzluk Cam Silikonlama', (P.sistaSeffafSilikon * 0.3 * (En * Boy)) * kare + (P.sistaSeffafSilikon * 0.3 * ((Cap / 2) * (Cap / 2) * 3.14)) * daire);
  // 18- Cam Filmi (S40) — Excel formülü birebir: (En + 0.1*Boy + 0.1)
  add('18- Sonsuzluk Cam Filmi', (((Cap + 0.1) * (Cap + 0.1)) * daire + (En + 0.1 * Boy + 0.1) * kare) * D.camFilmi15);
  // 28- Lazer Kesim (S41)
  add('28- Lazer Kesim 6dk', C.lazerSure * P.lazerKesimSaat / C.lazerDk);
  // 29- Dış Mekan Silikon (S42)
  add('29- Dış Mekan Silikon Yalıtım', ((P.sistaSeffafSilikonMl * inp.harfAdet * C.lehimHarf) + (inp.cizgiAdet * C.lehimCizgi * P.sistaSeffafSilikonMl)) * inp.disMekan);
  // 30- Yapıştırıcı (S43)
  add('30- Yapıştırıcı', P.neonYapistirici * C.yapistiriciOran);
  // 31- Bağlantı Kabloları (S44)
  add('31- Bağlantı Kabloları', P.seffafKabloM * C.kabloOnSonsuzluk + P.beyazKabloM * C.kabloArkaSonsuzluk);
  // 32- 220V Fişli Kablo (S45)
  add('32- 220V Fişli Kablo', P.elektrikKabloM * C.fisliKablo + P.fisSoketi);
  // 33- Adaptör (S46)
  add('33- Adaptör (Trafo)', disAdapter(amperToplam, P, C) * (inp.adaptorDis ? 1 : 0) + icAdapter(amperToplam, P, C) * (inp.adaptorDis ? 0 : 1));
  // 34- Uzaktan Kumanda (S47)
  add('34- Uzaktan Kumanda', kumandaTutar({ neon: amperNeonTop, rgb: amperRgbTop, pixel: amperPixTop }, inp.kumanda, P, C));
  // 35- Standart Montaj (S48)
  add('35- Standart Montaj Paketi', ((P.beyazDubel * 4) + (P.meridyenVida * 4) + (P.nikelajVida * 4) + P.kilitliPoset) * inp.montajStandart);
  // 36- Çelik Askı (S49)
  add('36- Çelik Askı Aparatı', P.celikAski * inp.celikAski);
  // 37- Sonsuzluk Montaj Paketi (S50)
  add('37- Sonsuzluk Aynası Montaj Paketi', ((P.nikelajVida * 12) + (P.beyazDubel * 12) + (P.meridyenVida * 12) + (P.metalKosebent * 6) + (P.kilitliPoset * 5)) * inp.sonsuzlukMontaj);
  // 38- Kilitli Poşet (S51)
  add('38- Kilitli Poşet', P.kilitliPoset);
  // 39- Kargo Kutusu (S52)
  add('39- Kargo Kutusu', ((paketM2 * (((P.kartonPanelM2 * C.kartonFire) * inp.kartonPanel) + ((P.petekPanelM2 * C.petekFire) * inp.petekPanel) + (P.balonluNaylonM * C.patPatKat))) + (((paketEn + paketBoy + paketYuk) * 3) * P.koliBantM) + (paketM2 * P.kargoSunger)) * inp.paketVar);

  const toplam = items.reduce((s, i) => s + i.val, 0);
  const satis = toplam * rates.karOrani;
  return { items, toplam, satis, ara: { amperToplam, paketM2 } };
}

export default { defaultInputs, hesapla };
