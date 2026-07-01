import { FormEvent, useState } from 'react';
import {
  ArrowRight,
  Check,
  Code2,
  Database,
  Lock,
  Menu,
  SearchCheck,
  ShieldCheck,
  UserCheck,
  Users,
  X
} from 'lucide-react';

import { ArtifactPreview } from './ArtifactPreview.tsx';
import { AssuranceGraph } from './AssuranceGraph.tsx';
import { CliDemo } from './CliDemo.tsx';
import { TrustLedgerPreview } from './TrustLedgerPreview.tsx';
import { artifactOrder, useWebsiteLocale } from './i18n.ts';

const stepIcons = [Code2, SearchCheck, Users, UserCheck] as const;

export function App() {
  const { copy, locale, localeOptions, setLocale } = useWebsiteLocale();
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedArtifactId, setSelectedArtifactId] = useState(artifactOrder[0]!);
  const [email, setEmail] = useState('');
  const [formState, setFormState] = useState<'idle' | 'submitted'>('idle');

  function handlePreviewSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email.trim()) {
      return;
    }
    setFormState('submitted');
  }

  return (
    <main className="site-shell" data-locale={locale}>
      <header className="site-header theme-dark">
        <a className="brand" href="#top" aria-label="RepoAssure home">
          <span className="brand-mark" aria-hidden="true">
            <ShieldCheck size={22} strokeWidth={2.4} />
          </span>
          <span>
            Repo<span>Assure</span>
          </span>
        </a>

        <button
          className="menu-button"
          type="button"
          aria-label={copy.nav.toggleNavigation}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        <nav className={menuOpen ? 'nav nav-open' : 'nav'} aria-label="Primary navigation">
          <a href="#how-it-works">{copy.nav.howItWorks}</a>
          <a href="#assurance-graph">{copy.nav.assuranceGraph}</a>
          <a href="#artifacts">{copy.nav.artifacts}</a>
          <a href="#open-core">{copy.nav.openCore}</a>
          <a href="#roadmap">{copy.nav.roadmap}</a>
          <a href="#trust">{copy.nav.trust}</a>
        </nav>

        <div className="header-actions">
          <label className="language-switcher" data-testid="language-switcher">
            <span>{copy.language.label}</span>
            <select
              aria-label={copy.language.label}
              value={locale}
              onChange={(event) => setLocale(event.target.value as typeof locale)}
            >
              {localeOptions.map((option) => (
                <option key={option.code} value={option.code}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <a className="header-cta" href="#private-preview">
            {copy.nav.privatePreview}
          </a>
        </div>
      </header>

      <section className="hero theme-dark" id="top">
        <div className="hero-copy">
          <span className="status-chip">
            <Lock size={14} />
            {copy.hero.status}
          </span>
          <h1>{copy.hero.heading}</h1>
          <p className="hero-lede">{copy.hero.lede}</p>

          <ul className="check-list" aria-label="RepoAssure core assurances">
            {copy.hero.assurances.map((assurance) => (
              <li key={assurance}>
                <Check size={17} />
                {assurance}
              </li>
            ))}
          </ul>

          <div className="hero-actions">
            <a className="primary-button" href="#private-preview">
              {copy.hero.primaryCta}
              <ArrowRight size={18} />
            </a>
            <a className="secondary-button" href="#artifacts">
              {copy.hero.secondaryCta}
            </a>
          </div>

          <p className="privacy-note">
            <ShieldCheck size={18} />
            {copy.hero.privacyNote}
          </p>
        </div>

        <div className="hero-media">
          <TrustLedgerPreview copy={copy.trustLedgerPreview} variant="hero" />
        </div>
      </section>

      <section className="assurance-graph-section theme-dark" id="assurance-graph" data-testid="assurance-graph-section">
        <div className="assurance-graph-copy">
          <p className="section-label">{copy.assuranceGraphSection.label}</p>
          <h2>{copy.assuranceGraphSection.heading}</h2>
          <p className="section-intro">{copy.assuranceGraphSection.intro}</p>
        </div>
        <AssuranceGraph copy={copy.assuranceGraph} />
      </section>

      <section className="steps-section theme-light" id="how-it-works">
        <CliDemo copy={copy.cliDemo} />
        <div className="steps-grid steps-grid-compact">
          {copy.steps.items.map((step, index) => {
            const StepIcon = stepIcons[index] ?? ShieldCheck;
            return (
              <article className="step-card step-card-compact" key={step.title}>
                <span className="step-icon">
                  <StepIcon size={24} />
                </span>
                <div>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="artifacts-section theme-light" id="artifacts">
        <p className="section-label">{copy.artifacts.label}</p>
        <h2>{copy.artifacts.heading}</h2>
        <p className="section-intro">{copy.artifacts.intro}</p>

        <ArtifactPreview
          artifactOrder={artifactOrder}
          items={copy.artifacts.items}
          labels={{
            tabLabel: copy.artifacts.tabLabel,
            evidenceLabel: copy.artifacts.evidenceLabel,
            detailLabel: copy.artifacts.detailLabel,
            previewLabel: copy.artifacts.previewLabel
          }}
          selectedArtifactId={selectedArtifactId}
          onSelect={setSelectedArtifactId}
        />
      </section>

      <section className="split-section theme-light" id="open-core">
        <article>
          <p className="section-label">{copy.openCore.label}</p>
          <h2>{copy.openCore.heading}</h2>
          <p>{copy.openCore.body}</p>
          <ul className="check-list">
            {copy.openCore.bullets.map((bullet) => (
              <li key={bullet}>
                <Check size={17} />
                {bullet}
              </li>
            ))}
          </ul>
          <p className="repository-note">{copy.openCore.repositoryNote}</p>
        </article>

        <article className="roadmap-panel" id="roadmap">
          <p className="section-label">{copy.roadmap.label}</p>
          <h2>{copy.roadmap.heading}</h2>
          <p>{copy.roadmap.body}</p>
          <ul>
            {copy.roadmap.bullets.map((bullet) => (
              <li key={bullet}>{bullet}</li>
            ))}
          </ul>
          <p className="planned-note">{copy.roadmap.note}</p>
        </article>
      </section>

      <section className="trust-section theme-light" id="trust">
        <p className="section-label">{copy.trust.label}</p>
        <h2>{copy.trust.heading}</h2>
        <div className="trust-grid">
          {copy.trust.items.map((item, index) => {
            const TrustIcon = [Lock, ShieldCheck, Database][index] ?? ShieldCheck;
            return (
              <article key={item.title}>
                <TrustIcon size={30} />
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="preview-section theme-light" id="private-preview">
        <div>
          <span className="brand-mark" aria-hidden="true">
            <ShieldCheck size={25} strokeWidth={2.4} />
          </span>
          <h2>{copy.preview.heading}</h2>
          <p>{copy.preview.body}</p>
        </div>
        <form className="preview-form" data-testid="private-preview-form" onSubmit={handlePreviewSubmit}>
          <label htmlFor="preview-email">{copy.preview.emailLabel}</label>
          <div className="form-row">
            <input
              id="preview-email"
              type="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setFormState('idle');
              }}
              placeholder={copy.preview.emailPlaceholder}
              required
            />
            <button type="submit">
              {copy.preview.submit}
              <ArrowRight size={17} />
            </button>
          </div>
          <p role="status">{formState === 'submitted' ? copy.preview.submittedStatus : copy.preview.idleStatus}</p>
        </form>
      </section>

      <footer className="site-footer theme-dark">
        <div>
          <a className="footer-brand" href="#top">
            <ShieldCheck size={18} />
            RepoAssure
          </a>
          <p>{copy.footer.description}</p>
        </div>
        <div>
          <h3>{copy.footer.product}</h3>
          <a href="#how-it-works">{copy.nav.howItWorks}</a>
          <a href="#assurance-graph">{copy.nav.assuranceGraph}</a>
          <a href="#artifacts">{copy.nav.artifacts}</a>
          <a href="#trust">{copy.nav.trust}</a>
        </div>
        <div>
          <h3>{copy.footer.community}</h3>
          <a href="#open-core">{copy.nav.openCore}</a>
          <a href="#open-core">{copy.footer.repository}</a>
          <a href="#private-preview">{copy.footer.contributing}</a>
        </div>
        <div>
          <h3>{copy.footer.company}</h3>
          <a href="#roadmap">{copy.nav.roadmap}</a>
          <a href="#trust">{copy.footer.privacy}</a>
          <a href="#private-preview">{copy.footer.contact}</a>
        </div>
        <div className="footer-note">
          <p>{copy.footer.previewTitle}</p>
          <span>{copy.footer.previewText}</span>
        </div>
      </footer>
    </main>
  );
}
