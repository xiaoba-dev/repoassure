import React from 'react';
export function ScoreGauge({score=85,max=100,size=112,label='Readiness score',breakdown}){
  const pct=Math.max(0,Math.min(1,score/max));
  const r=(size-16)/2, c=2*Math.PI*r, cx=size/2;
  const tone=pct>=0.8?'var(--success-emphasis)':pct>=0.5?'var(--warning-emphasis)':'var(--danger-emphasis)';
  return <div style={{display:'flex',alignItems:'center',gap:20,fontFamily:'var(--font-sans)'}}>
    <svg width={size} height={size} viewBox={'0 0 '+size+' '+size} style={{flex:'none'}}>
      <circle cx={cx} cy={cx} r={r} fill="none" stroke="var(--border-default)" strokeWidth="9"/>
      <circle cx={cx} cy={cx} r={r} fill="none" stroke={tone} strokeWidth="9" strokeLinecap="round" strokeDasharray={(c*pct)+' '+c} transform={'rotate(-90 '+cx+' '+cx+')'}/>
      <text x={cx} y={cx-2} textAnchor="middle" fontFamily="var(--font-mono)" fontSize={size*0.28} fontWeight="700" fill="var(--fg-default)">{score}</text>
      <text x={cx} y={cx+size*0.16} textAnchor="middle" fontFamily="var(--font-sans)" fontSize={size*0.1} fill="var(--fg-subtle)">/ {max}</text>
    </svg>
    <div style={{display:'grid',gap:8}}>
      <span style={{fontSize:11.5,fontWeight:700,letterSpacing:'.08em',textTransform:'uppercase',color:'var(--fg-subtle)'}}>{label}</span>
      <div style={{display:'flex',gap:16,fontFamily:'var(--font-mono)',fontSize:13}}>
        {(breakdown||[{k:'P0',v:0,c:'var(--sev-p0-fg)'},{k:'P1',v:1,c:'var(--sev-p1-fg)'}]).map((b,i)=><span key={i} style={{color:b.c}}>{b.k}: {b.v}</span>)}
      </div>
    </div>
  </div>;
}
