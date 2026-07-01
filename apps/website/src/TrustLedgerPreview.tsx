import { Copy, FileText, GitBranch, Grid2X2, SearchCheck, Server, ShieldCheck } from 'lucide-react';

import type { TrustLedgerPreviewCopy } from './i18n.ts';

const navIcons = [Grid2X2, FileText, SearchCheck, ShieldCheck, ShieldCheck, Server, GitBranch] as const;

const rowIcons = {
  acceptance: ShieldCheck,
  hardening: FileText,
  patch: ShieldCheck,
  repair: SearchCheck
} as const;

type TrustLedgerPreviewProps = {
  copy: TrustLedgerPreviewCopy;
  variant?: 'hero' | 'default';
};

export function TrustLedgerPreview({ copy, variant = 'default' }: TrustLedgerPreviewProps) {
  const sidebarItems = variant === 'hero' ? copy.sidebar.slice(0, 4) : copy.sidebar;

  return (
    <section
      className={variant === 'hero' ? 'trust-ledger-preview trust-ledger-preview-hero' : 'trust-ledger-preview'}
      data-testid="trust-ledger-preview"
      aria-label={copy.label}
    >
      <div className="trust-ledger-shell">
        <aside className="trust-ledger-sidebar" aria-label={copy.label}>
          <div className="trust-ledger-brand">
            <span className="trust-ledger-brand-mark" aria-hidden="true">
              <ShieldCheck size={23} strokeWidth={2.4} />
            </span>
            <span>
              Repo<span>Assure</span>
            </span>
          </div>
          <nav>
            {sidebarItems.map((item, index) => {
              const NavIcon = navIcons[index] ?? FileText;
              return (
                <span className={index === 0 ? 'active' : undefined} key={item}>
                  <NavIcon size={18} />
                  {item}
                </span>
              );
            })}
          </nav>
        </aside>

        <div className="trust-ledger-main">
          <header className="trust-ledger-header">
            <span className="trust-ledger-shield" aria-hidden="true">
              <ShieldCheck size={38} strokeWidth={2.1} />
            </span>
            <div>
              <h2>{copy.title}</h2>
              <p>{copy.subtitle}</p>
            </div>
            <div className="trust-ledger-run">
              <span>{copy.runIdLabel}</span>
              <Copy size={15} />
              <code>{copy.runId}</code>
            </div>
          </header>

          <div className="trust-ledger-table" role="table" aria-label={copy.title}>
            <div className="trust-ledger-row trust-ledger-table-head" role="row">
              <span role="columnheader">{copy.columns.artifact}</span>
              <span role="columnheader">{copy.columns.status}</span>
              <span role="columnheader">{copy.columns.summary}</span>
              <span role="columnheader">{copy.columns.evidence}</span>
            </div>

            {copy.rows.map((row) => {
              const RowIcon = rowIcons[row.id];
              return (
                <div className="trust-ledger-row" role="row" key={row.id}>
                  <span className="trust-ledger-artifact" role="cell">
                    <RowIcon size={18} />
                    {row.artifact}
                  </span>
                  <span className="trust-ledger-status" role="cell">
                    <strong>{row.status}</strong>
                    <small>{row.timestamp}</small>
                  </span>
                  <span className="trust-ledger-summary" role="cell">
                    <strong>{row.summary}</strong>
                    <small>{row.detail}</small>
                  </span>
                  <span className="trust-ledger-evidence" role="cell">
                    <code>{row.evidence}</code>
                    <Copy size={15} />
                  </span>
                </div>
              );
            })}
          </div>

          <footer className="trust-ledger-footer">
            <div>
              <ShieldCheck size={18} />
              {copy.footer}
            </div>
            <div className="trust-ledger-local">
              <span>{copy.localNote}</span>
              <strong>{copy.localBadge}</strong>
            </div>
          </footer>
        </div>
      </div>
    </section>
  );
}
