import React from 'react';
const DOT={verified:'var(--success-fg)',signed:'var(--signed-fg)',pending:'var(--warning-fg)',failed:'var(--danger-fg)'};
export function EvidenceRow({status='verified',artifact,summary,hash,timestamp}){
  return <div style={{display:'grid',gridTemplateColumns:'auto 1fr auto',gap:16,alignItems:'center',padding:'14px 18px',borderBottom:'1px solid var(--border-muted)',fontFamily:'var(--font-sans)'}}>
    <span style={{width:9,height:9,borderRadius:'50%',background:DOT[status]||'var(--fg-subtle)',boxShadow:'0 0 0 4px color-mix(in srgb,'+(DOT[status]||'var(--fg-subtle)')+' 18%,transparent)'}}/>
    <span style={{display:'grid',gap:2,minWidth:0}}>
      <span style={{fontSize:14.5,fontWeight:600,color:'var(--fg-default)'}}>{artifact}</span>
      {summary&&<span style={{fontSize:13,color:'var(--fg-muted)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{summary}</span>}
    </span>
    <span style={{display:'grid',gap:3,justifyItems:'end',textAlign:'right'}}>
      {hash&&<span style={{fontFamily:'var(--font-mono)',fontSize:12,color:'var(--fg-muted)'}}>{hash}</span>}
      {timestamp&&<span style={{fontSize:11.5,color:'var(--fg-subtle)'}}>{timestamp}</span>}
    </span>
  </div>;
}
