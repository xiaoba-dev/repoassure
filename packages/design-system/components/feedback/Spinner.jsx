import React from 'react';
let _i=false;function _inject(){if(_i||typeof document==='undefined')return;_i=true;const s=document.createElement('style');s.setAttribute('data-ra','spinner');s.textContent=`@keyframes ra-spin{to{transform:rotate(360deg)}}`;document.head.appendChild(s);}
export function Spinner({size=24,label='Loading'}){
  _inject();
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" role="status" aria-label={label} style={{animation:'ra-spin .7s linear infinite',color:'var(--accent-emphasis)'}}>
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" opacity=".2"/>
    <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
  </svg>;
}
