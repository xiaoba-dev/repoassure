import React from 'react';
let _i=false;function _inject(){if(_i||typeof document==='undefined')return;_i=true;const s=document.createElement('style');s.setAttribute('data-ra','themetoggle');s.textContent=`.ra-theme{display:inline-flex;padding:3px;gap:2px;border:1px solid var(--border-default);border-radius:var(--radius-pill);background:var(--surface-default)}
.ra-theme button{display:inline-flex;align-items:center;gap:6px;border:none;background:transparent;cursor:pointer;padding:7px 14px;border-radius:var(--radius-pill);font-family:var(--font-sans);font-size:13px;font-weight:600;color:var(--fg-muted);transition:background var(--duration-base),color var(--duration-base)}
.ra-theme button[aria-pressed=true]{background:var(--accent-subtle);color:var(--accent-fg)}
.ra-theme button:focus-visible{outline:none;box-shadow:0 0 0 3px color-mix(in srgb,var(--focus-ring) 45%,transparent)}`;document.head.appendChild(s);}
export function ThemeToggle({value='light',onChange}){
  _inject();
  const set=(v)=>{onChange?onChange(v):document.documentElement.setAttribute('data-theme',v);};
  return <div className="ra-theme" role="group" aria-label="Theme">
    <button aria-pressed={value==='light'} onClick={()=>set('light')}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="4.5"/><path d="M12 2v2M12 20v2M4 12H2M22 12h-2M5 5l1.5 1.5M17.5 17.5 19 19M19 5l-1.5 1.5M6.5 17.5 5 19"/></svg>Light</button>
    <button aria-pressed={value==='dark'} onClick={()=>set('dark')}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z"/></svg>Dark</button>
  </div>;
}
