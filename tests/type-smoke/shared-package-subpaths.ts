import * as shared from '@hardening-mcp/shared';
import * as compatibility from '@hardening-mcp/shared/compatibility';
import * as privacyRedaction from '@hardening-mcp/shared/privacy-redaction';
import * as shellQuote from '@hardening-mcp/shared/shell-quote';
import * as shellWords from '@hardening-mcp/shared/shell-words';

const sharedPackageSubpathModules = [
  shared,
  compatibility,
  privacyRedaction,
  shellQuote,
  shellWords
] as const;

type RootSharedPackageExportEntry = shared.SharedPackageExportEntry;
type CompatibilitySharedPackageExportEntry = compatibility.SharedPackageExportEntry;
type RootSharedPackageDistOutputEntry = shared.SharedPackageDistOutputEntry;
type CompatibilitySharedPackageDistOutputEntry = compatibility.SharedPackageDistOutputEntry;
type RootSharedPackageSourceEntry = shared.SharedPackageSourceEntry;
type CompatibilitySharedPackageSourceEntry = compatibility.SharedPackageSourceEntry;
type RootLegacySharedDistOutputEntry = shared.LegacySharedDistOutputEntry;
type CompatibilityLegacySharedDistOutputEntry = compatibility.LegacySharedDistOutputEntry;
type RootLegacySharedWrapperSourceEntry = shared.LegacySharedWrapperSourceEntry;
type CompatibilityLegacySharedWrapperSourceEntry = compatibility.LegacySharedWrapperSourceEntry;

const sharedPackageExportEntryContracts: readonly [
  readonly RootSharedPackageExportEntry[],
  readonly CompatibilitySharedPackageExportEntry[]
] = [
  shared.sharedPackageExportEntries,
  compatibility.sharedPackageExportEntries
];

const sharedPackageDistOutputEntryContracts: readonly [
  readonly RootSharedPackageDistOutputEntry[],
  readonly CompatibilitySharedPackageDistOutputEntry[]
] = [
  shared.sharedPackageDistOutputEntries,
  compatibility.sharedPackageDistOutputEntries
];

const sharedPackageSourceEntryContracts: readonly [
  readonly RootSharedPackageSourceEntry[],
  readonly CompatibilitySharedPackageSourceEntry[]
] = [
  shared.sharedPackageSourceEntries,
  compatibility.sharedPackageSourceEntries
];

const legacySharedDistOutputEntryContracts: readonly [
  readonly RootLegacySharedDistOutputEntry[],
  readonly CompatibilityLegacySharedDistOutputEntry[]
] = [
  shared.legacySharedDistOutputEntries,
  compatibility.legacySharedDistOutputEntries
];

const legacySharedWrapperSourceEntryContracts: readonly [
  readonly RootLegacySharedWrapperSourceEntry[],
  readonly CompatibilityLegacySharedWrapperSourceEntry[]
] = [
  shared.legacySharedWrapperSourceEntries,
  compatibility.legacySharedWrapperSourceEntries
];

const redactionSmoke: string = privacyRedaction.redactSensitiveText('Authorization: Bearer shared-secret');
const quoteSmoke: string = shellQuote.shellQuoteArg('shared package');
const shellWordsSmoke: string[] | undefined = shellWords.parseShellWords(`cmd ${quoteSmoke}`);

export {
  legacySharedDistOutputEntryContracts,
  legacySharedWrapperSourceEntryContracts,
  quoteSmoke,
  redactionSmoke,
  sharedPackageDistOutputEntryContracts,
  sharedPackageExportEntryContracts,
  sharedPackageSourceEntryContracts,
  sharedPackageSubpathModules,
  shellWordsSmoke
};
