import React from 'react';
let _i=false;function _inject(){if(_i||typeof document==='undefined')return;_i=true;const s=document.createElement('style');s.setAttribute('data-ra','iconbutton');s.textContent=`.ra-iconbtn{display:inline-flex;align-items:center;justify-content:center;border:1px solid transparent;border-radius:var(--radius-control);cursor:pointer;color:var(--fg-muted);background:transparent;transition:background var(--duration-base),color var(--duration-base),border-color var(--duration-base)}
.ra-iconbtn:hover:not([disabled]){background:var(--canvas-subtle);color:var(--fg-default)}
.ra-iconbtn:focus-visible{outline:none;box-shadow:0 0 0 3px color-mix(in srgb,var(--focus-ring) 45%,transparent)}
.ra-iconbtn[disabled]{opacity:.45;cursor:not-allowed}
.ra-iconbtn[data-variant=outline]{border-color:var(--border-default);background:var(--surface-default)}
.ra-iconbtn[data-size=sm]{width:32px;height:32px}
.ra-iconbtn[data-size=md]{width:40px;height:40px}
.ra-iconbtn[data-size=lg]{width:48px;height:48px}`;document.head.appendChild(s);}
export function IconButton({icon,label,variant='ghost',size='md',disabled,onClick}){
  _inject();
  return <button className="ra-iconbtn" data-variant={variant} data-size={size} aria-label={label} title={label} disabled={disabled} onClick={onClick}>{icon}</button>;
}
