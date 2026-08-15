import React from 'react';
export function DataTable({columns=[],rows=[],dense=false}){
  const pad=dense?'8px 12px':'12px 16px';
  return <div style={{border:'1px solid var(--border-default)',borderRadius:'var(--radius-card)',overflow:'hidden',fontFamily:'var(--font-sans)'}}>
    <table style={{width:'100%',borderCollapse:'collapse',fontSize:14}}>
      <thead><tr style={{background:'var(--canvas-subtle)'}}>
        {columns.map((c,i)=><th key={i} style={{textAlign:c.align||'left',padding:pad,fontSize:11.5,fontWeight:700,letterSpacing:'.06em',textTransform:'uppercase',color:'var(--fg-subtle)',borderBottom:'1px solid var(--border-default)'}}>{c.header}</th>)}
      </tr></thead>
      <tbody>{rows.map((r,ri)=><tr key={ri} style={{borderBottom:ri<rows.length-1?'1px solid var(--border-muted)':'none'}}>
        {columns.map((c,ci)=><td key={ci} style={{textAlign:c.align||'left',padding:pad,color:'var(--fg-default)',fontFamily:c.mono?'var(--font-mono)':'inherit',fontSize:c.mono?13:14}}>{r[c.key]}</td>)}
      </tr>)}</tbody>
    </table>
  </div>;
}
