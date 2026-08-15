import React from 'react';
export function Terminal({title='hardening',lines=[],prompt='$'}){
  const color=(t)=>({cmd:'#e7edf5',out:'#8698ad',ok:'var(--green-3)',warn:'var(--amber-3)',err:'var(--red-3)',info:'var(--blue-3)'}[t]||'#8698ad');
  return <div style={{borderRadius:'var(--radius-panel)',overflow:'hidden',border:'1px solid var(--console-border)',background:'var(--console-bg)',fontFamily:'var(--font-mono)',boxShadow:'var(--shadow-panel)'}}>
    <div style={{display:'flex',alignItems:'center',gap:8,padding:'11px 16px',background:'var(--console-bg-chrome)',borderBottom:'1px solid var(--console-border)'}}>
      <span style={{display:'flex',gap:6}}><i style={{width:11,height:11,borderRadius:'50%',background:'#ff5f57',display:'block'}}/><i style={{width:11,height:11,borderRadius:'50%',background:'#febc2e',display:'block'}}/><i style={{width:11,height:11,borderRadius:'50%',background:'#28c840',display:'block'}}/></span>
      <span style={{marginLeft:6,fontSize:12.5,color:'var(--console-fg-muted)',letterSpacing:'.02em'}}>{title}</span>
    </div>
    <div style={{padding:'16px 18px',display:'grid',gap:5,fontSize:13.5,lineHeight:1.65}}>
      {lines.map((l,i)=>{const t=typeof l==='string'?{type:'out',text:l}:l;return <div key={i} style={{color:color(t.type),whiteSpace:'pre-wrap',wordBreak:'break-word'}}>{t.type==='cmd'&&<span style={{color:'var(--green-3)',marginRight:8}}>{prompt}</span>}{t.text}</div>;})}
    </div>
  </div>;
}
