import React from 'react';
export function BrandMark({size=32,lockup=false,color}){
  const mark=(
    <svg width={size} height={size} viewBox="0 0 64 64" role="img" aria-label="RepoAssure">
      <path d="M32 5 L55.4 18.5 L55.4 45.5 L32 59 L8.6 45.5 L8.6 18.5 Z" fill="var(--canvas-inset,#0a1420)" stroke="var(--accent-emphasis,#22c06f)" strokeWidth="3.4" strokeLinejoin="round"/>
      <path d="M21 33 L29 41 L44 23" fill="none" stroke="var(--accent-emphasis,#22c06f)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>);
  if(!lockup) return mark;
  return <span style={{display:'inline-flex',alignItems:'center',gap:size*0.34,fontFamily:'var(--font-display)',fontWeight:700,fontSize:size*0.82,letterSpacing:'-0.02em',color:color||'var(--fg-default)'}}>{mark}<span>Repo<span style={{color:'var(--accent-fg)'}}>Assure</span></span></span>;
}
