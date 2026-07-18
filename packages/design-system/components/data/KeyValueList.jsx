import React from 'react';
export function KeyValueList({items=[],columns=1}){
  return <dl style={{display:'grid',gridTemplateColumns:'repeat('+columns+',1fr)',gap:'2px',margin:0,fontFamily:'var(--font-sans)',border:'1px solid var(--border-default)',borderRadius:'var(--radius-card)',overflow:'hidden',background:'var(--border-muted)'}}>
    {items.map((it,i)=><div key={i} style={{display:'grid',gap:3,padding:'12px 16px',background:'var(--surface-default)'}}>
      <dt style={{fontSize:11.5,fontWeight:700,letterSpacing:'.06em',textTransform:'uppercase',color:'var(--fg-subtle)'}}>{it.label}</dt>
      <dd style={{margin:0,fontSize:14.5,fontWeight:500,color:'var(--fg-default)',fontFamily:it.mono?'var(--font-mono)':'inherit'}}>{it.value}</dd>
    </div>)}
  </dl>;
}
