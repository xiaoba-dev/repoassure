import React from 'react';
let _i=false;function _inject(){if(_i||typeof document==='undefined')return;_i=true;const s=document.createElement('style');s.setAttribute('data-ra','tooltip');s.textContent=`.ra-tip{position:relative;display:inline-flex}
.ra-tip>.tip{position:absolute;bottom:calc(100% + 8px);left:50%;transform:translateX(-50%) translateY(4px);background:var(--ink-11);color:var(--ink-0);font-family:var(--font-sans);font-size:12.5px;font-weight:500;padding:6px 10px;border-radius:7px;white-space:nowrap;opacity:0;pointer-events:none;transition:opacity var(--duration-base),transform var(--duration-base);box-shadow:var(--shadow-overlay);z-index:20}
.ra-tip>.tip::after{content:'';position:absolute;top:100%;left:50%;transform:translateX(-50%);border:5px solid transparent;border-top-color:var(--ink-11)}
.ra-tip:hover>.tip,.ra-tip:focus-within>.tip{opacity:1;transform:translateX(-50%) translateY(0)}`;document.head.appendChild(s);}
export function Tooltip({content,children}){
  _inject();
  return <span className="ra-tip" tabIndex={0}>{children}<span className="tip" role="tooltip">{content}</span></span>;
}
