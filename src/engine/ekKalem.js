// ============================================================================
//  Ek Maliyet Kalemleri — kullanıcının hesaba elle eklediği ekstra satırlar
// ============================================================================

// Boş bir ek kalem satırı
export function bosKalem() {
  return { tip: 'elle', ad: '', miktar: 1, birimFiyat: 0, malzemeKey: '' };
}

// Tek bir ek kalemin tutarı (KDV'li TL)
export function ekTutar(k, prices) {
  const q = Number(k.miktar) || 0;
  if (k.tip === 'malzeme' && k.malzemeKey) return q * (prices[k.malzemeKey] || 0);
  return q * (Number(k.birimFiyat) || 0);
}

// Motor sonucuna ek kalemleri ekleyip toplam & satışı yeniden hesaplar
export function birlestir(sonuc, kalemler, prices, karOrani) {
  const ekItems = (kalemler || [])
    .filter((k) => (k.tip === 'malzeme' ? k.malzemeKey : k.ad || k.birimFiyat))
    .map((k) => ({
      ad: '➕ ' + (k.ad || 'Ek Kalem'),
      val: ekTutar(k, prices),
      ek: true,
    }));
  const ekToplam = ekItems.reduce((s, i) => s + i.val, 0);
  const toplam = sonuc.toplam + ekToplam;
  return { items: [...sonuc.items, ...ekItems], toplam, satis: toplam * karOrani, ara: sonuc.ara };
}
