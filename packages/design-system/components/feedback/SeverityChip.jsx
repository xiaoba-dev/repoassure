import React from 'react';
const SEV={
  p0:{fg:'var(--sev-p0-fg)',bg:'var(--sev-p0-subtle)',bd:'var(--sev-p0-muted)',label:'P0'},
  p1:{fg:'var(--sev-p1-fg)',bg:'var(--sev-p1-subtle)',bd:'var(--sev-p1-muted)',label:'P1'},
  p2:{fg:'var(--sev-p2-fg)',bg:'var(--sev-p2-subtle)',bd:'var(--sev-p2-muted)',label:'P2'}
};
export function SeverityChip({level='p0',count,children}){
  const s=SEV[level]||SEV.p0;
  return <span style={{display:'inline-flex',alignItems:'center',gap:6,padding:'3px 9px',borderRadius:'var(--radius-sm)',fontFamily:'var(--font-mono)',fontSize:12.5,fontWeight:600,color:s.fg,background:s.bg,border:'1px solid '+s.bd,lineHeight:1.1,letterSpacing:'.02em'}}>
    <span style={{fontWeight:700}}>{s.label}</span>{children}{count!=null&&<span style={{opacity:.8}}>· {count}</span>}
  </span>;
}
