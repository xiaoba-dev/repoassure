import React from 'react';
let _i=false;function _inject(){if(_i||typeof document==='undefined')return;_i=true;const s=document.createElement('style');s.setAttribute('data-ra','field');s.textContent=`.ra-field{width:100%;font-family:var(--font-sans);font-size:15px;color:var(--fg-default);background:var(--surface-default);border:1px solid var(--border-strong);border-radius:var(--radius-control);transition:border-color var(--duration-base),box-shadow var(--duration-base)}
.ra-field::placeholder{color:var(--fg-subtle)}
.ra-field:hover:not(:disabled):not([data-invalid=true]){border-color:var(--fg-subtle)}
.ra-field:focus{outline:none;border-color:var(--focus-ring);box-shadow:0 0 0 3px color-mix(in srgb,var(--focus-ring) 40%,transparent)}
.ra-field:disabled{opacity:.55;cursor:not-allowed;background:var(--canvas-subtle)}
.ra-field[data-invalid=true]{border-color:var(--danger-emphasis)}
.ra-field[data-invalid=true]:focus{box-shadow:0 0 0 3px color-mix(in srgb,var(--danger-emphasis) 35%,transparent)}`;document.head.appendChild(s);}
export function Select({id,value,defaultValue,invalid,disabled,options=[],onChange}){
  _inject();
  return <span style={{position:'relative',display:'block'}}>
    <select id={id} className="ra-field" style={{height:44,padding:'0 38px 0 14px',appearance:'none',cursor:disabled?'not-allowed':'pointer'}} value={value} defaultValue={defaultValue} disabled={disabled} data-invalid={invalid?'true':undefined} aria-invalid={invalid||undefined} onChange={onChange}>
      {options.map(o=>{const v=typeof o==='string'?o:o.value;const l=typeof o==='string'?o:o.label;return <option key={v} value={v}>{l}</option>;})}
    </select>
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--fg-subtle)" strokeWidth="2.2" style={{position:'absolute',right:13,top:'50%',transform:'translateY(-50%)',pointerEvents:'none'}}><path d="m6 9 6 6 6-6"/></svg>
  </span>;
}
