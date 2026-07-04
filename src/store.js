import { useState, useEffect, useCallback } from 'react';
import { defaultRates, defaultMaterials, defaultConstants, computePrices } from './data/pricing.js';

const LS_KEY = 'neonMaliyet.ayarlar.v2';

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
    return merged;
  });
  const [constants, setConstants] = useState(() => deepMerge(defaultConstants, saved?.constants));

  useEffect(() => {
    const matBase = {};
    for (const [k, v] of Object.entries(materials)) matBase[k] = { base: v.base, cur: v.cur };
    localStorage.setItem(LS_KEY, JSON.stringify({ rates, materials: matBase, constants }));
  }, [rates, materials, constants]);

  const setRate = useCallback((key, val) => setRates((r) => ({ ...r, [key]: val })), []);
  const setMaterialBase = useCallback((key, base) =>
    setMaterials((m) => ({ ...m, [key]: { ...m[key], base } })), []);
  const setConstant = useCallback((path, val) =>
    setConstants((c) => setIn(c, path, val)), []);

  const sifirla = useCallback(() => {
    setRates({ ...defaultRates });
    const merged = {};
    for (const [k, v] of Object.entries(defaultMaterials)) merged[k] = { ...v };
    setMaterials(merged);
    setConstants(structuredClone(defaultConstants));
  }, []);

  const prices = computePrices(rates, materials);

  return { rates, setRate, materials, setMaterialBase, prices, constants, setConstant, sifirla };
}
