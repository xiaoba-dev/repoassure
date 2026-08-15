import React from 'react';
const MAP={
  verified:{fg:'var(--success-fg)',bg:'var(--success-subtle)',bd:'var(--success-muted)',dot:true,label:'Verified'},
  hashed:{fg:'var(--verified-fg)',bg:'var(--verified-subtle)',bd:'var(--verified-muted)',dot:true,label:'Content-hashed'},
  local:{fg:'var(--info-fg)',bg:'var(--info-subtle)',bd:'var(--info-muted)',dot:true,label:'Local-only'},
  pending:{fg:'var(--warning-fg)',bg:'var(--warning-subtle)',bd:'var(--warning-muted)',dot:true,label:'Pending'},
  failed:{fg:'var(--danger-fg)',bg:'var(--danger-subtle)',bd:'var(--danger-muted)',dot:true,label:'Failed'},
  neutral:{fg:'var(--fg-muted)',bg:'var(--canvas-subtle)',bd:'var(--border-default)',dot:false,label:'—'}
};
export function StatusChip({status='verified',children}){
  const s=MAP[status]||MAP.neutral;
  return <span style={{display:'inline-flex',alignItems:'center',gap:7,padding:'4px 11px 4px 9px',borderRadius:'var(--radius-pill)',fontFamily:'var(--font-sans)',fontSize:13,fontWeight:600,color:s.fg,background:s.bg,border:'1px solid '+s.bd,lineHeight:1}}>
    {s.dot&&<span style={{width:7,height:7,borderRadius:'50%',background:'currentColor'}}/>}
    {children||s.label}
  </span>;
}
