import { useState, useEffect, useCallback } from 'react';
import { defaultRates, defaultMaterials, defaultConstants, computePrices } from './data/pricing.js';

const LS_KEY = 'neonMaliyet.ayarlar.v2';
const LS_URUN = 'neonMaliyet.urunler.v1';

function loadSaved() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch { return null; }
}

// Yapıyı bozmadan kayıtlı değerleri varsayılanların üstüne bindirir
function deepMerge(base, over) {
  if (over === undefined || over === null) return structuredClone(base);
  if (Array.isArray(base)) {
    if (!Array.isArray(over)) return base.slice();
    return base.map((v, i) => (over[i] !== undefined ? deepMerge(v, over[i]) : v));
  }
  if (base && typeof base === 'object') {
    const out = {};
    for (const k of Object.keys(base)) out[k] = deepMerge(base[k], over[k]);
    return out;
  }
  return typeof over === typeof base ? over : base;
}

// Bir yol (path) üzerindeki değeri değiştirip yeni (immutable) nesne döner
function setIn(obj, path, value) {
  if (path.length === 0) return value;
  const [head, ...rest] = path;
  if (Array.isArray(obj)) {
    const copy = obj.slice();
    copy[head] = setIn(obj[head], rest, value);
    return copy;
  }
  return { ...obj, [head]: setIn(obj[head], rest, value) };
}

export function useAyarlar() {
  const saved = loadSaved();
  const [rates, setRates] = useState(() => ({ ...defaultRates, ...(saved?.rates || {}) }));
  const [materials, setMaterials] = useState(() => {
    const s = saved?.materials || {};
    const merged = {};
    for (const [k, v] of Object.entries(defaultMaterials)) merged[k] = { ...v, ...(s[k] || {}) };
    // Kayıtlı özel (kullanıcı tanımlı) malzemeleri ekle
    for (const [k, v] of Object.entries(s)) if (!(k in defaultMaterials) && v && v.ozel) merged[k] = { ...v };
    return merged;
  });
  const [constants, setConstants] = useState(() => deepMerge(defaultConstants, saved?.constants));
  const [firma, setFirmaState] = useState(() => ({
    ad: 'Firma Adınız', telefon: '', web: '',
    not: 'Fiyata KDV dahildir. Teklif 7 gün geçerlidir.',
    ...(saved?.firma || {}),
  }));

  useEffect(() => {
    const matStore = {};
    for (const [k, v] of Object.entries(materials)) {
      matStore[k] = v.ozel
        ? { base: v.base, cur: v.cur, ad: v.ad, grup: v.grup, ozel: true }
        : { base: v.base, cur: v.cur };
    }
    localStorage.setItem(LS_KEY, JSON.stringify({ rates, materials: matStore, constants, firma }));
  }, [rates, materials, constants, firma]);
  const setFirma = useCallback((key, val) => setFirmaState((f) => ({ ...f, [key]: val })), []);

  const setRate = useCallback((key, val) => setRates((r) => ({ ...r, [key]: val })), []);
  const setMaterialBase = useCallback((key, base) =>
    setMaterials((m) => ({ ...m, [key]: { ...m[key], base } })), []);
  // Özel (kullanıcı tanımlı) malzeme ekle
  const addMaterial = useCallback((ad, base, cur) => {
    const key = 'ozel_' + Date.now();
    setMaterials((m) => ({ ...m, [key]: { ad: ad || 'Yeni Malzeme', base: Number(base) || 0, cur: cur || 'TL', grup: 'Özel Malzemeler', ozel: true } }));
  }, []);
  // Özel malzeme sil (sadece ozel olanlar silinebilir)
  const removeMaterial = useCallback((key) => {
    setMaterials((m) => { if (!m[key]?.ozel) return m; const { [key]: _, ...rest } = m; return rest; });
  }, []);
  const setConstant = useCallback((path, val) =>
    setConstants((c) => setIn(c, path, val)), []);

  const sifirla = useCallback(() => {
    setRates({ ...defaultRates });
    const merged = {};
    for (const [k, v] of Object.entries(defaultMaterials)) merged[k] = { ...v };
    setMaterials(merged);
    setConstants(structuredClone(defaultConstants));
  }, []);

  // --- Kayıtlı ürünler ---
  const [urunler, setUrunler] = useState(() => {
    try { return JSON.parse(localStorage.getItem(LS_URUN)) || []; } catch { return []; }
  });
  useEffect(() => {
    try { localStorage.setItem(LS_URUN, JSON.stringify(urunler)); }
    catch (e) { console.warn('Ürünler kaydedilemedi (localStorage dolu olabilir):', e); }
  }, [urunler]);

  const urunEkle = useCallback((urun) => {
    setUrunler((u) => [{ ...urun, id: 'p_' + Date.now() }, ...u]);
  }, []);
  const urunSil = useCallback((id) => setUrunler((u) => u.filter((x) => x.id !== id)), []);
  const urunGuncelle = useCallback((id, patch) =>
    setUrunler((u) => u.map((x) => (x.id === id ? { ...x, ...patch } : x))), []);

  const prices = computePrices(rates, materials);

  return {
    rates, setRate, materials, setMaterialBase, addMaterial, removeMaterial,
    prices, constants, setConstant, sifirla,
    firma, setFirma,
    urunler, urunEkle, urunSil, urunGuncelle,
  };
}
