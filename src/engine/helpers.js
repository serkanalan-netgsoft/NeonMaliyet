// ============================================================================
//  Ortak hesap yardımcıları — 4 ürün hesaplayıcısının paylaştığı mantık
// ============================================================================

// Excel türev fiyatları (cm = m/100 vb.) — P: computePrices() çıktısı
export function derived(P) {
  return {
    pvcCm:   P.turkuazPvcM / 100,   // I20
    rgbCm:   P.turkuazRgbM / 100,   // I22
    fujiCm:  P.fujiM / 100,         // I25
    normCm:  P.normM / 100,         // I28
    pixelCm: P.pixelM / 100,        // I31
    camFilmi15: P.camFilmiM2 / 30,  // I205 (1x1.5m = m²/30)
  };
}

// İç Mekan Adaptör tutarı — verilen toplam ampere göre kademeli seçim (AS!C285-C290 / I44-I49)
export function icAdapter(amper, P, C) {
  if (amper === 0) return 0;
  const t = C.icAdapter;                                  // [4.5,11.25,15.75,18.9,27,54]
  const fiyat = [P.adapterIc5, P.adapterIc125, P.adapterIc17, P.adapterIc21, P.adapterIc30, P.adapterIc60];
  for (let i = 0; i < t.length; i++) if (amper < t[i]) return fiyat[i];
  return 0; // eşiklerin üstünde (Excel FALSE→0 davranışı)
}

// Dış Mekan Adaptör tutarı (AS!C291-C298 / I35-I42)
// NOT: Orijinal Excel'de 8,3A kademesi boş bir hücreye (CH3139) bağlıydı ve
// devre dışıydı; burada doğru eşik (7,47 = 8,3×0,9) ile düzeltildi.
export function disAdapter(amper, P, C) {
  if (amper === 0) return 0;
  const t = C.disAdapter;   // [2.7,4.5,7.47,11.25,14.85,18,22.5,29.97]
  const fiyat = [P.adapterDis3, P.adapterDis5, P.adapterDis83, P.adapterDis125,
                 P.adapterDis165, P.adapterDis20, P.adapterDis25, P.adapterDis303];
  for (let i = 0; i < t.length; i++) if (amper < t[i]) return fiyat[i];
  return 0;
}

// 33- Adaptör (Trafo) Tutarı — iç/dış seçimine göre
export function adaptorTutar(amperToplam, icMi, disMi, P, C) {
  return disAdapter(amperToplam, P, C) * disMi + icAdapter(amperToplam, P, C) * icMi;
}

// 34- Uzaktan Kumanda tutarı (AS!C299-C303 / I51,I52,I54,I55,I56)
//   sel = { tus11, rgb, pixel } seçim 0/1
//   amper = { neon, rgb, pixel } ilgili amper değerleri
export function kumandaTutar(amper, sel, P, C) {
  let toplam = 0;
  // 11 Tuş — neon ampere göre
  if (sel.tus11) {
    if (amper.neon < C.kumanda11Tus[0]) toplam += P.tus11Kumanda12;
    else if (amper.neon < C.kumanda11Tus[1]) toplam += P.tus11Kumanda36;
  }
  // RGB — rgb ampere göre
  if (sel.rgb) {
    if (amper.rgb < C.kumandaRgb[0]) toplam += P.rgbKumanda18;
    else if (amper.rgb < C.kumandaRgb[1]) toplam += P.rgbKumanda36;
  }
  // Pixel — pixel ampere göre
  if (sel.pixel) {
    if (amper.pixel < C.kumandaPixel) toplam += P.pixelKumanda;
  }
  return toplam;
}

// Yuvarlama yardımcıları (Excel ROUND / ROUNDUP)
export const round0 = (x) => Math.round(x);
export const roundUp = (x) => Math.ceil(x);
