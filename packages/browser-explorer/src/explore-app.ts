import { redactSensitiveText } from '@hardening-mcp/shared/privacy-redaction';

export type FindingSeverity = 'P0' | 'P1' | 'P2';

export type FindingType =
  | 'white_screen'
  | 'broken_route'
  | 'dead_control'
  | 'form_failure'
  | 'console_error'
  | 'network_error';

export interface HardeningFinding {
  severity: FindingSeverity;
  type: FindingType;
  title: string;
  reproSteps: string[];
  evidence: string[];
}

export interface ExplorePageResult {
  status: number;
  body: string;
}

export type FetchPage = (url: string) => Promise<ExplorePageResult>;

export type BrowserInteractionOutcome = 'ok' | 'dead_control' | 'form_failure' | 'skipped_unsafe';

export interface BrowserInteractionResult {
  description: string;
  outcome: BrowserInteractionOutcome;
  evidence: string[];
}

export interface BrowserPageSnapshot {
  url: string;
  status: number;
  html: string;
  bodyText: string;
  links: string[];
  consoleErrors: string[];
  pageErrors: string[];
  failedRequests: string[];
  artifactFiles: string[];
  interactions: BrowserInteractionResult[];
}

export interface BrowserSnapshotOptions {
  artifactsDir: string;
  maxActionsPerRoute: number;
}

export interface ExploreBrowserDriver {
  snapshot: (url: string, options: BrowserSnapshotOptions) => Promise<BrowserPageSnapshot>;
  close: () => Promise<void>;
}

export interface ExploreAppInput {
  url: string;
  criticalPaths: string[];
  maxRoutes: number;
  maxActionsPerRoute: number;
  artifactsDir?: string;
  fetchPage?: FetchPage;
  browserDriver?: ExploreBrowserDriver;
}

export interface ExploreAppResult {
  visitedRoutes: string[];
  interactions: string[];
  findings: HardeningFinding[];
  artifactsDir: string;
  artifactFiles: string[];
}

interface CriticalPathIntent {
  patterns: RegExp[];
  routes: string[];
}

const criticalPathIntents: CriticalPathIntent[] = [
  {
    patterns: [/登录|登陆|login|log\s*in|sign\s*in/i],
    routes: ['/login']
  },
  {
    patterns: [/注册|signup|sign\s*up|register/i],
    routes: ['/signup', '/register']
  },
  {
    patterns: [/创建项目|新建项目|create\s+(a\s+)?project|new\s+project|project/i],
    routes: ['/projects/new', '/projects']
  },
  {
    patterns: [/聊天|消息|发送|chat|message|conversation/i],
    routes: ['/chat']
  },
  {
    patterns: [/设置|settings|preferences/i],
    routes: ['/settings']
  },
  {
    patterns: [/个人|账户|账号|profile|account/i],
    routes: ['/profile', '/account']
  },
  {
    patterns: [/支付|付款|结账|购买|checkout|payment|billing|purchase/i],
    routes: ['/checkout', '/payment', '/billing']
  }
];

export async function exploreApp(input: ExploreAppInput): Promise<ExploreAppResult> {
  if (input.browserDriver) {
    return exploreAppWithBrowser(input, input.browserDriver);
  }

  const fetchPage = input.fetchPage ?? defaultFetchPage;
  const queue = seedQueue(input);
  const visited = new Set<string>();
  const findings: HardeningFinding[] = [];

  while (queue.length > 0 && visited.size < input.maxRoutes) {
    const current = queue.shift();

    if (!current || visited.has(current)) {
      continue;
    }

    visited.add(current);

    try {
      const page = await fetchPage(current);
      const finding = classifyRouteResult(current, page);

      if (finding) {
        findings.push(finding);
      }

      for (const link of extractLinks(page.body, current)) {
        if (!visited.has(link) && queue.length + visited.size < input.maxRoutes) {
          queue.push(link);
        }
      }
    } catch (error) {
      findings.push({
        severity: 'P1',
        type: 'network_error',
        title: 'Route failed to load',
        reproSteps: [`Go to ${current}`],
        evidence: [error instanceof Error ? error.message : 'Unknown fetch error']
      });
    }
  }

  return {
    visitedRoutes: redactTextList(Array.from(visited)),
    interactions: [],
    findings: findings.map(redactFinding),
    artifactsDir: input.artifactsDir ?? '',
    artifactFiles: []
  };
}

