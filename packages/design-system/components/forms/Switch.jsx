import React from 'react';
let _i=false;function _inject(){if(_i||typeof document==='undefined')return;_i=true;const s=document.createElement('style');s.setAttribute('data-ra','switch');s.textContent=`.ra-switch{display:inline-flex;gap:10px;align-items:center;font-family:var(--font-sans);font-size:15px;color:var(--fg-default);cursor:pointer}
.ra-switch input{position:absolute;opacity:0;width:0;height:0}
.ra-switch .track{flex:none;width:42px;height:24px;border-radius:999px;background:var(--border-strong);position:relative;transition:background var(--duration-base)}
.ra-switch .track::after{content:'';position:absolute;top:2px;left:2px;width:20px;height:20px;border-radius:50%;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.3);transition:transform var(--duration-base) var(--ease-out)}
.ra-switch input:checked+.track{background:var(--accent-emphasis)}
.ra-switch input:checked+.track::after{transform:translateX(18px)}
.ra-switch input:focus-visible+.track{box-shadow:0 0 0 3px color-mix(in srgb,var(--focus-ring) 45%,transparent)}
.ra-switch input:disabled~*{opacity:.5}`;document.head.appendChild(s);}
export function Switch({id,checked,defaultChecked,disabled,onChange,children}){
  _inject();
  return <label className="ra-switch" htmlFor={id}>
    <input id={id} type="checkbox" role="switch" checked={checked} defaultChecked={defaultChecked} disabled={disabled} onChange={onChange}/>
    <span className="track"></span>{children&&<span>{children}</span>}
  </label>;
}
