import {
  BrandMark,
  Button,
  Callout,
  Card,
  EvidenceHash,
  EvidenceRow,
  LanguageSwitcher,
  Panel,
  PipelineTimeline,
  ScoreGauge,
  SeverityChip,
  StatusChip,
  StepCard,
  TabList,
  Terminal,
  ThemeToggle,
  TrustCard,
  type ScoreGaugeProps,
  type SeverityChipProps,
  type StatusChipProps
} from '@repoassure/design-system';

/* Compile-time proof that the design system barrel resolves under the website's
   tsconfig (Bundler resolution, react-jsx) and that components carry real types.
   Nothing imports this module, so it never enters the Vite bundle graph — but it is
   inside `src`, so `pnpm typecheck:website` does check it.

   It exists because the vendored components are .jsx with sibling .d.ts. If that
   pairing ever stops resolving, the failure would otherwise surface as untyped `any`
   at each call site rather than as a build error. */

const components = [
  BrandMark,
  Button,
  Callout,
  Card,
  EvidenceHash,
  EvidenceRow,
  LanguageSwitcher,
  Panel,
  PipelineTimeline,
  ScoreGauge,
  SeverityChip,
  StatusChip,
  StepCard,
  TabList,
  Terminal,
  ThemeToggle,
  TrustCard
] as const;

export const designSystemComponentCount: number = components.length;

/* Props are real types, not `any`: these must be assignable, and a wrong literal
   must not be. */
export const statusChipProps: StatusChipProps = { status: 'verified' };
export const scoreGaugeProps: ScoreGaugeProps = { score: 85 };

/* Note the case: the design system takes lowercase `p0` | `p1` | `p2`, while product
   findings are typed `P0` | `P1` | `P2` (src/types/findings.ts). Wiring severity
   through in a later goal needs an explicit mapping, not a pass-through. */
export const severityChipProps: SeverityChipProps = { level: 'p0' };
