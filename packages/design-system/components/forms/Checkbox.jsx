import React from 'react';
let _i=false;function _inject(){if(_i||typeof document==='undefined')return;_i=true;const s=document.createElement('style');s.setAttribute('data-ra','checkbox');s.textContent=`.ra-check{display:inline-flex;gap:10px;align-items:flex-start;font-family:var(--font-sans);font-size:15px;color:var(--fg-default);cursor:pointer}
.ra-check input{position:absolute;opacity:0;width:0;height:0}
.ra-check .box{flex:none;width:20px;height:20px;border:1px solid var(--border-strong);border-radius:6px;background:var(--surface-default);display:grid;place-items:center;color:#fff;transition:background var(--duration-base),border-color var(--duration-base);margin-top:1px}
.ra-check .box svg{opacity:0;transition:opacity var(--duration-fast)}
.ra-check input:checked+.box{background:var(--accent-emphasis);border-color:var(--accent-emphasis)}
.ra-check input:checked+.box svg{opacity:1}
.ra-check input:indeterminate+.box{background:var(--accent-emphasis);border-color:var(--accent-emphasis)}
.ra-check input:focus-visible+.box{box-shadow:0 0 0 3px color-mix(in srgb,var(--focus-ring) 45%,transparent)}
.ra-check input:disabled~*{opacity:.5}`;document.head.appendChild(s);}
export function Checkbox({id,checked,defaultChecked,indeterminate,disabled,onChange,children}){
  _inject();
  const ref=React.useRef(null);
  React.useEffect(()=>{if(ref.current)ref.current.indeterminate=!!indeterminate;},[indeterminate]);
  return <label className="ra-check" htmlFor={id}>
    <input ref={ref} id={id} type="checkbox" checked={checked} defaultChecked={defaultChecked} disabled={disabled} onChange={onChange}/>
    <span className="box"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">{indeterminate?<path d="M6 12h12"/>:<path d="m5 13 4 4 10-12"/>}</svg></span>
    {children&&<span style={{lineHeight:1.4}}>{children}</span>}
  </label>;
}
