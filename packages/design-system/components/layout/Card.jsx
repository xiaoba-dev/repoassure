import React from 'react';
export function Card({title,subtitle,media,footer,interactive,children}){
  return <div style={{background:'var(--surface-default)',border:'1px solid var(--border-default)',borderRadius:'var(--radius-card)',overflow:'hidden',fontFamily:'var(--font-sans)',boxShadow:interactive?'var(--shadow-resting)':'none',transition:'box-shadow var(--duration-base),border-color var(--duration-base)'}}>
    {media&&<div style={{borderBottom:'1px solid var(--border-muted)'}}>{media}</div>}
    <div style={{padding:20,display:'grid',gap:8}}>
      {title&&<div style={{fontSize:17,fontWeight:700,color:'var(--fg-default)',letterSpacing:'-0.01em'}}>{title}</div>}
      {subtitle&&<div style={{fontSize:13.5,color:'var(--fg-subtle)'}}>{subtitle}</div>}
      {children&&<div style={{fontSize:14.5,color:'var(--fg-muted)',lineHeight:1.6}}>{children}</div>}
    </div>
    {footer&&<div style={{padding:'14px 20px',borderTop:'1px solid var(--border-muted)',background:'var(--canvas-subtle)'}}>{footer}</div>}
  </div>;
}
