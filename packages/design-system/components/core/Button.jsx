import React from 'react';
let _i=false;function _inject(){if(_i||typeof document==='undefined')return;_i=true;const s=document.createElement('style');s.setAttribute('data-ra','button');s.textContent=`.ra-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;font-family:var(--font-sans);font-weight:600;border:1px solid transparent;border-radius:var(--radius-control);cursor:pointer;text-decoration:none;white-space:nowrap;transition:background var(--duration-base) var(--ease-standard),border-color var(--duration-base),color var(--duration-base)}
.ra-btn:focus-visible{outline:none;box-shadow:0 0 0 3px color-mix(in srgb,var(--focus-ring) 45%,transparent)}
.ra-btn[disabled],.ra-btn[aria-disabled=true]{opacity:.5;cursor:not-allowed;box-shadow:none}
.ra-btn[data-size=sm]{height:36px;padding:0 14px;font-size:14px}
.ra-btn[data-size=md]{height:44px;padding:0 18px;font-size:15px}
.ra-btn[data-size=lg]{height:52px;padding:0 24px;font-size:16px}
.ra-btn[data-block=true]{width:100%}
.ra-btn[data-variant=primary]{background:var(--accent-emphasis);color:#fff;box-shadow:var(--shadow-cta)}
.ra-btn[data-variant=primary]:hover:not([disabled]){background:var(--green-6)}
.ra-btn[data-variant=secondary]{background:var(--surface-default);border-color:var(--border-strong);color:var(--fg-default)}
.ra-btn[data-variant=secondary]:hover:not([disabled]){background:var(--canvas-subtle);border-color:var(--fg-subtle)}
.ra-btn[data-variant=ghost]{background:transparent;color:var(--fg-muted)}
.ra-btn[data-variant=ghost]:hover:not([disabled]){background:var(--canvas-subtle);color:var(--fg-default)}
.ra-btn[data-variant=danger]{background:var(--danger-emphasis);color:#fff}
.ra-btn[data-variant=danger]:hover:not([disabled]){background:var(--red-6)}`;document.head.appendChild(s);}
export function Button({variant='primary',size='md',leadingIcon,trailingIcon,block,disabled,loading,href,onClick,type,children}){
  _inject();
  const Tag=href?'a':'button';
  const props={className:'ra-btn','data-variant':variant,'data-size':size,'data-block':block?'true':undefined,onClick,disabled:Tag==='button'?(disabled||loading):undefined,'aria-disabled':disabled||loading||undefined,href:Tag==='a'?href:undefined,type:Tag==='button'?(type||'button'):undefined};
  return <Tag {...props}>{loading?<Spinner/>:leadingIcon}{children}{!loading&&trailingIcon}</Tag>;
}
function Spinner(){return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{animation:'ra-spin .7s linear infinite'}}><style>{'@keyframes ra-spin{to{transform:rotate(360deg)}}'}</style><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" opacity=".3"/><path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/></svg>;}
