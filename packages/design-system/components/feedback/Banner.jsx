import React from 'react';
const V={info:'var(--info-emphasis)',success:'var(--accent-emphasis)',warning:'var(--warning-emphasis)',danger:'var(--danger-emphasis)'};
export function Banner({variant='info',children,action,onDismiss}){
  const accent=V[variant]||V.info;
  return <div style={{display:'flex',alignItems:'center',gap:14,padding:'12px 16px 12px 18px',borderRadius:'var(--radius-card)',background:'var(--surface-raised)',border:'1px solid var(--border-default)',borderLeft:'3px solid '+accent,boxShadow:'var(--shadow-resting)',fontFamily:'var(--font-sans)'}}>
    <div style={{flex:1,fontSize:14.5,color:'var(--fg-default)',lineHeight:1.5}}>{children}</div>
    {action}
    {onDismiss&&<button onClick={onDismiss} aria-label="Dismiss" style={{border:'none',background:'transparent',cursor:'pointer',color:'var(--fg-subtle)',display:'grid',placeItems:'center',padding:4}}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M6 6l12 12M18 6 6 18"/></svg></button>}
  </div>;
}
