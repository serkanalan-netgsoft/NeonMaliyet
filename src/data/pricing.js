// ============================================================================
//  NEON MALİYET — Fiyat & Sabit Veri Modülü
//  Excel "EXCEL FIYATLAMA 2025" dosyasının "AS" sayfasının birebir karşılığı.
//
//  Fiyatlandırma zinciri (Excel ile aynı):
//     baz fiyat (USD/EUR/TL)  →  × kur  =  KDV'siz TL  →  × KDV(1.2)  =  KDV'li TL
//  Formüller her zaman KDV'li TL (Excel'de "I" sütunu) değerini kullanır.
// ============================================================================

// --- Varsayılan kur & genel parametreler (AS!E15, F15, C254, C255) ---
export const defaultRates = {
  usd: 41,      // Dolar kuru  (AS!E15)
  eur: 48,      // Euro kuru   (AS!F15)
  kdv: 1.2,     // KDV çarpanı (AS!C255  = %20)
  karOrani: 2,  // Satış = maliyet × kar oranı (AS!C254)
};

// --- Malzemeler ---
// Her kayıt: { base: baz fiyat, cur: 'USD'|'EUR'|'TL', grup, ad }
//   cur 'TL'  → kur uygulanmaz (zaten TL fiyat)
//   Türev birimler (cm = m/100 vb.) motor içinde hesaplanır, ayrıca tutulmaz.
// Anahtarlar Excel'deki "I" satır numaralarına eşlenir (yorumda belirtildi).
export const defaultMaterials = {
  // ---- LEDLER (metre fiyatları; cm = /100) ----
  turkuazPvcM: { base: 1.5,  cur: 'USD', grup: 'Ledler', ad: 'Turkuaz PVC Led Neon 1m' },        // I19
  turkuazRgbM: { base: 5,    cur: 'USD', grup: 'Ledler', ad: 'Turkuaz RGB Led Neon 1m' },         // I21
  fujiM:       { base: 2.34, cur: 'USD', grup: 'Ledler', ad: 'Fuji Dış Mekan Led Neon 1m' },      // I24
  normM:       { base: 1.5,  cur: 'USD', grup: 'Ledler', ad: 'Norm Led Neon 1m' },                // I27
  pixelM:      { base: 3.5,  cur: 'USD', grup: 'Ledler', ad: 'Pixel Neon Led 1m' },               // I30

  // ---- ADAPTÖRLER (Dış Mekan) ----
  adapterDis3:    { base: 9,    cur: 'USD', grup: 'Adaptör (Dış Mekan)', ad: '3A Dış Mekan Adaptör' },     // I35
  adapterDis5:    { base: 9,    cur: 'USD', grup: 'Adaptör (Dış Mekan)', ad: '5A Dış Mekan Adaptör' },     // I36
  adapterDis83:   { base: 12.5, cur: 'USD', grup: 'Adaptör (Dış Mekan)', ad: '8,3A Dış Mekan Adaptör' },   // I37
  adapterDis125:  { base: 17.5, cur: 'USD', grup: 'Adaptör (Dış Mekan)', ad: '12,5A Dış Mekan Adaptör' },  // I38
  adapterDis165:  { base: 22.5, cur: 'USD', grup: 'Adaptör (Dış Mekan)', ad: '16,5A Dış Mekan Adaptör' },  // I39
  adapterDis20:   { base: 25,   cur: 'USD', grup: 'Adaptör (Dış Mekan)', ad: '20A Dış Mekan Adaptör' },    // I40
  adapterDis25:   { base: 28,   cur: 'USD', grup: 'Adaptör (Dış Mekan)', ad: '25A Dış Mekan Adaptör' },    // I41
  adapterDis303:  { base: 31,   cur: 'USD', grup: 'Adaptör (Dış Mekan)', ad: '30,3A Dış Mekan Adaptör' },  // I42

  // ---- ADAPTÖRLER (İç Mekan) ----
  adapterIc5:   { base: 2.1,  cur: 'USD', grup: 'Adaptör (İç Mekan)', ad: '5A İç Mekan Adaptör' },    // I44
  adapterIc125: { base: 2.5,  cur: 'USD', grup: 'Adaptör (İç Mekan)', ad: '12,5A İç Mekan Adaptör' }, // I45
  adapterIc17:  { base: 2.9,  cur: 'USD', grup: 'Adaptör (İç Mekan)', ad: '17A İç Mekan Adaptör' },   // I46
  adapterIc21:  { base: 3.75, cur: 'USD', grup: 'Adaptör (İç Mekan)', ad: '21A İç Mekan Adaptör' },   // I47
  adapterIc30:  { base: 4.1,  cur: 'USD', grup: 'Adaptör (İç Mekan)', ad: '30A İç Mekan Adaptör' },   // I48
  adapterIc60:  { base: 8,    cur: 'USD', grup: 'Adaptör (İç Mekan)', ad: '60A İç Mekan Adaptör' },   // I49

  // ---- KUMANDALAR ----
  rgbKumanda18:   { base: 2.75, cur: 'USD', grup: 'Kumandalar', ad: '18A RGB Kumanda' },              // I51
  rgbKumanda36:   { base: 3.35, cur: 'USD', grup: 'Kumandalar', ad: '36A RGB Kumanda' },              // I52
  pixelKumanda:   { base: 5,    cur: 'USD', grup: 'Kumandalar', ad: 'Pixel Led Kontrol Kumanda' },    // I54
  tus11Kumanda12: { base: 4,    cur: 'USD', grup: 'Kumandalar', ad: '11 Tuş Dimmer 12A' },            // I55
  tus11Kumanda36: { base: 7,    cur: 'USD', grup: 'Kumandalar', ad: '11 Tuş Dimmer 36A' },            // I56

  // ---- KABLOLAR (metre) ----
  seffafKabloM:   { base: 0.2308, cur: 'USD', grup: 'Kablolar', ad: 'Şeffaf Ön Bağlantı Kablo 1m' },  // I59
  beyazKabloM:    { base: 0.0769, cur: 'USD', grup: 'Kablolar', ad: 'Beyaz Arka Bağlantı Kablo 1m' }, // I61
  elektrikKabloM: { base: 15,     cur: 'TL',  grup: 'Kablolar', ad: 'Elektrik Kablosu 2x1.5mm 1m' },  // I64

  // ---- PLEKSİLER (m² fiyatları) ----
  pleksiSeffaf18: { base: 10.278947, cur: 'USD', grup: 'Pleksiler', ad: 'Şeffaf 1.8mm Pleksi m²' },   // I66
  pleksiSeffaf38: { base: 21.7,      cur: 'USD', grup: 'Pleksiler', ad: 'Şeffaf 3.8mm Pleksi m²' },   // I68
  pleksiSeffaf48: { base: 27.410526, cur: 'USD', grup: 'Pleksiler', ad: 'Şeffaf 4.8mm Pleksi m²' },   // I69
  pleksiSiyah38:  { base: 23,        cur: 'USD', grup: 'Pleksiler', ad: 'Siyah 3.8mm Pleksi m²' },    // I71
  pleksiSiyah58:  { base: 35.105263, cur: 'USD', grup: 'Pleksiler', ad: 'Siyah 5.8mm Pleksi m²' },    // I72
  pleksiBeyaz38:  { base: 23,        cur: 'USD', grup: 'Pleksiler', ad: 'Beyaz 3.8mm Pleksi m²' },    // I74
  pleksiBeyaz58:  { base: 35.105263, cur: 'USD', grup: 'Pleksiler', ad: 'Beyaz 5.8mm Pleksi m²' },    // I75
  pleksiRenkli38: { base: 24,        cur: 'USD', grup: 'Pleksiler', ad: 'Renkli 3.8mm Pleksi m²' },   // I77
  pleksiRenkli58: { base: 36.631579, cur: 'USD', grup: 'Pleksiler', ad: 'Renkli 5.8mm Pleksi m²' },   // I78
  pleksiGumusAyna:{ base: 7.25,      cur: 'USD', grup: 'Pleksiler', ad: 'Gümüş Aynalı 1.8mm Pleksi m²' }, // I80

  // ---- DİĞER YÜZEYLER ----
  lazerKesimSaat: { base: 600,   cur: 'TL',  grup: 'Diğer Yüzeyler', ad: 'Lazer Kesim (saat)' },      // I97
  dekota45:       { base: 4.5,   cur: 'EUR', grup: 'Diğer Yüzeyler', ad: 'Dekota 4,5mm m²' },         // I99
  dekota10:       { base: 9.5,   cur: 'EUR', grup: 'Diğer Yüzeyler', ad: 'Dekota 10mm m²' },          // I101
  dekota18:       { base: 15.5,  cur: 'EUR', grup: 'Diğer Yüzeyler', ad: 'Dekota 18mm m²' },          // I103
  canvasM2:       { base: 13.12, cur: 'USD', grup: 'Diğer Yüzeyler', ad: 'Canvas Baskı m²' },         // I111
  canvasMdfM:     { base: 3.64,  cur: 'USD', grup: 'Diğer Yüzeyler', ad: 'Canvas MDF Kayıt 1m' },     // I112

  // ---- BASKI ----
  uvBaski:   { base: 5,   cur: 'USD', grup: 'Baskı', ad: 'UV Baskı m²' },      // I114
  folyoBaski:{ base: 3.5, cur: 'USD', grup: 'Baskı', ad: 'Folyo Baskı m²' },   // I116

  // ---- ÇERÇEVELER (1m) ----
  cerceveAltin: { base: 5.85, cur: 'USD', grup: 'Çerçeveler', ad: 'Altın Çerçeve 1m' },  // I118
  cerceveGumus: { base: 5.85, cur: 'USD', grup: 'Çerçeveler', ad: 'Gümüş Çerçeve 1m' },  // I120
  cerceveBeyaz: { base: 5.85, cur: 'USD', grup: 'Çerçeveler', ad: 'Beyaz Çerçeve 1m' },  // I122
  cerceveSiyah: { base: 5.85, cur: 'USD', grup: 'Çerçeveler', ad: 'Siyah Çerçeve 1m' },  // I124

  // ---- METAL AVİZELER ----
  avize180: { base: 167, cur: 'USD', grup: 'Metal Avizeler', ad: '180cm Çap Metal Avize' }, // I126
  avize160: { base: 159, cur: 'USD', grup: 'Metal Avizeler', ad: '160cm Çap Metal Avize' }, // I128
  avize150: { base: 152, cur: 'USD', grup: 'Metal Avizeler', ad: '150cm Çap Metal Avize' }, // I130
  avize130: { base: 145, cur: 'USD', grup: 'Metal Avizeler', ad: '130cm Çap Metal Avize' }, // I132
  avize120: { base: 138, cur: 'USD', grup: 'Metal Avizeler', ad: '120cm Çap Metal Avize' }, // I134
  avize100: { base: 132, cur: 'USD', grup: 'Metal Avizeler', ad: '100cm Çap Metal Avize' }, // I136
  avize90:  { base: 125, cur: 'USD', grup: 'Metal Avizeler', ad: '90cm Çap Metal Avize' },  // I138
  avize80:  { base: 118, cur: 'USD', grup: 'Metal Avizeler', ad: '80cm Çap Metal Avize' },  // I140
  avize60:  { base: 111, cur: 'USD', grup: 'Metal Avizeler', ad: '60cm Çap Metal Avize' },  // I142

  // ---- PAKETLEME ----
  kartonPanelM2: { base: 22.5, cur: 'TL', grup: 'Paketleme', ad: 'Karton Panel m²' },          // I145
  petekPanelM2:  { base: 100,  cur: 'TL', grup: 'Paketleme', ad: 'Petek Panel m²' },           // I148
  koliBantM:     { base: 0.35, cur: 'TL', grup: 'Paketleme', ad: 'Koli Bant 1m' },             // I151
  kargoSunger:   { base: 25,   cur: 'TL', grup: 'Paketleme', ad: 'Kargo Kutu Süngeri/Strafor' }, // I154
  balonluNaylonM:{ base: 7,    cur: 'TL', grup: 'Paketleme', ad: 'Balonlu Naylon (Pat Pat) 1m' }, // I157

  // ---- MONTAJ ----
  nikelajVida:  { base: 0.11, cur: 'USD', grup: 'Montaj', ad: 'Nikelaj Dekoratif Vida (adet)' }, // I159
  beyazDubel:   { base: 0.35, cur: 'TL',  grup: 'Montaj', ad: 'Beyaz Dübel 7mm (adet)' },        // I162
  meridyenVida: { base: 0.6,  cur: 'TL',  grup: 'Montaj', ad: 'Meridyen Duvar Vida (adet)' },    // I165
  kilitliPoset: { base: 0.3,  cur: 'TL',  grup: 'Montaj', ad: 'Kilitli Poşet 8*10cm (adet)' },   // I168
  metalKosebent:{ base: 0.15, cur: 'USD', grup: 'Montaj', ad: 'Metal Köşebent Menteşe (adet)' }, // I172
  celikAski:    { base: 8.33, cur: 'USD', grup: 'Montaj', ad: 'Çelik Askı Aparatı' },            // I174
  yukseltmeVida:{ base: 1.41, cur: 'USD', grup: 'Montaj', ad: 'Tabela Yükseltme Vidası (adet)' },// I176

  // ---- İŞÇİLİK ----
  neonHarfIscilik:  { base: 1.25, cur: 'USD', grup: 'İşçilik', ad: 'Neon Harf İşçilik (adet)' },       // I178
  neonCizgiIscilik: { base: 0.75, cur: 'USD', grup: 'İşçilik', ad: 'Neon Çizgi İşçilik (adet)' },      // I180
  masaSonsuzlukIscilik: { base: 25, cur: 'USD', grup: 'İşçilik', ad: 'Masa & Sonsuzluk İşçilik m²' },  // I182

  // ---- CAM & AYNA (m²) ----
  cam:         { base: 14.58, cur: 'USD', grup: 'Cam & Ayna', ad: 'Cam m²' },                 // I184
  fumeCam4:    { base: 550,   cur: 'TL',  grup: 'Cam & Ayna', ad: 'Füme Cam 4mm m²' },        // I186
  ayna:        { base: 700,   cur: 'TL',  grup: 'Cam & Ayna', ad: 'Ayna m²' },                // I188
  dalgaliAyna: { base: 1400,  cur: 'TL',  grup: 'Cam & Ayna', ad: 'Dalgalı Asimetrik Ayna m²' }, // I190
  masaCam6:    { base: 37,    cur: 'USD', grup: 'Cam & Ayna', ad: 'Masa Cam 6mm m²' },        // I192
  masaFumeCam6:{ base: 38,    cur: 'USD', grup: 'Cam & Ayna', ad: 'Masa Füme Cam 6mm m²' },   // I194
  aynaDelik:   { base: 0.75,  cur: 'USD', grup: 'Cam & Ayna', ad: 'Ayna Delik Açma (adet)' }, // I196
  fanusYapistirma: { base: 28, cur: 'USD', grup: 'Cam & Ayna', ad: 'Fanus Cam Yapıştırma (kutu)' }, // I198

  // ---- DİĞER ----
  neonYapistirici: { base: 4.2,   cur: 'USD', grup: 'Diğer', ad: 'Turkuaz Led Neon Yapıştırıcı (kutu)' }, // I200
  fisSoketi:       { base: 0.5,   cur: 'USD', grup: 'Diğer', ad: 'Fiş Soketi' },                    // I202
  camFilmiM2:      { base: 187.804878, cur: 'USD', grup: 'Diğer', ad: 'Cam Filmi Silver m²' },      // I204 (1x1.5m = /30)
  sonsuzlukMdfM2:  { base: 1250,  cur: 'TL',  grup: 'Diğer', ad: 'Sonsuzluk MDF 18mm m²' },         // I207
  masaMdfM2:       { base: 1265,  cur: 'TL',  grup: 'Diğer', ad: 'Masa MDF 18mm m²' },              // I209
  lehimTeli500:    { base: 30,    cur: 'USD', grup: 'Diğer', ad: 'Lehim Teli 500gr' },              // I213
  sistaSeffafSilikon: { base: 5,  cur: 'USD', grup: 'Diğer', ad: 'Sista Şeffaf Silikon 280ml' },    // I215
  sistaSeffafSilikonMl:{ base: 0.017857142857142856, cur: 'USD', grup: 'Diğer', ad: 'Sista Şeffaf Silikon 1ml' }, // I216
  sistaAynaSilikon:{ base: 7,     cur: 'USD', grup: 'Diğer', ad: 'Sista Ayna Silikon 280ml' },      // I218
};

