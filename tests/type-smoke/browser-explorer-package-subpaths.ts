import * as browserExplorer from '@hardening-mcp/browser-explorer';
import * as compatibility from '@hardening-mcp/browser-explorer/compatibility';
import * as exploreApp from '@hardening-mcp/browser-explorer/explore-app';
import * as playwrightDriver from '@hardening-mcp/browser-explorer/playwright-driver';

const browserExplorerPackageSubpathModules = [
  browserExplorer,
  compatibility,
  exploreApp,
  playwrightDriver
] as const;

type RootBrowserExplorerPackageExportEntry = browserExplorer.BrowserExplorerPackageExportEntry;
type CompatibilityBrowserExplorerPackageExportEntry = compatibility.BrowserExplorerPackageExportEntry;
type RootBrowserExplorerPackageDistOutputEntry = browserExplorer.BrowserExplorerPackageDistOutputEntry;
type CompatibilityBrowserExplorerPackageDistOutputEntry = compatibility.BrowserExplorerPackageDistOutputEntry;
type RootBrowserExplorerPackageSourceEntry = browserExplorer.BrowserExplorerPackageSourceEntry;
type CompatibilityBrowserExplorerPackageSourceEntry = compatibility.BrowserExplorerPackageSourceEntry;
type RootLegacyBrowserExplorerDistOutputEntry = browserExplorer.LegacyBrowserExplorerDistOutputEntry;
type CompatibilityLegacyBrowserExplorerDistOutputEntry = compatibility.LegacyBrowserExplorerDistOutputEntry;
type RootLegacyBrowserExplorerWrapperSourceEntry = browserExplorer.LegacyBrowserExplorerWrapperSourceEntry;
type CompatibilityLegacyBrowserExplorerWrapperSourceEntry = compatibility.LegacyBrowserExplorerWrapperSourceEntry;

type RootExploreAppInput = browserExplorer.ExploreAppInput;
type PackageExploreAppInput = exploreApp.ExploreAppInput;
type RootExploreAppResult = browserExplorer.ExploreAppResult;
type PackageExploreAppResult = exploreApp.ExploreAppResult;
type RootExploreBrowserDriver = browserExplorer.ExploreBrowserDriver;
type PackageExploreBrowserDriver = exploreApp.ExploreBrowserDriver;
type PackageCreatePlaywrightBrowserDriverInput = playwrightDriver.CreatePlaywrightBrowserDriverInput;

const browserExplorerPackageExportEntryContracts: readonly [
  readonly RootBrowserExplorerPackageExportEntry[],
  readonly CompatibilityBrowserExplorerPackageExportEntry[]
] = [
  browserExplorer.browserExplorerPackageExportEntries,
  compatibility.browserExplorerPackageExportEntries
];

const browserExplorerPackageDistOutputEntryContracts: readonly [
  readonly RootBrowserExplorerPackageDistOutputEntry[],
  readonly CompatibilityBrowserExplorerPackageDistOutputEntry[]
] = [
  browserExplorer.browserExplorerPackageDistOutputEntries,
  compatibility.browserExplorerPackageDistOutputEntries
];

const browserExplorerPackageSourceEntryContracts: readonly [
  readonly RootBrowserExplorerPackageSourceEntry[],
  readonly CompatibilityBrowserExplorerPackageSourceEntry[]
] = [
  browserExplorer.browserExplorerPackageSourceEntries,
  compatibility.browserExplorerPackageSourceEntries
];

const legacyBrowserExplorerDistOutputEntryContracts: readonly [
  readonly RootLegacyBrowserExplorerDistOutputEntry[],
  readonly CompatibilityLegacyBrowserExplorerDistOutputEntry[]
] = [
  browserExplorer.legacyBrowserExplorerDistOutputEntries,
  compatibility.legacyBrowserExplorerDistOutputEntries
];

const legacyBrowserExplorerWrapperSourceEntryContracts: readonly [
  readonly RootLegacyBrowserExplorerWrapperSourceEntry[],
  readonly CompatibilityLegacyBrowserExplorerWrapperSourceEntry[]
] = [
  browserExplorer.legacyBrowserExplorerWrapperSourceEntries,
  compatibility.legacyBrowserExplorerWrapperSourceEntries
];

const exploreInputContracts: readonly [
  RootExploreAppInput | undefined,
  PackageExploreAppInput | undefined
] = [
  undefined,
  undefined
];

const exploreResultContracts: readonly [
  RootExploreAppResult | undefined,
  PackageExploreAppResult | undefined
] = [
  undefined,
  undefined
];

const exploreDriverContracts: readonly [
  RootExploreBrowserDriver | undefined,
  PackageExploreBrowserDriver | undefined
] = [
  undefined,
  undefined
];

const playwrightDriverInputSmoke: PackageCreatePlaywrightBrowserDriverInput = {
  headless: true,
  trace: false
};
const criticalPathSmoke: string[] = exploreApp.expandCriticalPathInput('login', 'http://localhost:3000/');
const linksSmoke: string[] = browserExplorer.extractLinks('<a href="/settings">Settings</a>', 'http://localhost:3000/');

export {
  browserExplorerPackageDistOutputEntryContracts,
  browserExplorerPackageExportEntryContracts,
  browserExplorerPackageSourceEntryContracts,
  browserExplorerPackageSubpathModules,
  criticalPathSmoke,
  exploreDriverContracts,
  exploreInputContracts,
  exploreResultContracts,
  legacyBrowserExplorerDistOutputEntryContracts,
  legacyBrowserExplorerWrapperSourceEntryContracts,
  linksSmoke,
  playwrightDriverInputSmoke
};
