// Ortak form kontrolleri
import React from 'react';

export const fmt = (n) => (n ?? 0).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function Section({ title, children }) {
  return (
    <fieldset className="section">
      <legend>{title}</legend>
      <div className="section-body">{children}</div>
    </fieldset>
  );
}

// Sayısal giriş
export function Num({ label, value, onChange, step = 1, suffix, min }) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      <span className="field-input">
        <input
          type="number"
          value={value}
          step={step}
          min={min}
          onChange={(e) => onChange(e.target.value === '' ? 0 : parseFloat(e.target.value))}
        />
        {suffix && <em className="suffix">{suffix}</em>}
      </span>
    </label>
  );
}

// Evet/Hayır anahtarı (0/1)
export function Toggle({ label, value, onChange }) {
  return (
    <button
      type="button"
      className={`toggle ${value ? 'on' : ''}`}
      onClick={() => onChange(value ? 0 : 1)}
    >
      <span className="toggle-knob" />
      <span className="toggle-text">{label}</span>
      <span className="toggle-state">{value ? 'EVET' : 'HAYIR'}</span>
    </button>
  );
}

// Tekli seçim (radio grubu) — birbirini dışlayan seçenekler
export function Radio({ label, value, options, onChange }) {
  return (
    <div className="radio-group">
      {label && <span className="field-label">{label}</span>}
      <div className="radio-options">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            className={`chip ${value === o.value ? 'active' : ''}`}
            onClick={() => onChange(o.value)}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// Açılır liste
export function Select({ label, value, options, onChange }) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      <span className="field-input">
        <select value={value} onChange={(e) => onChange(e.target.value)}>
          {options.map((o) => (
            <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>
          ))}
        </select>
      </span>
    </label>
  );
}