// --- Sabit Katsayılar / Parametreler (AS!C253-C368) ---
export const defaultConstants = {
  fireOrani:        1.15,  // C260 Pleksi/Dekota %15 fire
  lazerSure:        6,     // C261 1 pleksi lazer kesim (dk)
  lazerDk:          60,    // C262 saat→dk
  lehimRulo:        5000,  // C263 1 ruloda 5000 lehim
  lehimHarf:        6,     // C264 1 harf = 6 lehim
  lehimCizgi:       2,     // C265 1 çizgi = 2 lehim
  yapistiriciOran:  0.1,   // C266 kutunun 1/10'u
  // Bağlantı kablo uzunlukları (m)
  kabloOnTabela:    2,     // C267
  kabloArkaTabela:  3,     // C268
  kabloOnSonsuzluk: 3,     // C269
  kabloArkaSonsuzluk:5,    // C270
  kabloOnMasa:      3,     // C271
  kabloArkaMasa:    5,     // C272
  kabloOnAvize:     5,     // C273
  kabloArkaAvize:   10,    // C274
  fisliKablo:       1.5,   // C275 220V-adaptör arası
  amperNeon:        1,     // C277
  amperRgb:         1.2,   // C278
  amperPixel:       1.2,   // C279
  masaCubukBoy:     0.04,  // C281 çubuk 100x4cm
  masaCubukLed:     100,   // C282 çubukta 100cm led
  masaCubukSira:    3,     // C283 3 sıra led
  amperBolen:       100,   // C284 cm→m amper
  // İç mekan adaptör amper eşikleri (%10 toleranslı)
  icAdapter: [4.5, 11.25, 15.75, 18.9, 27, 54],  // C285-C290 → 5,12.5,17,21,30,60A
  // Dış mekan adaptör amper eşikleri
  disAdapter: [2.7, 4.5, 7.47, 11.25, 14.85, 18, 22.5, 29.97], // C291,C292,C293(=8.3*0.9),C294,C295,C296,C297,C298
  // Kumanda amper eşikleri
  kumanda11Tus: [10.8, 32.4],   // C299,C300 → 12A,36A
  kumandaRgb:   [16.2, 32.4],   // C301,C302 → 18A,36A
  kumandaPixel: 100,            // C303
  openBoxVida:  4,     // C304
  pleksiKutuYuk:0.05,  // C305 kutu yüksekliği 5cm
  aynaEnPay:    0.1,   // C306
  aynaBoyPay:   0.1,   // C307
  dalgaliEnPay: 0.1,   // C308
  dalgaliBoyPay:0.1,   // C309
  aynaM2Pay:    0.1,   // C310
  camM2Pay:     0.1,   // C311
  camFilmiPay1: 0.15,  // C312
  camFilmiPay2: 0.25,  // C313
  desenZigZag:  2,     // C314
  desenDalgali: 1.5,   // C315
  cmCarpan:     100,   // C316
  amperDuz:     1,     // C317
  amperZigZag:  2,     // C318
  amperDalgali: 1.5,   // C319
  desenBosluk:  0.05,  // C320
  // Paket kutu payları (En/Boy/Yükseklik) ürün tipine göre
  paket: {
    tabela:   [0.05, 0.05, 0.1],   // C321-C323
    openBox:  [0.05, 0.05, 0.1],   // C324-C326
    pleksiKutu:[0.05, 0.05, 0.1],  // C327-C329
    tablo:    [0.2, 0.2, 0.1],     // C330-C332
    selfie:   [0.05, 0.05, 0.05],  // C333-C335
    sonsuzluk:[0.1, 0.1, 0.1],     // C336-C338
    masa:     [0.1, 0.1, 0.1],     // C339-C341
  },
  patPatKat:    2,     // C342
  kartonFire:   1.15,  // C343
  petekFire:    1.15,  // C344
  tabloEnPay:   0.1,   // C345
  tabloBoyPay:  0.1,   // C346
  // Ürün yükseklikleri (m) — N sheet ürün tipleri
  yukseklik: [0.02, 0.1, 0.1, 0.05, 0.1], // C347-C351 tabela,openbox,pleksikutu,tablo,selfie
  sonsuzlukKasaKat: 2, // C352
  cerceveEnFire:0.1,   // C353
  cerceveBoyFire:0.1,  // C354
  avizePleksiKapak: 0.0314, // C356
  // Avize çapları (m) — 60..190cm
  avizeCap: [0.6, 0.8, 0.8, 1, 1.2, 1.3, 1.5, 1.6, 1.9], // C357-C365
  avizePaketEn:  0.1,  // C366
  avizePaketBoy: 0.1,  // C367
  avizePaketYuk: 0.1,  // C368
  // --- Neon Tasarım Sihirbazı ---
  tasarimYogunluk: 2.0,   // LED uzunluğu = metin genişliği(cm) × bu katsayı (yazı stiline göre kalibre edilir)
  tasarimZeminPay: 0.05,  // Pleksi zemin için metnin her kenarına eklenen pay (m)
  tasarimSatirAralik: 1.35, // satır yüksekliği çarpanı
};

