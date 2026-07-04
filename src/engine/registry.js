// ============================================================================
//  Ürün kayıt defteri — kayıtlı ürünlerin güncel fiyatını yeniden hesaplar
//  Ürün, giriş yapılandırmasıyla (inputs) saklanır; fiyatlar/kur değişince
//  motor tekrar çalıştırılarak GÜNCEL maliyet & satış fiyatı bulunur.
// ============================================================================
import * as tabela from './neonTabela.js';
import * as sonsuzluk from './sonsuzluk.js';
import * as masa from './neonMasa.js';
import * as avize from './neonAvize.js';
import { birlestir } from './ekKalem.js';

export const REGISTRY = {
  tabela:    { ad: 'Neon Tabela',      hesapla: tabela.hesapla },
  sonsuzluk: { ad: 'Sonsuzluk Aynası', hesapla: sonsuzluk.hesapla },
  masa:      { ad: 'Neon Masa',        hesapla: masa.hesapla },
  avize:     { ad: 'Neon Avize',       hesapla: avize.hesapla },
};

// Bir ürünün GÜNCEL maliyet & satış fiyatını hesaplar
export function hesaplaUrun(urun, prices, constants, rates) {
  const mod = REGISTRY[urun.urunTipi];
  if (!mod) return { toplam: 0, satis: 0, marj: 0, items: [] };
  const base = mod.hesapla(urun.inputs, prices, constants, rates);
  const withEk = birlestir(base, urun.ekler || [], prices, rates.karOrani);
  const marj = urun.marjTipi === 'ozel' ? (Number(urun.ozelMarj) || rates.karOrani) : rates.karOrani;
  return { toplam: withEk.toplam, satis: withEk.toplam * marj, marj, items: withEk.items };
}
