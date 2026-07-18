import React from 'react';
let _i=false;function _inject(){if(_i||typeof document==='undefined')return;_i=true;const s=document.createElement('style');s.setAttribute('data-ra','field');s.textContent=`.ra-field{width:100%;font-family:var(--font-sans);font-size:15px;color:var(--fg-default);background:var(--surface-default);border:1px solid var(--border-strong);border-radius:var(--radius-control);transition:border-color var(--duration-base),box-shadow var(--duration-base)}
.ra-field::placeholder{color:var(--fg-subtle)}
.ra-field:hover:not(:disabled):not([data-invalid=true]){border-color:var(--fg-subtle)}
.ra-field:focus{outline:none;border-color:var(--focus-ring);box-shadow:0 0 0 3px color-mix(in srgb,var(--focus-ring) 40%,transparent)}
.ra-field:disabled{opacity:.55;cursor:not-allowed;background:var(--canvas-subtle)}
.ra-field[data-invalid=true]{border-color:var(--danger-emphasis)}
.ra-field[data-invalid=true]:focus{box-shadow:0 0 0 3px color-mix(in srgb,var(--danger-emphasis) 35%,transparent)}`;document.head.appendChild(s);}
export function Textarea({id,placeholder,value,defaultValue,rows=4,invalid,disabled,onChange}){
  _inject();
  return <textarea id={id} className="ra-field" style={{padding:'11px 14px',lineHeight:1.55,resize:'vertical',minHeight:88}} rows={rows} placeholder={placeholder} value={value} defaultValue={defaultValue} disabled={disabled} data-invalid={invalid?'true':undefined} aria-invalid={invalid||undefined} onChange={onChange}/>;
}
