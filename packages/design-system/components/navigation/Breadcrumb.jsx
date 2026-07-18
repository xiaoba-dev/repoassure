import React from 'react';
export function Breadcrumb({items=[]}){
  return <nav aria-label="Breadcrumb" style={{fontFamily:'var(--font-sans)'}}><ol style={{display:'flex',flexWrap:'wrap',alignItems:'center',gap:8,listStyle:'none',margin:0,padding:0,fontSize:14}}>
    {items.map((it,i)=>{const last=i===items.length-1;return <li key={i} style={{display:'flex',alignItems:'center',gap:8}}>
      {last?<span aria-current="page" style={{color:'var(--fg-default)',fontWeight:600}}>{it.label}</span>:<a href={it.href} style={{color:'var(--fg-muted)',textDecoration:'none'}}>{it.label}</a>}
      {!last&&<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--fg-subtle)" strokeWidth="2"><path d="m9 6 6 6-6 6"/></svg>}
    </li>;})}
  </ol></nav>;
}
