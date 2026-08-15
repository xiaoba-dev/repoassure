import React from 'react';
export function Avatar({name='',src,size=40,square=false}){
  const initials=name.split(/\s+/).filter(Boolean).slice(0,2).map(w=>w[0]).join('').toUpperCase();
  const hues=['var(--green-5)','var(--blue-5)','var(--violet-5)','var(--amber-5)'];
  const bg=hues[(name.charCodeAt(0)||0)%hues.length];
  return <span style={{width:size,height:size,borderRadius:square?'var(--radius-control)':'50%',background:src?'transparent':bg,color:'#fff',display:'grid',placeItems:'center',fontFamily:'var(--font-sans)',fontWeight:700,fontSize:size*0.4,overflow:'hidden',flex:'none',border:'1px solid var(--border-muted)'}}>
    {src?<img src={src} alt={name} style={{width:'100%',height:'100%',objectFit:'cover'}}/>:initials}
  </span>;
}
