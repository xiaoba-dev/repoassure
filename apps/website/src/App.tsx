import { FormEvent, useState } from 'react';
import {
  BrandMark,
  Button,
  Callout,
  Card,
  FormField,
  Link,
  Panel,
  ScoreGauge,
  StatusChip,
  StepCard,
  Terminal,
  TextInput,
  TrustCard
} from '@repoassure/design-system';
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
import { OpenCoreDiagram } from './OpenCoreDiagram.tsx';
import { artifactOrder, useWebsiteLocale } from './i18n.ts';

const roleIcons = [Code2, SearchCheck, Users, UserCheck] as const;
const trustIcons = [Lock, ShieldCheck, Database] as const;

/* Figures the hero renders come from a recorded benchmark run of the `next-console`
   fixture, not from composed numbers. Keeping them beside the copy that quotes them
   means a change to one is visibly a change to the other. */
const HERO_SCORE = 85;
const HERO_BREAKDOWN = [
  { k: 'P0', v: 0, c: 'var(--sev-p0-fg)' },
  { k: 'P1', v: 1, c: 'var(--sev-p1-fg)' }
];

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

  const navLinks = [
    { href: '#answers', label: copy.nav.answers },
    { href: '#how-it-works', label: copy.nav.howItWorks },
    { href: '#artifacts', label: copy.nav.artifacts },
    { href: '#open-core', label: copy.nav.openCore },
    { href: '#trust', label: copy.nav.trust }
  ];

  return (
    <main className="site-shell" data-locale={locale}>
      <header className="site-header">
        <div className="wrap">
          <a href="#top" aria-label="RepoAssure home" style={{ display: 'inline-flex' }}>
            <BrandMark lockup size={26} />
          </a>

          <nav className={menuOpen ? 'nav nav-open' : 'nav'} aria-label="Primary navigation">
            {navLinks.map((link) => (
              <a href={link.href} key={link.href} onClick={() => setMenuOpen(false)}>
                {link.label}
              </a>
            ))}
          </nav>

          <button
            className="menu-button"
            type="button"
            aria-label={copy.nav.toggleNavigation}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <div className="header-actions">
            {/* The design system ships a LanguageSwitcher, but it renders every language it
                is given as reachable. This site ships two locales and lists exactly two. */}
            <label className="language-switcher" data-testid="language-switcher">
              <span className="sr-only">{copy.language.label}</span>
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

            <span className="header-cta">
              <Button size="sm" href="#private-preview">
                {copy.nav.privatePreview}
              </Button>
            </span>
          </div>
        </div>
      </header>

      <section className="hero" id="top">
        <div className="wrap">
          <div className="hero-copy">
            <span className="eyebrow">{copy.hero.status}</span>
            <h1>{copy.hero.heading}</h1>
            <p className="lead">{copy.hero.lede}</p>

            <div className="hero-actions">
              <Button href="#private-preview" leadingIcon={<ShieldCheck size={18} />}>
                {copy.hero.primaryCta}
              </Button>
              <Button variant="ghost" href="#assurance-graph" trailingIcon={<ArrowRight size={16} />}>
                {copy.hero.secondaryCta}
              </Button>
            </div>

            {/* Both chips carry localized copy that already exists. The design system's
                own default labels are English-only, and this site ships two locales. */}
            <div className="hero-chips">
              <StatusChip status="hashed">{copy.trustLedgerPreview.localBadge}</StatusChip>
              <StatusChip status="verified">{copy.assuranceGraph.verifiedLabel}</StatusChip>
            </div>
          </div>

          {/* Panel is the always-dark instrument surface. Components placed on it read the
              same semantic tokens as the light page, so the surface remaps them — the
              mechanism the design system's own console section uses. */}
          <div className="hero-media console-scope" data-testid="hero-console">
            <Panel
              eyebrow={copy.heroRunSummary.label}
              title={copy.trustLedgerPreview.title}
              action={<StatusChip status="hashed">{copy.trustLedgerPreview.hashedBadge}</StatusChip>}
            >
              <div className="stack">
                <Terminal
                  title={copy.trustLedgerPreview.subtitle}
                  lines={[
                    { type: 'cmd' as const, text: copy.cliDemo.command },
                    ...copy.cliDemo.lines.map((text, index) => ({
                      type: index === copy.cliDemo.lines.length - 1 ? ('info' as const) : ('out' as const),
                      text
                    }))
                  ]}
                />
                <div style={{ padding: '4px 4px 0' }}>
                  <ScoreGauge
                    score={HERO_SCORE}
                    label={copy.heroRunSummary.items[0]!.label}
                    breakdown={HERO_BREAKDOWN}
                  />
                </div>
              </div>
            </Panel>
          </div>
        </div>
      </section>

      {/* The spine of the page. ADR-0013 records the four questions RepoAssure answers.
          Figures come from a recorded benchmark run, not composed numbers. */}
      <section id="answers" data-testid="answers-section">
        <div className="wrap">
          <div className="section-head">
            <span className="eyebrow">{copy.answers.label}</span>
            <h2>{copy.answers.heading}</h2>
            <p className="lead">{copy.answers.intro}</p>
          </div>
          <div className="card-grid card-grid-4">
            {copy.answers.items.map((item, index) => (
              <StepCard index={index + 1} key={item.id} title={item.question}>
                {item.text}
                <p style={{ display: 'grid', gap: 2, margin: '14px 0 0' }}>
                  <strong
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 28,
                      fontWeight: 700,
                      color: 'var(--accent-fg)',
                      lineHeight: 1.1
                    }}
                  >
                    {item.highlight}
                  </strong>
                  <span style={{ fontSize: 13, color: 'var(--fg-subtle)' }}>{item.value}</span>
                </p>
              </StepCard>
            ))}
          </div>
        </div>
      </section>

      <section id="assurance-graph" data-testid="assurance-graph-section">
        <div className="wrap">
          <div className="section-head">
            <span className="eyebrow">{copy.assuranceGraphSection.label}</span>
            <h2>{copy.assuranceGraphSection.heading}</h2>
            <p className="lead">{copy.assuranceGraphSection.intro}</p>
          </div>
          {/* Panel already renders the eyebrow and title, so the graph's own heading would
              repeat them. */}
          <div className="console-scope">
            <Panel eyebrow={copy.assuranceGraph.label} title={copy.assuranceGraph.centerLabel}>
              <AssuranceGraph copy={copy.assuranceGraph} showHeading={false} />
            </Panel>
          </div>
        </div>
      </section>

      <section className="section-subtle" id="how-it-works">
        <div className="wrap">
          <div className="section-head">
            <span className="eyebrow">{copy.cliDemo.label}</span>
            <h2>{copy.cliDemo.heading}</h2>
            <p className="lead">{copy.cliDemo.intro}</p>
          </div>
          <div className="console-scope" data-testid="cli-demo">
            <Terminal
              title={copy.cliDemo.label}
              lines={[
                { type: 'cmd' as const, text: copy.cliDemo.command },
                ...copy.cliDemo.lines.map((text) => ({ type: 'out' as const, text })),
                { type: 'ok' as const, text: copy.cliDemo.footnote }
              ]}
            />
          </div>
        </div>
      </section>

      <section id="roles" data-testid="roles-section">
        <div className="wrap">
          <div className="section-head">
            <span className="eyebrow">{copy.roles.label}</span>
            <h2>{copy.roles.heading}</h2>
            <p className="lead">{copy.roles.intro}</p>
          </div>
          <div className="card-grid card-grid-4">
            {copy.steps.items.map((step, index) => {
              const RoleIcon = roleIcons[index] ?? ShieldCheck;
              return (
                <TrustCard icon={<RoleIcon size={28} />} key={step.title} title={step.title}>
                  {step.text}
                </TrustCard>
              );
            })}
          </div>
        </div>
      </section>

      <section id="artifacts">
        <div className="wrap">
          <div className="section-head">
            <span className="eyebrow">{copy.artifacts.label}</span>
            <h2>{copy.artifacts.heading}</h2>
            <p className="lead">{copy.artifacts.intro}</p>
          </div>

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
        </div>
      </section>

      <section className="section-subtle" id="open-core">
        <div className="wrap">
          <div className="split-grid">
            <article className="stack">
              <div className="stack-narrow">
                <span className="eyebrow">{copy.openCore.label}</span>
                <h2>{copy.openCore.heading}</h2>
                <p className="lead">{copy.openCore.body}</p>
              </div>
              <OpenCoreDiagram copy={copy.openCore.diagram} />
              <ul className="check-list">
                {copy.openCore.bullets.map((bullet) => (
                  <li key={bullet}>
                    <Check size={17} />
                    {bullet}
                  </li>
                ))}
              </ul>
              <Callout variant="info">{copy.openCore.repositoryNote}</Callout>
            </article>

            <div id="roadmap">
              <Card title={copy.roadmap.heading} subtitle={copy.roadmap.label}>
                <div className="stack">
                  <p style={{ margin: 0 }}>{copy.roadmap.body}</p>
                  {/* Deliberately not a check-list. These are unbuilt roadmap items, and a
                      green tick beside "Enterprise policy management" reads as a claim
                      that it exists. */}
                  <ul className="plain-list">
                    {copy.roadmap.bullets.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                  <Callout variant="warning">{copy.roadmap.note}</Callout>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <section id="trust">
        <div className="wrap">
          <div className="section-head">
            <span className="eyebrow">{copy.trust.label}</span>
            <h2>{copy.trust.heading}</h2>
          </div>
          <div className="card-grid">
            {copy.trust.items.map((item, index) => {
              const TrustIcon = trustIcons[index] ?? ShieldCheck;
              return (
                <TrustCard icon={<TrustIcon size={28} />} key={item.title} title={item.title}>
                  {item.text}
                </TrustCard>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section-subtle" id="private-preview">
        <div className="wrap preview-wrap">
          <div className="section-head-center">
            <span className="eyebrow">{copy.nav.privatePreview}</span>
            <h2>{copy.preview.heading}</h2>
            <p className="lead">{copy.preview.body}</p>
          </div>

          <Card>
            <form className="preview-form" data-testid="private-preview-form" onSubmit={handlePreviewSubmit}>
              <FormField label={copy.preview.emailLabel} htmlFor="preview-email">
                <TextInput
                  id="preview-email"
                  type="email"
                  placeholder={copy.preview.emailPlaceholder}
                  value={email}
                  required
                  onChange={(event: { target: { value: string } }) => {
                    setEmail(event.target.value);
                    setFormState('idle');
                  }}
                />
              </FormField>
              <Button block type="submit" trailingIcon={<ArrowRight size={17} />}>
                {copy.preview.submit}
              </Button>
              <p role="status" style={{ margin: 0, fontSize: 13, color: 'var(--fg-subtle)' }}>
                {formState === 'submitted' ? copy.preview.submittedStatus : copy.preview.idleStatus}
              </p>
            </form>
          </Card>

          <Callout variant="info">{copy.preview.designPartnerNote}</Callout>
        </div>
      </section>

      <footer className="site-footer" data-theme="dark">
        <div className="wrap footer-main">
          <div className="footer-brand-col">
            <BrandMark lockup size={24} />
            <p>{copy.footer.description}</p>
          </div>
          <nav className="footer-col" aria-label={copy.footer.linksLabel}>
            <span className="footer-col-heading">{copy.footer.linksLabel}</span>
            {navLinks.map((link) => (
              <a href={link.href} key={link.href}>
                {link.label}
              </a>
            ))}
          </nav>
        </div>
        <div className="wrap footer-base">
          <span>{copy.footer.note}</span>
          <Link href="#top" muted>
            RepoAssure
          </Link>
        </div>
      </footer>
    </main>
  );
}
