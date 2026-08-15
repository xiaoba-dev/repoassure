import React from 'react';
const V={
  success:{c:'var(--success-fg)',icon:<><circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/></>},
  danger:{c:'var(--danger-fg)',icon:<><circle cx="12" cy="12" r="9"/><path d="M12 8v4M12 16h.01"/></>},
  info:{c:'var(--info-fg)',icon:<><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 7.5h.01"/></>}
};
export function Toast({variant='success',title,description,onDismiss}){
  const v=V[variant]||V.success;
  return <div role="status" style={{display:'flex',gap:12,alignItems:'flex-start',width:360,padding:'14px 14px 14px 16px',borderRadius:'var(--radius-card)',background:'var(--surface-overlay)',border:'1px solid var(--border-default)',boxShadow:'var(--shadow-overlay)',fontFamily:'var(--font-sans)'}}>
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke={v.c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{flex:'none',marginTop:1}}>{v.icon}</svg>
    <div style={{flex:1,display:'grid',gap:2}}>
      <div style={{fontWeight:700,fontSize:14.5,color:'var(--fg-default)'}}>{title}</div>
      {description&&<div style={{fontSize:13.5,color:'var(--fg-muted)',lineHeight:1.5}}>{description}</div>}
    </div>
    {onDismiss&&<button onClick={onDismiss} aria-label="Dismiss" style={{border:'none',background:'transparent',cursor:'pointer',color:'var(--fg-subtle)',padding:2,display:'grid',placeItems:'center'}}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M6 6l12 12M18 6 6 18"/></svg></button>}
  </div>;
}
