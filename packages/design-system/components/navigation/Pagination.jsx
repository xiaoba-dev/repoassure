import React from 'react';
let _i=false;function _inject(){if(_i||typeof document==='undefined')return;_i=true;const s=document.createElement('style');s.setAttribute('data-ra','pagination');s.textContent=`.ra-page{display:inline-flex;gap:4px;font-family:var(--font-sans)}
.ra-page button{min-width:38px;height:38px;padding:0 10px;border:1px solid var(--border-default);background:var(--surface-default);border-radius:var(--radius-control);cursor:pointer;font-size:14px;font-weight:600;color:var(--fg-muted);display:inline-flex;align-items:center;justify-content:center;gap:5px;transition:background var(--duration-base),color var(--duration-base)}
.ra-page button:hover:not(:disabled){background:var(--canvas-subtle);color:var(--fg-default)}
.ra-page button[aria-current=true]{background:var(--accent-subtle);border-color:var(--accent-muted);color:var(--accent-fg)}
.ra-page button:disabled{opacity:.4;cursor:not-allowed}
.ra-page span{display:inline-flex;align-items:center;padding:0 6px;color:var(--fg-subtle)}`;document.head.appendChild(s);}
export function Pagination({page=1,total=1,onChange}){
  _inject();
  const go=(p)=>p>=1&&p<=total&&onChange&&onChange(p);
  const pages=[];for(let i=1;i<=total;i++){if(i===1||i===total||Math.abs(i-page)<=1)pages.push(i);else if(pages[pages.length-1]!=='…')pages.push('…');}
  return <nav className="ra-page" aria-label="Pagination">
    <button onClick={()=>go(page-1)} disabled={page<=1} aria-label="Previous"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="m15 6-6 6 6 6"/></svg></button>
    {pages.map((p,i)=>p==='…'?<span key={i}>…</span>:<button key={i} aria-current={p===page} onClick={()=>go(p)}>{p}</button>)}
    <button onClick={()=>go(page+1)} disabled={page>=total} aria-label="Next"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="m9 6 6 6-6 6"/></svg></button>
  </nav>;
}
