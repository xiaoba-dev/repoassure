import React from 'react';
export function Panel({title,eyebrow,grid=true,action,children}){
  return <div style={{position:'relative',background:'var(--console-bg)',border:'1px solid var(--console-border)',borderRadius:'var(--radius-panel)',overflow:'hidden',fontFamily:'var(--font-sans)',boxShadow:'var(--shadow-panel)'}}>
    {grid&&<div style={{position:'absolute',inset:0,backgroundImage:'linear-gradient(var(--grid-line) 1px,transparent 1px),linear-gradient(90deg,var(--grid-line) 1px,transparent 1px)',backgroundSize:'var(--grid-size) var(--grid-size)',pointerEvents:'none'}}/>}
    <div style={{position:'absolute',inset:0,background:'var(--gradient-ambient)',pointerEvents:'none'}}/>
    <div style={{position:'relative',padding:'22px 24px'}}>
      {(title||eyebrow||action)&&<div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:18}}>
        <div style={{display:'grid',gap:4}}>
          {eyebrow&&<span style={{fontSize:11.5,fontWeight:700,letterSpacing:'.08em',textTransform:'uppercase',color:'var(--green-3)'}}>{eyebrow}</span>}
          {title&&<span style={{fontSize:18,fontWeight:700,color:'var(--console-fg)',letterSpacing:'-0.01em'}}>{title}</span>}
        </div>{action}
      </div>}
      {children}
    </div>
  </div>;
}
