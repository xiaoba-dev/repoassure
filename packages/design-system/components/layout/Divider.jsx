import React from 'react';
export function Divider({label,spacing=24}){
  if(!label) return <hr style={{border:'none',borderTop:'1px solid var(--border-default)',margin:spacing+'px 0'}}/>;
  return <div style={{display:'flex',alignItems:'center',gap:14,margin:spacing+'px 0',fontFamily:'var(--font-sans)'}}>
    <span style={{flex:1,height:1,background:'var(--border-default)'}}/>
    <span style={{fontSize:11.5,fontWeight:700,letterSpacing:'.08em',textTransform:'uppercase',color:'var(--fg-subtle)'}}>{label}</span>
    <span style={{flex:1,height:1,background:'var(--border-default)'}}/>
  </div>;
}
