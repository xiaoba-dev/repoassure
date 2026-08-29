import React from 'react';
export function TrustCard({icon,title,children}){
  return <article style={{display:'grid',gap:12,alignContent:'start',padding:24,background:'var(--surface-default)',border:'1px solid var(--border-default)',borderRadius:'var(--radius-card)',fontFamily:'var(--font-sans)'}}>
    {/* flex, not the default inline flow: an inline SVG sits on the text baseline, so the
        wrapper's height picks up the font's descender and every card in a row starts its
        title at a different y. */}
    <span style={{color:'var(--accent-fg)',display:'flex',width:'fit-content'}}>{icon||<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3 20 6.5v5c0 4.5-3.2 8-8 9.5-4.8-1.5-8-5-8-9.5v-5L12 3Z"/><path d="m9 12 2 2 4-5"/></svg>}</span>
    <div style={{fontSize:16.5,fontWeight:700,color:'var(--fg-default)',letterSpacing:'-0.01em'}}>{title}</div>
    <div style={{fontSize:14.5,color:'var(--fg-muted)',lineHeight:1.6}}>{children}</div>
  </article>;
}
