import { FileText, Grid2X2, SearchCheck, ShieldCheck } from 'lucide-react';

import type { TrustLedgerPreviewCopy } from './i18n.ts';

const navIcons = [Grid2X2, FileText, SearchCheck, ShieldCheck] as const;

type HeroRunSummaryCopy = {
  label: string;
  items: Array<{
    label: string;
    value: string;
  }>;
};

type HeroConsoleProps = {
  ledger: TrustLedgerPreviewCopy;
  runSummary: HeroRunSummaryCopy;
};

export function HeroConsole({ ledger, runSummary }: HeroConsoleProps) {
  const sidebarItems = ledger.sidebar.slice(0, 4);

  return (
    <div className="hero-console" data-testid="hero-console" aria-label={ledger.label}>
      <div className="hero-console-shell">
        <aside className="hero-console-sidebar" aria-hidden="true">
          <div className="hero-console-brand">
            <ShieldCheck size={17} strokeWidth={2.3} />
            <span>
              Repo<span>Assure</span>
            </span>
          </div>
          <nav>
            {sidebarItems.map((item, index) => {
              const NavIcon = navIcons[index] ?? FileText;
              return (
                <span className={index === 0 ? 'active' : undefined} key={item}>
                  <NavIcon size={14} />
                  {item}
                </span>
              );
            })}
          </nav>
        </aside>

        <div className="hero-console-main">
          <header className="hero-console-header">
            <div>
              <h2>{ledger.title}</h2>
              <p>{ledger.subtitle}</p>
            </div>
            <code>{ledger.runId}</code>
          </header>

          <div className="hero-console-summary" aria-label={runSummary.label}>
            <p className="hero-console-summary-label">{runSummary.label}</p>
            <dl className="hero-console-summary-grid">
              {runSummary.items.map((item) => (
                <div key={item.label}>
                  <dt>{item.label}</dt>
                  <dd>{item.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <footer className="hero-console-footer">
            <strong>{ledger.localBadge}</strong>
            <span>{ledger.localNote}</span>
          </footer>
        </div>
      </div>
    </div>
  );
}