// --- Ayarlar ekranında düzenlenebilir katsayılar (etiket + nesne yolu) ---
// path: constants içindeki konum. Diziler için indeks, iç içe için çoklu anahtar.
export const KATSAYI_META = [
  { grup: 'Genel', items: [
    { path: ['fireOrani'], label: 'Pleksi/Dekota fire çarpanı' },      // C260
    { path: ['yapistiriciOran'], label: 'Yapıştırıcı oranı (kutunun 1/x)' }, // C266
    { path: ['lazerSure'], label: '1 pleksi lazer kesim süresi (dk)' }, // C261
    { path: ['lazerDk'], label: 'Saat→dk çevrim' },                     // C262
  ]},
  { grup: 'Lehim', items: [
    { path: ['lehimRulo'], label: '1 ruloda lehim adedi' },   // C263
    { path: ['lehimHarf'], label: '1 harf = kaç lehim' },     // C264
    { path: ['lehimCizgi'], label: '1 çizgi = kaç lehim' },   // C265
  ]},
  { grup: 'Kablo Uzunlukları (m)', items: [
    { path: ['kabloOnTabela'], label: 'Ön kablo — Tabela' },        // C267
    { path: ['kabloArkaTabela'], label: 'Arka kablo — Tabela' },    // C268
    { path: ['kabloOnSonsuzluk'], label: 'Ön kablo — Sonsuzluk' },  // C269
    { path: ['kabloArkaSonsuzluk'], label: 'Arka kablo — Sonsuzluk' }, // C270
    { path: ['kabloOnMasa'], label: 'Ön kablo — Masa' },            // C271
    { path: ['kabloArkaMasa'], label: 'Arka kablo — Masa' },        // C272
    { path: ['kabloOnAvize'], label: 'Ön kablo — Avize' },          // C273
    { path: ['kabloArkaAvize'], label: 'Arka kablo — Avize' },      // C274
    { path: ['fisliKablo'], label: '220V-Adaptör arası fişli kablo' }, // C275
  ]},
  { grup: 'Amper Katsayıları', items: [
    { path: ['amperNeon'], label: 'Neon amper çarpanı' },    // C277
    { path: ['amperRgb'], label: 'RGB amper çarpanı' },      // C278
    { path: ['amperPixel'], label: 'Pixel amper çarpanı' },  // C279
    { path: ['amperBolen'], label: 'cm→m amper bölen' },     // C284
  ]},
  { grup: 'İç Mekan Adaptör — Amper Eşikleri', items: [
    { path: ['icAdapter', 0], label: '5A adaptör eşiği' },      // C285
    { path: ['icAdapter', 1], label: '12,5A adaptör eşiği' },   // C286
    { path: ['icAdapter', 2], label: '17A adaptör eşiği' },     // C287
    { path: ['icAdapter', 3], label: '21A adaptör eşiği' },     // C288
    { path: ['icAdapter', 4], label: '30A adaptör eşiği' },     // C289
    { path: ['icAdapter', 5], label: '60A adaptör eşiği' },     // C290
  ]},
  { grup: 'Dış Mekan Adaptör — Amper Eşikleri', items: [
    { path: ['disAdapter', 0], label: '3A adaptör eşiği' },     // C291
    { path: ['disAdapter', 1], label: '5A adaptör eşiği' },     // C292
    { path: ['disAdapter', 2], label: '8,3A adaptör eşiği' },   // C293 (düzeltildi)
    { path: ['disAdapter', 3], label: '12,5A adaptör eşiği' },  // C294
    { path: ['disAdapter', 4], label: '16,5A adaptör eşiği' },  // C295
    { path: ['disAdapter', 5], label: '20A adaptör eşiği' },    // C296
    { path: ['disAdapter', 6], label: '25A adaptör eşiği' },    // C297
    { path: ['disAdapter', 7], label: '30,3A adaptör eşiği' },  // C298
  ]},
  { grup: 'Kumanda — Amper Eşikleri', items: [
    { path: ['kumanda11Tus', 0], label: '11 Tuş — 12A eşiği' }, // C299
    { path: ['kumanda11Tus', 1], label: '11 Tuş — 36A eşiği' }, // C300
    { path: ['kumandaRgb', 0], label: 'RGB — 18A eşiği' },      // C301
    { path: ['kumandaRgb', 1], label: 'RGB — 36A eşiği' },      // C302
    { path: ['kumandaPixel'], label: 'Pixel kumanda eşiği' },   // C303
  ]},
  { grup: 'Neon Masa', items: [
    { path: ['masaCubukBoy'], label: 'Çubuk boyu (m)' },       // C281
    { path: ['masaCubukLed'], label: 'Çubukta led (cm)' },     // C282
    { path: ['masaCubukSira'], label: 'Led sıra sayısı' },     // C283
  ]},
  { grup: 'Open Box / Pleksi Kutu', items: [
    { path: ['openBoxVida'], label: 'Open box vida adedi' },       // C304
    { path: ['pleksiKutuYuk'], label: 'Pleksi kutu yüksekliği (m)' }, // C305
  ]},
  { grup: 'Kargo & Fire', items: [
    { path: ['patPatKat'], label: 'Balonlu naylon kat çarpanı' }, // C342
    { path: ['kartonFire'], label: 'Karton panel fire' },         // C343
    { path: ['petekFire'], label: 'Petek panel fire' },           // C344
  ]},
  { grup: 'Paket Kutu Payları — En / Boy / Yükseklik (m)', items: [
    { path: ['paket', 'tabela', 0], label: 'Tabela En' }, { path: ['paket', 'tabela', 1], label: 'Tabela Boy' }, { path: ['paket', 'tabela', 2], label: 'Tabela Yük.' },
    { path: ['paket', 'openBox', 0], label: 'Open Box En' }, { path: ['paket', 'openBox', 1], label: 'Open Box Boy' }, { path: ['paket', 'openBox', 2], label: 'Open Box Yük.' },
    { path: ['paket', 'pleksiKutu', 0], label: 'Pleksi Kutu En' }, { path: ['paket', 'pleksiKutu', 1], label: 'Pleksi Kutu Boy' }, { path: ['paket', 'pleksiKutu', 2], label: 'Pleksi Kutu Yük.' },
    { path: ['paket', 'tablo', 0], label: 'Tablo En' }, { path: ['paket', 'tablo', 1], label: 'Tablo Boy' }, { path: ['paket', 'tablo', 2], label: 'Tablo Yük.' },
    { path: ['paket', 'selfie', 0], label: 'Selfie En' }, { path: ['paket', 'selfie', 1], label: 'Selfie Boy' }, { path: ['paket', 'selfie', 2], label: 'Selfie Yük.' },
    { path: ['paket', 'sonsuzluk', 0], label: 'Sonsuzluk En' }, { path: ['paket', 'sonsuzluk', 1], label: 'Sonsuzluk Boy' }, { path: ['paket', 'sonsuzluk', 2], label: 'Sonsuzluk Yük.' },
    { path: ['paket', 'masa', 0], label: 'Masa En' }, { path: ['paket', 'masa', 1], label: 'Masa Boy' }, { path: ['paket', 'masa', 2], label: 'Masa Yük.' },
  ]},
  { grup: 'Tablo & Çerçeve Payları (m)', items: [
    { path: ['tabloEnPay'], label: 'Tablo çerçeve en payı' },     // C345
    { path: ['tabloBoyPay'], label: 'Tablo çerçeve boy payı' },   // C346
    { path: ['cerceveEnFire'], label: 'Çerçeve en fire' },        // C353
    { path: ['cerceveBoyFire'], label: 'Çerçeve boy fire' },      // C354
    { path: ['yukseklik', 0], label: 'Ürün yükseklik — Tabela' },     // C347
    { path: ['yukseklik', 1], label: 'Ürün yükseklik — Open Box' },   // C348
    { path: ['yukseklik', 2], label: 'Ürün yükseklik — Pleksi Kutu' },// C349
    { path: ['yukseklik', 3], label: 'Ürün yükseklik — Tablo' },      // C350
    { path: ['yukseklik', 4], label: 'Ürün yükseklik — Selfie' },     // C351
  ]},
  { grup: 'Sonsuzluk Desen & Kasa', items: [
    { path: ['amperDuz'], label: 'Düz çizgi amper çarpanı' },     // C317
    { path: ['amperZigZag'], label: 'Zig zag amper çarpanı' },    // C318
    { path: ['amperDalgali'], label: 'Dalgalı amper çarpanı' },   // C319
    { path: ['sonsuzlukKasaKat'], label: 'Kasa m² katı (alt+kapak)' }, // C352
    { path: ['desenBosluk'], label: 'Özel desen arası boşluk (m)' },   // C320
  ]},
  { grup: 'Avize', items: [
    { path: ['avizePleksiKapak'], label: 'Şeffaf pleksi kapak (m²)' }, // C356
    { path: ['avizePaketEn'], label: 'Paket en payı (m)' },   // C366
    { path: ['avizePaketBoy'], label: 'Paket boy payı (m)' }, // C367
    { path: ['avizePaketYuk'], label: 'Paket yükseklik payı (m)' }, // C368
    { path: ['avizeCap', 0], label: 'Çap — 60cm (m)' }, { path: ['avizeCap', 1], label: 'Çap — 80cm (m)' },
    { path: ['avizeCap', 2], label: 'Çap — 90cm (m)' }, { path: ['avizeCap', 3], label: 'Çap — 100cm (m)' },
    { path: ['avizeCap', 4], label: 'Çap — 120cm (m)' }, { path: ['avizeCap', 5], label: 'Çap — 130cm (m)' },
    { path: ['avizeCap', 6], label: 'Çap — 150cm (m)' }, { path: ['avizeCap', 7], label: 'Çap — 160cm (m)' },
    { path: ['avizeCap', 8], label: 'Çap — 190cm (m)' },
  ]},
  { grup: 'Neon Tasarım Sihirbazı', items: [
    { path: ['tasarimYogunluk'], label: 'LED yoğunluk katsayısı (genişlik×kat)' },
    { path: ['tasarimZeminPay'], label: 'Pleksi zemin kenar payı (m)' },
    { path: ['tasarimSatirAralik'], label: 'Satır aralığı çarpanı' },
  ]},
  { grup: 'Yüzey / Ayna / Cam Payları (m)', items: [
    { path: ['aynaEnPay'], label: 'Ayna en payı' },        // C306
    { path: ['aynaBoyPay'], label: 'Ayna boy payı' },      // C307
    { path: ['dalgaliEnPay'], label: 'Dalgalı ayna en payı' },  // C308
    { path: ['dalgaliBoyPay'], label: 'Dalgalı ayna boy payı' },// C309
    { path: ['camFilmiPay1'], label: 'Cam filmi payı 1' }, // C312
    { path: ['camFilmiPay2'], label: 'Cam filmi payı 2' }, // C313
  ]},
];

// ---------------------------------------------------------------------------
// computePrices(rates, materials) → { key: KDV'li TL fiyat }
//   Excel'deki "I" sütunu değerlerini üretir.
// ---------------------------------------------------------------------------
export function computePrices(rates = defaultRates, materials = defaultMaterials) {
  const rateOf = (cur) => (cur === 'USD' ? rates.usd : cur === 'EUR' ? rates.eur : 1);
  const P = {};
  for (const [key, m] of Object.entries(materials)) {
    P[key] = m.base * rateOf(m.cur) * rates.kdv;
  }
  return P;
}
