import React from 'react';
let _i=false;function _inject(){if(_i||typeof document==='undefined')return;_i=true;const s=document.createElement('style');s.setAttribute('data-ra','link');s.textContent=`.ra-link{color:var(--link-fg);font-family:var(--font-sans);text-decoration:none;font-weight:500;display:inline-flex;align-items:center;gap:5px;border-radius:4px;transition:color var(--duration-base)}
.ra-link:hover{color:var(--link-hover-fg)}
.ra-link:focus-visible{outline:none;box-shadow:0 0 0 3px color-mix(in srgb,var(--focus-ring) 45%,transparent)}
.ra-link[data-muted=true]{color:var(--fg-muted)}
.ra-link[data-muted=true]:hover{color:var(--fg-default)}`;document.head.appendChild(s);}
export function Link({href,muted,external,onClick,children}){
  _inject();
  return <a className="ra-link" data-muted={muted?'true':undefined} href={href} onClick={onClick} target={external?'_blank':undefined} rel={external?'noreferrer noopener':undefined}>{children}{external&&<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M7 17 17 7M8 7h9v9"/></svg>}</a>;
}
