import React from 'react';
const TONE={accent:'var(--accent-emphasis)',info:'var(--info-emphasis)',warning:'var(--warning-emphasis)',danger:'var(--danger-emphasis)'};
export function ProgressBar({value=0,max=100,tone='accent',label,showValue}){
  const pct=Math.max(0,Math.min(100,(value/max)*100));
  return <div style={{fontFamily:'var(--font-sans)',display:'grid',gap:7}}>
    {(label||showValue)&&<div style={{display:'flex',justifyContent:'space-between',fontSize:13,color:'var(--fg-muted)'}}><span>{label}</span>{showValue&&<span style={{fontFamily:'var(--font-mono)',color:'var(--fg-default)',fontWeight:600}}>{Math.round(pct)}%</span>}</div>}
    <div style={{height:8,borderRadius:999,background:'var(--canvas-inset)',overflow:'hidden'}} role="progressbar" aria-valuenow={value} aria-valuemax={max}>
      <div style={{height:'100%',width:pct+'%',borderRadius:999,background:TONE[tone]||TONE.accent,transition:'width .4s var(--ease-out)'}}/>
    </div>
  </div>;
}
