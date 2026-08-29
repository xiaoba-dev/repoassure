import React from 'react';
export function StepCard({index,icon,title,children}){
  return <div style={{display:'grid',gap:14,alignContent:'start',padding:24,background:'var(--surface-default)',border:'1px solid var(--border-default)',borderRadius:'var(--radius-card)',fontFamily:'var(--font-sans)'}}>
    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
      <span style={{width:44,height:44,borderRadius:'var(--radius-lg)',background:'var(--accent-subtle)',color:'var(--accent-fg)',display:'grid',placeItems:'center'}}>{icon||<span style={{fontFamily:'var(--font-mono)',fontWeight:700,fontSize:16}}>{index}</span>}</span>
      {index!=null&&icon&&<span style={{fontFamily:'var(--font-mono)',fontSize:13,color:'var(--fg-subtle)'}}>{String(index).padStart(2,'0')}</span>}
    </div>
    <div style={{fontSize:17,fontWeight:700,color:'var(--fg-default)',letterSpacing:'-0.01em'}}>{title}</div>
    <div style={{fontSize:14.5,color:'var(--fg-muted)',lineHeight:1.6}}>{children}</div>
  </div>;
}
