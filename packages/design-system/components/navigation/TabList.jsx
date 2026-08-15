import React from 'react';
let _i=false;function _inject(){if(_i||typeof document==='undefined')return;_i=true;const s=document.createElement('style');s.setAttribute('data-ra','tablist');s.textContent=`.ra-tabs{display:flex;gap:2px;border-bottom:1px solid var(--border-default);font-family:var(--font-sans)}
.ra-tabs button{position:relative;border:none;background:transparent;cursor:pointer;padding:11px 16px;font-size:14.5px;font-weight:600;color:var(--fg-muted);display:inline-flex;align-items:center;gap:8px;transition:color var(--duration-base)}
.ra-tabs button:hover{color:var(--fg-default)}
.ra-tabs button[aria-selected=true]{color:var(--accent-fg)}
.ra-tabs button[aria-selected=true]::after{content:'';position:absolute;left:8px;right:8px;bottom:-1px;height:2px;background:var(--accent-emphasis);border-radius:2px}
.ra-tabs button:focus-visible{outline:none;box-shadow:0 0 0 3px color-mix(in srgb,var(--focus-ring) 40%,transparent);border-radius:6px}
.ra-tabs .count{font-family:var(--font-mono);font-size:11.5px;padding:1px 7px;border-radius:999px;background:var(--canvas-inset);color:var(--fg-muted)}`;document.head.appendChild(s);}
export function TabList({tabs=[],value,onChange}){
  _inject();
  const active=value??(tabs[0]&&tabs[0].id);
  return <div className="ra-tabs" role="tablist">{tabs.map(t=><button key={t.id} role="tab" aria-selected={t.id===active} onClick={()=>onChange&&onChange(t.id)}>{t.label}{t.count!=null&&<span className="count">{t.count}</span>}</button>)}</div>;
}