async function exploreAppWithBrowser(input: ExploreAppInput, browserDriver: ExploreBrowserDriver): Promise<ExploreAppResult> {
  const queue = seedQueue(input);
  const visited = new Set<string>();
  const interactions: string[] = [];
  const findings: HardeningFinding[] = [];
  const artifactFiles: string[] = [];
  const artifactsDir = input.artifactsDir ?? '';

  try {
    while (queue.length > 0 && visited.size < input.maxRoutes) {
      const current = queue.shift();

      if (!current || visited.has(current)) {
        continue;
      }

      visited.add(current);

      try {
        const snapshot = await browserDriver.snapshot(current, {
          artifactsDir,
          maxActionsPerRoute: input.maxActionsPerRoute
        });

        artifactFiles.push(...snapshot.artifactFiles);
        interactions.push(...snapshot.interactions.map((interaction) => interaction.description));
        findings.push(...classifyBrowserSnapshot(current, snapshot));

        for (const link of normalizeSameOriginLinks(snapshot.links, current)) {
          if (!visited.has(link) && queue.length + visited.size < input.maxRoutes) {
            queue.push(link);
          }
        }
      } catch (error) {
        findings.push({
          severity: 'P1',
          type: 'network_error',
          title: 'Route failed to load',
          reproSteps: [`Go to ${current}`],
          evidence: [error instanceof Error ? error.message : 'Unknown browser exploration error']
        });
      }
    }
  } finally {
    await browserDriver.close();
  }

  return {
    visitedRoutes: redactTextList(Array.from(visited)),
    interactions: redactTextList(interactions),
    findings: findings.map(redactFinding),
    artifactsDir,
    artifactFiles
  };
}

function redactFinding(finding: HardeningFinding): HardeningFinding {
  return {
    ...finding,
    title: redactSensitiveText(finding.title),
    reproSteps: finding.reproSteps.map((step) => redactSensitiveText(step)),
    evidence: finding.evidence.map((entry) => redactSensitiveText(entry))
  };
}

function redactTextList(values: string[]): string[] {
  return values.map((value) => redactSensitiveText(value));
}

export function extractLinks(html: string, baseUrl: string): string[] {
  const links = new Set<string>();
  const base = safeUrl(baseUrl);

  if (!base) {
    return [];
  }

  for (const match of html.matchAll(/<a\s+[^>]*href=["']([^"']+)["'][^>]*>/gi)) {
    const href = match[1];

    if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) {
      continue;
    }

    const url = safeUrl(href, base);

    if (url && url.origin === base.origin) {
      url.hash = '';
      links.add(url.toString().replace(/\/$/, url.pathname === '/' ? '/' : ''));
    }
  }

  return Array.from(links);
}

function seedQueue(input: ExploreAppInput): string[] {
  const queue: string[] = [];
  const seen = new Set<string>();
  const enqueue = (url: string): void => {
    if (!seen.has(url)) {
      seen.add(url);
      queue.push(url);
    }
  };

  enqueue(input.url);

  for (const criticalPath of input.criticalPaths) {
    for (const url of expandCriticalPathInput(criticalPath, input.url)) {
      enqueue(url);
    }
  }

  return queue;
}

export function expandCriticalPathInput(input: string, baseUrl?: string): string[] {
  const trimmed = input.trim();
  const base = baseUrl ? safeUrl(baseUrl) : null;

  if (!trimmed) {
    return [];
  }

  if (isExplicitRouteSpecifier(trimmed)) {
    const explicitUrl = base ? safeUrl(trimmed, base) : safeUrl(trimmed);
    if (!explicitUrl || (base && explicitUrl.origin !== base.origin)) {
      return [];
    }

    return [normalizeUrl(explicitUrl)];
  }

  const matchedIntents = criticalPathIntents.flatMap((intent, sequence) => {
    const position = firstPatternPosition(trimmed, intent.patterns);
    return position === -1 ? [] : [{ intent, position, sequence }];
  });

  matchedIntents.sort((left, right) => left.position - right.position || left.sequence - right.sequence);

  const candidates = new Set<string>();

  for (const match of matchedIntents) {
    for (const route of match.intent.routes) {
      const url = base ? safeUrl(route, base) : safeUrl(route);
      if (url) {
        candidates.add(normalizeUrl(url));
      }
    }
  }

  return Array.from(candidates).slice(0, 8);
}

