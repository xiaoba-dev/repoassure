import React from 'react';
const V={
  info:{fg:'var(--info-fg)',bg:'var(--info-subtle)',bd:'var(--info-muted)',icon:<><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 7.5h.01"/></>},
  success:{fg:'var(--success-fg)',bg:'var(--success-subtle)',bd:'var(--success-muted)',icon:<><circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/></>},
  warning:{fg:'var(--warning-fg)',bg:'var(--warning-subtle)',bd:'var(--warning-muted)',icon:<><path d="M12 3 22 20H2L12 3Z"/><path d="M12 10v4M12 17h.01"/></>},
  danger:{fg:'var(--danger-fg)',bg:'var(--danger-subtle)',bd:'var(--danger-muted)',icon:<><circle cx="12" cy="12" r="9"/><path d="M12 8v4M12 16h.01"/></>}
};
export function Callout({variant='info',title,children}){
  const v=V[variant]||V.info;
  return <div style={{display:'flex',gap:12,padding:'14px 16px',borderRadius:'var(--radius-card)',background:v.bg,border:'1px solid '+v.bd,fontFamily:'var(--font-sans)'}}>
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke={v.fg} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{flex:'none',marginTop:1}}>{v.icon}</svg>
    <div style={{display:'grid',gap:3}}>
      {title&&<div style={{fontWeight:700,fontSize:14.5,color:'var(--fg-default)'}}>{title}</div>}
      <div style={{fontSize:14,lineHeight:1.55,color:'var(--fg-muted)'}}>{children}</div>
    </div>
  </div>;
}
