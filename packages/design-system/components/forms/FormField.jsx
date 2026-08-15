import React from 'react';
export function FormField({label,hint,error,required,htmlFor,children}){
  return <div style={{display:'grid',gap:7,fontFamily:'var(--font-sans)'}}>
    {label&&<label htmlFor={htmlFor} style={{fontSize:14,fontWeight:600,color:'var(--fg-default)',display:'flex',gap:5,alignItems:'center'}}>{label}{required&&<span style={{color:'var(--danger-fg)'}} aria-hidden="true">*</span>}</label>}
    {children}
    {error?<span style={{fontSize:13,color:'var(--danger-fg)',display:'flex',gap:5,alignItems:'center'}}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="12" cy="12" r="9"/><path d="M12 8v4M12 16h.01"/></svg>{error}</span>
      :hint?<span style={{fontSize:13,color:'var(--fg-subtle)'}}>{hint}</span>:null}
  </div>;
}
