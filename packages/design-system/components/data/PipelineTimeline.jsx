import React from 'react';
const S={done:'var(--success-fg)',active:'var(--info-fg)',pending:'var(--fg-subtle)',failed:'var(--danger-fg)'};
export function PipelineTimeline({steps=[]}){
  return <ol style={{listStyle:'none',margin:0,padding:0,display:'grid',gap:0,fontFamily:'var(--font-sans)'}}>
    {steps.map((s,i)=>{const col=S[s.state]||S.pending;const last=i===steps.length-1;return <li key={i} style={{display:'grid',gridTemplateColumns:'auto 1fr',gap:14}}>
      <div style={{display:'grid',justifyItems:'center',gap:0}}>
        <span style={{width:26,height:26,borderRadius:'50%',border:'2px solid '+col,background:s.state==='done'||s.state==='failed'?col:'var(--surface-default)',color:'#fff',display:'grid',placeItems:'center',flex:'none'}}>
          {s.state==='done'?<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m5 13 4 4 10-12"/></svg>:s.state==='failed'?<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M6 6l12 12M18 6 6 18"/></svg>:<span style={{width:7,height:7,borderRadius:'50%',background:col}}/>}
        </span>
        {!last&&<span style={{width:2,flex:1,minHeight:22,background:'var(--border-default)'}}/>}
      </div>
      <div style={{paddingBottom:last?0:18}}>
        <div style={{fontSize:14.5,fontWeight:600,color:'var(--fg-default)'}}>{s.title}</div>
        {s.detail&&<div style={{fontSize:13,color:'var(--fg-muted)',marginTop:2}}>{s.detail}</div>}
        {s.hash&&<div style={{fontFamily:'var(--font-mono)',fontSize:12,color:'var(--fg-subtle)',marginTop:4}}>{s.hash}</div>}
      </div>
    </li>;})}
  </ol>;
}
