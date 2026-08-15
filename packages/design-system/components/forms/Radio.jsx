import React from 'react';
let _i=false;function _inject(){if(_i||typeof document==='undefined')return;_i=true;const s=document.createElement('style');s.setAttribute('data-ra','radio');s.textContent=`.ra-radio{display:inline-flex;gap:10px;align-items:flex-start;font-family:var(--font-sans);font-size:15px;color:var(--fg-default);cursor:pointer}
.ra-radio input{position:absolute;opacity:0;width:0;height:0}
.ra-radio .dot{flex:none;width:20px;height:20px;border:1px solid var(--border-strong);border-radius:50%;background:var(--surface-default);display:grid;place-items:center;transition:border-color var(--duration-base);margin-top:1px}
.ra-radio .dot::after{content:'';width:10px;height:10px;border-radius:50%;background:var(--accent-emphasis);transform:scale(0);transition:transform var(--duration-base) var(--ease-out)}
.ra-radio input:checked+.dot{border-color:var(--accent-emphasis)}
.ra-radio input:checked+.dot::after{transform:scale(1)}
.ra-radio input:focus-visible+.dot{box-shadow:0 0 0 3px color-mix(in srgb,var(--focus-ring) 45%,transparent)}
.ra-radio input:disabled~*{opacity:.5}`;document.head.appendChild(s);}
export function Radio({id,name,value,checked,defaultChecked,disabled,onChange,children}){
  _inject();
  return <label className="ra-radio" htmlFor={id}>
    <input id={id} type="radio" name={name} value={value} checked={checked} defaultChecked={defaultChecked} disabled={disabled} onChange={onChange}/>
    <span className="dot"></span>{children&&<span style={{lineHeight:1.4}}>{children}</span>}
  </label>;
}
