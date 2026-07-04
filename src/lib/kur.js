// Güncel döviz kurunu ücretsiz API'den çeker (anahtar gerekmez, CORS açık).
// USD/TRY doğrudan; EUR/TRY = (USD/TRY) / (USD/EUR).
export async function guncelKur() {
  const r = await fetch('https://open.er-api.com/v6/latest/USD');
  if (!r.ok) throw new Error('Kur servisine ulaşılamadı');
  const d = await r.json();
  const usdTry = d?.rates?.TRY;
  const usdEur = d?.rates?.EUR;
  if (!usdTry) throw new Error('TRY kuru bulunamadı');
  const eurTry = usdEur ? usdTry / usdEur : null;
  return {
    usd: Math.round(usdTry * 100) / 100,
    eur: eurTry ? Math.round(eurTry * 100) / 100 : null,
    tarih: d?.time_last_update_utc || '',
  };
}
