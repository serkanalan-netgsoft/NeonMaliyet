import { useState, useEffect, useCallback } from 'react';
import { defaultRates, defaultMaterials, defaultConstants, computePrices } from './data/pricing.js';

const LS_KEY = 'neonMaliyet.ayarlar.v1';

function loadSaved() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch { return null; }
}

// Ayar deposu: kurlar + malzeme baz fiyatları (localStorage'da kalıcı)
export function useAyarlar() {
  const [rates, setRates] = useState(() => ({ ...defaultRates, ...(loadSaved()?.rates || {}) }));
  const [materials, setMaterials] = useState(() => {
    const saved = loadSaved()?.materials || {};
    const merged = {};
    for (const [k, v] of Object.entries(defaultMaterials)) merged[k] = { ...v, ...(saved[k] || {}) };
    return merged;
  });

  useEffect(() => {
    // Sadece değişen alanları (baz fiyat) sakla
    const matBase = {};
    for (const [k, v] of Object.entries(materials)) matBase[k] = { base: v.base, cur: v.cur };
    localStorage.setItem(LS_KEY, JSON.stringify({ rates, materials: matBase }));
  }, [rates, materials]);

  const setRate = useCallback((key, val) => setRates((r) => ({ ...r, [key]: val })), []);
  const setMaterialBase = useCallback((key, base) =>
    setMaterials((m) => ({ ...m, [key]: { ...m[key], base } })), []);
  const sifirla = useCallback(() => {
    setRates({ ...defaultRates });
    const merged = {};
    for (const [k, v] of Object.entries(defaultMaterials)) merged[k] = { ...v };
    setMaterials(merged);
  }, []);

  const prices = computePrices(rates, materials);

  return { rates, setRate, materials, setMaterialBase, prices, constants: defaultConstants, sifirla };
}
