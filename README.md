# Neon Maliyet & Fiyatlama

`EXCEL FIYATLAMA 2025` dosyasının web uygulaması hâli. Neon ürünlerinin maliyetini
0/1 (evet/hayır) seçimleri ve ölçülerle hesaplayıp, kar oranına göre satış fiyatını verir.

## Ürünler
- **Neon Tabela** (Tabela, Open Box, Pleksi Kutu, Tablo, Selfie Aynası)
- **Sonsuzluk Aynası** (Kare/Dikdörtgen + Daire)
- **Neon Masa**
- **Neon Avize**

## Çalıştırma
```bash
npm install       # bir kez
npm run dev       # geliştirme sunucusu → http://localhost:5173
npm run build     # dağıtım için (dist/ klasörü)
npm run verify    # motoru Excel değerlerine karşı test et
```

## Nasıl çalışır?
- **Fiyat zinciri:** `baz fiyat × kur × KDV`. Malzemeler USD, EUR veya TL endeksli.
  Kur değişince tüm ürün fiyatları otomatik güncellenir (Excel'deki gibi).
- **Ayarlar** sekmesinden kurları (Dolar/Euro), KDV çarpanını, kar oranını ve tüm
  malzeme baz fiyatlarını düzenleyebilirsiniz. Değerler tarayıcıda (localStorage) saklanır.
- Her hesaplama **Excel'in kendi sonuçlarıyla kuruşu kuruşuna** doğrulanmıştır
  (`npm run verify`).

## Yapı
```
src/
  data/pricing.js       → AS sayfası: malzeme fiyatları + sabitler + kurlar
  engine/               → 4 ürünün formül motoru (Excel'den birebir çevrildi)
    helpers.js          → adaptör/kumanda/amper ortak mantığı
    neonTabela.js, sonsuzluk.js, neonMasa.js, neonAvize.js
  components/           → arayüz kontrolleri, ortak alanlar, sonuç paneli
  pages/                → 4 ürün sayfası + Ayarlar
scripts/verify.mjs      → Excel doğrulama testi
```

## Excel'de bulunan iki hata → düzeltildi
Orijinal Excel'de bu iki hata vardı; ikisi de bu uygulamada **düzeltildi**:

1. **Neon Avize fiyat eşlemesi ters idi.** Çap etiketleri fiyat listesiyle ters sıralıydı
   (ör. "80cm" seçince 160cm avizenin fiyatı geliyordu). Artık her çap kendi fiyatıyla eşleşir;
   avize maliyeti bu yüzden eski Excel'den bilinçli olarak farklıdır (doğru olan budur).
2. **Dış mekan 8,3A adaptör kademesi** Excel'de boş bir hücreye (`CH3139`) bağlıydı ve
   devre dışıydı. Burada doğru eşik (7,47 A) ile düzeltildi. İç mekan hesaplarını etkilemez.
