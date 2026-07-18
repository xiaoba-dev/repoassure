import React from 'react';
let _i=false;function _inject(){if(_i||typeof document==='undefined')return;_i=true;const s=document.createElement('style');s.setAttribute('data-ra','lang');s.textContent=`.ra-lang{display:inline-flex;align-items:center;gap:6px;border:1px solid var(--border-default);background:var(--surface-default);border-radius:var(--radius-pill);padding:6px 12px;font-family:var(--font-sans);font-size:13.5px;font-weight:600;color:var(--fg-default);cursor:pointer;position:relative}
.ra-lang select{position:absolute;inset:0;opacity:0;cursor:pointer;font-size:13px}
.ra-lang:hover{border-color:var(--fg-subtle)}`;document.head.appendChild(s);}
export function LanguageSwitcher({value='en',onChange,languages}){
  _inject();
  const langs=languages||[{code:'en',label:'English'},{code:'zh-CN',label:'简体中文'},{code:'ja',label:'日本語'},{code:'ko',label:'한국어'}];
  const cur=langs.find(l=>l.code===value)||langs[0];
  return <label className="ra-lang">
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18"/></svg>
    {cur.label}
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--fg-subtle)" strokeWidth="2.2"><path d="m6 9 6 6 6-6"/></svg>
    <select value={value} onChange={e=>onChange&&onChange(e.target.value)}>{langs.map(l=><option key={l.code} value={l.code}>{l.label}</option>)}</select>
  </label>;
}
