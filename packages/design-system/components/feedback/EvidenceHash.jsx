import React from 'react';
let _i=false;function _inject(){if(_i||typeof document==='undefined')return;_i=true;const s=document.createElement('style');s.setAttribute('data-ra','hash');s.textContent=`.ra-hash{display:inline-flex;align-items:center;gap:8px;font-family:var(--font-mono);font-size:12.5px;color:var(--fg-muted);background:var(--canvas-inset);border:1px solid var(--border-muted);border-radius:var(--radius-sm);padding:4px 8px;max-width:100%}
.ra-hash .val{color:var(--fg-default);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.ra-hash .lbl{color:var(--fg-subtle);text-transform:uppercase;letter-spacing:.06em;font-size:10.5px;font-weight:600}
.ra-hash button{border:none;background:transparent;cursor:pointer;color:var(--fg-subtle);display:grid;place-items:center;padding:2px;border-radius:4px}
.ra-hash button:hover{color:var(--accent-fg)}`;document.head.appendChild(s);}
export function EvidenceHash({label='sha256',value='',truncate=true}){
  _inject();
  const shown=truncate&&value.length>20?value.slice(0,10)+'…'+value.slice(-6):value;
  const copy=()=>{try{navigator.clipboard.writeText(value);}catch(e){}};
  return <span className="ra-hash">{label&&<span className="lbl">{label}</span>}<span className="val" title={value}>{shown}</span>
    <button onClick={copy} aria-label="Copy"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg></button>
  </span>;
}