function classifyRouteResult(url: string, page: ExplorePageResult): HardeningFinding | null {
  if (page.status >= 500) {
    return {
      severity: 'P1',
      type: 'network_error',
      title: `Route returned HTTP ${page.status}`,
      reproSteps: [`Go to ${url}`],
      evidence: [`status=${page.status}`]
    };
  }

  if (page.status >= 400) {
    return {
      severity: 'P1',
      type: 'broken_route',
      title: `Route returned HTTP ${page.status}`,
      reproSteps: [`Go to ${url}`],
      evidence: [`status=${page.status}`]
    };
  }

  if (isBlankHtml(page.body)) {
    return {
      severity: 'P0',
      type: 'white_screen',
      title: 'Route rendered an empty body',
      reproSteps: [`Go to ${url}`],
      evidence: ['body_text_empty=true']
    };
  }

  return null;
}

function classifyBrowserSnapshot(url: string, snapshot: BrowserPageSnapshot): HardeningFinding[] {
  const findings: HardeningFinding[] = [];
  const routeFinding = classifyRouteResult(url, {
    status: snapshot.status,
    body: snapshot.html
  });

  if (routeFinding) {
    findings.push(routeFinding);
  } else if (snapshot.bodyText.trim().length === 0) {
    findings.push({
      severity: 'P0',
      type: 'white_screen',
      title: 'Route rendered an empty body',
      reproSteps: [`Go to ${url}`],
      evidence: ['body_text_empty=true']
    });
  }

  if (snapshot.consoleErrors.length > 0 || snapshot.pageErrors.length > 0) {
    findings.push({
      severity: 'P1',
      type: 'console_error',
      title: 'Route emitted browser runtime errors',
      reproSteps: [`Go to ${url}`],
      evidence: [...snapshot.consoleErrors, ...snapshot.pageErrors]
    });
  }

  if (snapshot.failedRequests.length > 0) {
    findings.push({
      severity: 'P1',
      type: 'network_error',
      title: 'Route emitted failed network requests',
      reproSteps: [`Go to ${url}`],
      evidence: snapshot.failedRequests
    });
  }

  for (const interaction of snapshot.interactions) {
    if (interaction.outcome === 'dead_control') {
      findings.push({
        severity: 'P1',
        type: 'dead_control',
        title: 'Interaction did not produce an observable result',
        reproSteps: [`Go to ${url}`, interaction.description],
        evidence: interaction.evidence
      });
    }

    if (interaction.outcome === 'form_failure') {
      findings.push({
        severity: 'P1',
        type: 'form_failure',
        title: 'Form interaction failed',
        reproSteps: [`Go to ${url}`, interaction.description],
        evidence: interaction.evidence
      });
    }
  }

  return findings;
}

function isBlankHtml(html: string): boolean {
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  const candidate = bodyMatch?.[1] ?? html;
  const text = candidate.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, '').replace(/<[^>]+>/g, '').trim();
  return text.length === 0;
}

async function defaultFetchPage(url: string): Promise<ExplorePageResult> {
  const response = await fetch(url);
  return {
    status: response.status,
    body: await response.text()
  };
}

function safeUrl(value: string, base?: URL): URL | null {
  try {
    return base ? new URL(value, base) : new URL(value);
  } catch {
    return null;
  }
}

function isExplicitRouteSpecifier(value: string): boolean {
  return value.startsWith('/')
    || value.startsWith('./')
    || value.startsWith('../')
    || /^https?:\/\//i.test(value)
    || /^[a-z0-9][a-z0-9/_-]*$/i.test(value);
}

function firstPatternPosition(value: string, patterns: RegExp[]): number {
  const positions = patterns.flatMap((pattern) => {
    const match = pattern.exec(value);
    pattern.lastIndex = 0;
    return match?.index ?? -1;
  }).filter((position) => position >= 0);

  return positions.length > 0 ? Math.min(...positions) : -1;
}

function normalizeUrl(url: URL): string {
  url.hash = '';
  return url.toString().replace(/\/$/, url.pathname === '/' ? '/' : '');
}

function normalizeSameOriginLinks(links: string[], baseUrl: string): string[] {
  const base = safeUrl(baseUrl);

  if (!base) {
    return [];
  }

  return links.flatMap((link) => {
    const url = safeUrl(link, base);

    if (!url || url.origin !== base.origin) {
      return [];
    }

    return [normalizeUrl(url)];
  });
}
