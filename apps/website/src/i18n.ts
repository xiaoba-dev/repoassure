import { useEffect, useMemo, useState } from 'react';

export const defaultLocale = 'en';
export const supportedLocales = ['en', 'zh-CN'] as const;
export const roadmapLocales = ['ja', 'ko'] as const;

export type SupportedLocale = (typeof supportedLocales)[number];
export type RoadmapLocale = (typeof roadmapLocales)[number];

export type ArtifactId = 'hardening' | 'repair' | 'patch' | 'acceptance';

export type TrustLedgerPreviewCopy = {
  label: string;
  brand: string;
  title: string;
  subtitle: string;
  runIdLabel: string;
  runId: string;
  sidebar: string[];
  columns: {
    artifact: string;
    status: string;
    summary: string;
    evidence: string;
  };
  rows: Array<{
    id: ArtifactId;
    artifact: string;
    status: string;
    timestamp: string;
    summary: string;
    detail: string;
    evidence: string;
  }>;
  footer: string;
  localNote: string;
  localBadge: string;
};

export type AssuranceGraphCopy = {
  label: string;
  centerLabel: string;
  verifiedLabel: string;
  generatedLabel: string;
  producesLabel: string;
  nodes: Array<{
    id: 'docs' | 'code' | 'tests' | 'adrs' | 'repair' | 'patch' | 'acceptance';
    label: string;
    status: string;
    variant: 'verified' | 'generated' | 'accepted';
  }>;
};

type WebsiteCopy = {
  meta: {
    title: string;
    description: string;
  };
  language: {
    label: string;
    options: Record<SupportedLocale, string>;
  };
  nav: {
    howItWorks: string;
    assuranceGraph: string;
    artifacts: string;
    openCore: string;
    roadmap: string;
    trust: string;
    privatePreview: string;
    toggleNavigation: string;
  };
  hero: {
    status: string;
    heading: string;
    lede: string;
    assurances: string[];
    primaryCta: string;
    secondaryCta: string;
    privacyNote: string;
  };
  assuranceGraph: AssuranceGraphCopy;
  assuranceGraphSection: {
    label: string;
    heading: string;
    intro: string;
  };
  trustLedgerPreview: TrustLedgerPreviewCopy;
  cliDemo: {
    label: string;
    heading: string;
    intro: string;
    command: string;
    lines: string[];
    footnote: string;
  };
  steps: {
    label: string;
    heading: string;
    items: Array<{
      title: string;
      text: string;
    }>;
  };
  artifacts: {
    label: string;
    heading: string;
    intro: string;
    tabLabel: string;
    statusLabel: string;
    evidenceLabel: string;
    detailLabel: string;
    previewLabel: string;
    items: Record<
      ArtifactId,
      {
        name: string;
        status: string;
        summary: string;
        evidence: string;
        detail: string;
        previewHeading: string;
        previewLines: Array<{
          kind: 'meta' | 'finding' | 'code' | 'json';
          label?: string;
          severity?: 'P0' | 'P1' | 'P2';
          text: string;
        }>;
      }
    >;
  };
  openCore: {
    label: string;
    heading: string;
    body: string;
    bullets: string[];
    link: string;
    repositoryNote: string;
  };
  roadmap: {
    label: string;
    heading: string;
    body: string;
    bullets: string[];
    note: string;
  };
  trust: {
    label: string;
    heading: string;
    items: Array<{
      title: string;
      text: string;
    }>;
  };
  preview: {
    heading: string;
    body: string;
    emailLabel: string;
    emailPlaceholder: string;
    submit: string;
    idleStatus: string;
    submittedStatus: string;
  };
  footer: {
    description: string;
    product: string;
    community: string;
    company: string;
    repository: string;
    contributing: string;
    privacy: string;
    contact: string;
    previewTitle: string;
    previewText: string;
  };
};

export const artifactOrder: ArtifactId[] = ['hardening', 'repair', 'patch', 'acceptance'];

export const locales: Record<SupportedLocale, WebsiteCopy> = {
  en: {
    meta: {
      title: 'RepoAssure',
      description:
        'RepoAssure proves AI-generated repositories are ready to ship with local-first assurance artifacts.'
    },
    language: {
      label: 'Language',
      options: {
        en: 'English',
        'zh-CN': '简体中文'
      }
    },
    nav: {
      howItWorks: 'How it works',
      assuranceGraph: 'Assurance Graph',
      artifacts: 'Proof artifacts',
      openCore: 'Open core',
      roadmap: 'Evidence model',
      trust: 'Trust',
      privatePreview: 'Private preview',
      toggleNavigation: 'Toggle navigation'
    },
    hero: {
      status: 'Local-first by design',
      heading: 'Assure every AI-generated repo before it ships',
      lede: 'Signed local evidence, repair plans, and acceptance decisions for AI-generated repositories.',
      assurances: ['Docs, code, tests, and ADRs verified', 'Repair plans and patch plans generated', 'Acceptance decisions signed locally'],
      primaryCta: 'Join private preview',
      secondaryCta: 'View evidence model',
      privacyNote: 'Evidence never leaves your machine.'
    },
    assuranceGraph: {
      label: 'Assurance Graph',
      centerLabel: 'All checks verified',
      verifiedLabel: 'Verified',
      generatedLabel: 'Generated',
      producesLabel: 'Produces',
      nodes: [
        { id: 'docs', label: 'Docs', status: 'Verified', variant: 'verified' },
        { id: 'code', label: 'Code', status: 'Verified', variant: 'verified' },
        { id: 'tests', label: 'Tests', status: 'Verified', variant: 'verified' },
        { id: 'adrs', label: 'ADRs', status: 'Verified', variant: 'verified' },
        { id: 'repair', label: 'Repair Plan', status: 'Generated', variant: 'generated' },
        { id: 'patch', label: 'Patch Plan', status: 'Generated', variant: 'generated' },
        { id: 'acceptance', label: 'Acceptance', status: 'Accepted', variant: 'accepted' }
      ]
    },
    assuranceGraphSection: {
      label: 'Assurance Graph',
      heading: 'See how local evidence connects across the delivery loop',
      intro:
        'Verified inputs produce signed artifacts and acceptance decisions without leaving your machine.'
    },
    trustLedgerPreview: {
      label: 'Trust Ledger product preview',
      brand: 'RepoAssure',
      title: 'Trust Ledger',
      subtitle: 'Evidence generated locally',
      runIdLabel: 'Run ID',
      runId: 'run-2026-06-18T10-48-49-735Z',
      sidebar: ['Overview', 'Hardening report', 'Repair plan', 'Patch plan', 'Acceptance', 'Environment', 'Provenance'],
      columns: {
        artifact: 'Artifact',
        status: 'Status',
        summary: 'Summary',
        evidence: 'Evidence'
      },
      rows: [
        {
          id: 'hardening',
          artifact: 'Hardening report',
          status: 'Generated',
          timestamp: '2026-06-18 10:48:47Z',
          summary: '214 findings',
          detail: '8 high · 27 medium',
          evidence: 'sha256: af83...b91c'
        },
        {
          id: 'repair',
          artifact: 'Repair plan',
          status: 'Generated',
          timestamp: '2026-06-18 10:48:47Z',
          summary: '38 actions',
          detail: 'Prioritized',
          evidence: 'sha256: d2c7...770e'
        },
        {
          id: 'patch',
          artifact: 'Patch plan',
          status: 'Generated',
          timestamp: '2026-06-18 10:48:47Z',
          summary: '24 patches',
          detail: 'Ready to apply',
          evidence: 'sha256: 1c9a...e3d4'
        },
        {
          id: 'acceptance',
          artifact: 'Acceptance',
          status: 'Accepted',
          timestamp: '2026-06-18 10:50:02Z',
          summary: 'Risk: Low',
          detail: 'Policy: team-default',
          evidence: 'sha256: 9e21...c5ab'
        }
      ],
      footer: 'All artifacts are signed and stored locally.',
      localNote: 'Evidence never leaves your machine.',
      localBadge: '100% LOCAL'
    },
    cliDemo: {
      label: 'How it works',
      heading: 'Run hardening locally in one command',
      intro:
        'RepoAssure analyzes your AI-generated repo, boots the app when needed, explores routes, and writes a signed artifact bundle under .hardening/.',
      command: 'pnpm hardening run ./my-ai-app --browser',
      lines: [
        'Repo profile detected: vite · npm',
        'Booted http://127.0.0.1:5173',
        'Generated hardening-report.md, repair-plan.json, repair-task-package.json',
        'Latest bundle: .hardening/latest/manifest.json'
      ],
      footnote: 'No source upload. Artifacts stay on your machine.'
    },
    steps: {
      label: 'Delivery roles',
      heading: 'Who reviews what, locally',
      items: [
        {
          title: 'Developer',
          text: 'Runs hardening, inspects findings, and hands repair tasks to the IDE.'
        },
        {
          title: 'Reviewer',
          text: 'Reads reports, repair plans, and patch plans before approving delivery.'
        },
        {
          title: 'AI IDE',
          text: 'Consumes repair-plan.json and repair-task-package.json without cloud upload.'
        },
        {
          title: 'Maintainer',
          text: 'Records acceptance decisions with signed local evidence.'
        }
      ]
    },
    artifacts: {
      label: 'Proof artifacts',
      heading: 'Evidence that stands up to review',
      intro: 'Every run produces a signed artifact bundle. Nothing leaves your machine by default.',
      tabLabel: 'Artifact examples',
      statusLabel: 'Status',
      evidenceLabel: 'Evidence',
      detailLabel: 'Review detail',
      previewLabel: 'Artifact preview',
      items: {
        hardening: {
          name: 'Hardening report',
          status: 'Generated',
          summary: 'Findings, severity, and evidence mapped to policy rules and best practices.',
          evidence: 'sha256: af83...b91c',
          detail: '214 findings, grouped by severity and reviewer impact.',
          previewHeading: 'hardening-report.md excerpt',
          previewLines: [
            { kind: 'meta', label: 'Readiness score', text: '85 · P0: 0 · P1: 1' },
            {
              kind: 'finding',
              severity: 'P1',
              text: 'Interaction did not produce an observable result on /settings (dead_control).'
            },
            { kind: 'code', text: 'click_error=TimeoutError: page.click: Timeout 1000ms exceeded.' }
          ]
        },
        repair: {
          name: 'Repair plan',
          status: 'Generated',
          summary: 'Actionable repair steps to address issues with prioritization and rationale.',
          evidence: 'sha256: dc27...7f0e',
          detail: '38 actions, sequenced for AI IDE or maintainer execution.',
          previewHeading: 'repair-plan.json task excerpt',
          previewLines: [
            { kind: 'meta', label: 'Tasks', text: '38 prioritized actions for AI IDE handoff' },
            {
              kind: 'json',
              text: '{\n  "taskId": "repair-014",\n  "severity": "P1",\n  "title": "Stabilize Save control on /settings"\n}'
            }
          ]
        },
        patch: {
          name: 'Patch plan',
          status: 'Generated',
          summary: 'Minimal, reviewable changes with context and risk assessment.',
          evidence: 'sha256: 1c9a...e3d4',
          detail: '24 patches, ready to evaluate before application.',
          previewHeading: 'patch-plan.md candidate',
          previewLines: [
            { kind: 'meta', label: 'Candidates', text: '24 reviewable patches before apply' },
            { kind: 'code', text: 'ruff I001 · sort imports in src/components/SettingsForm.tsx' }
          ]
        },
        acceptance: {
          name: 'Acceptance',
          status: 'Accepted',
          summary: 'Final decision, policy version, and risk rating for audit.',
          evidence: 'sha256: 9e21...c5ab',
          detail: 'Reviewer decision recorded with low delivery risk.',
          previewHeading: 'acceptance decision record',
          previewLines: [
            { kind: 'meta', label: 'Decision', text: 'Accepted · Risk: Low · Policy: team-default' },
            { kind: 'meta', label: 'Reviewer', text: 'Recorded locally at 2026-06-18 10:50:02Z' }
          ]
        }
      }
    },
    openCore: {
      label: 'Open core',
      heading: 'Built in the open. Trusted by design.',
      body:
        'RepoAssure is open core. The core engine, policies, and artifact formats are transparent and community-driven.',
      bullets: [
        'Core engine and artifact specs in the open',
        'Pluggable policies and analyzers',
        'Reproducible, auditable, verifiable'
      ],
      link: 'Explore the repository',
      repositoryNote: 'Public repository link opens after the public release gate closes.'
    },
    roadmap: {
      label: 'Team Cloud / Enterprise planned',
      heading: 'Roadmap: Team Cloud and Enterprise',
      body: 'Secure collaboration, centralized policy, and audit at scale.',
      bullets: [
        'Artifact storage and sharing',
        'Role-based access and approvals',
        'Enterprise policy management',
        'Audit trails and compliance exports'
      ],
      note: 'Planned. Focused on private preview.'
    },
    trust: {
      label: 'Trust boundary',
      heading: 'Your code stays with you',
      items: [
        {
          title: 'No source upload by default',
          text: 'All analysis and artifact generation happens locally on your machine.'
        },
        {
          title: 'Cryptographically verifiable',
          text: 'Artifacts are signed. Integrity can be verified independent of RepoAssure.'
        },
        {
          title: 'You control storage',
          text: 'Store artifacts wherever you choose. We do not store your code.'
        }
      ]
    },
    preview: {
      heading: 'Join the private preview',
      body: 'Help shape the future of trustworthy AI code delivery.',
      emailLabel: 'Work email',
      emailPlaceholder: 'you@example.com',
      submit: 'Join private preview',
      idleStatus: 'Access is by invitation only. Not for public distribution.',
      submittedStatus: 'Request noted locally for this prototype.'
    },
    footer: {
      description: 'AI code delivery assurance with verifiable, local-first evidence.',
      product: 'Product',
      community: 'Community',
      company: 'Company',
      repository: 'Repository',
      contributing: 'Contributing',
      privacy: 'Privacy',
      contact: 'Contact',
      previewTitle: 'Private preview',
      previewText: 'Access is by invitation only. Not for public distribution.'
    }
  },
  'zh-CN': {
    meta: {
      title: 'RepoAssure',
      description: 'RepoAssure 用本地优先的可信证据，证明 AI 生成的仓库已经达到可交付状态。'
    },
    language: {
      label: '语言',
      options: {
        en: 'English',
        'zh-CN': '简体中文'
      }
    },
    nav: {
      howItWorks: '工作方式',
      assuranceGraph: '保障图谱',
      artifacts: '证据物料',
      openCore: '开放核心',
      roadmap: '证据模型',
      trust: '信任边界',
      privatePreview: '私密预览',
      toggleNavigation: '切换导航'
    },
    hero: {
      status: '本地优先设计',
      heading: '在交付前保障每个 AI 生成仓库',
      lede: '为 AI 生成仓库提供已签名的本地证据、修复计划和验收决策。',
      assurances: ['文档、代码、测试和 ADR 已验证', '修复计划和补丁计划已生成', '验收决策在本地签名'],
      primaryCta: '加入私密预览',
      secondaryCta: '查看证据模型',
      privacyNote: '证据永远不会离开你的机器。'
    },
    assuranceGraph: {
      label: '保障图谱',
      centerLabel: '所有检查已验证',
      verifiedLabel: '已验证',
      generatedLabel: '已生成',
      producesLabel: '生成',
      nodes: [
        { id: 'docs', label: '文档', status: '已验证', variant: 'verified' },
        { id: 'code', label: '代码', status: '已验证', variant: 'verified' },
        { id: 'tests', label: '测试', status: '已验证', variant: 'verified' },
        { id: 'adrs', label: 'ADR', status: '已验证', variant: 'verified' },
        { id: 'repair', label: '修复计划', status: '已生成', variant: 'generated' },
        { id: 'patch', label: '补丁计划', status: '已生成', variant: 'generated' },
        { id: 'acceptance', label: '验收决策', status: '已接受', variant: 'accepted' }
      ]
    },
    assuranceGraphSection: {
      label: '保障图谱',
      heading: '看清本地证据如何在交付链路中串联',
      intro: '已验证输入会生成签名证据与验收决策，全程不离开你的机器。'
    },
    trustLedgerPreview: {
      label: 'Trust Ledger 产品预览',
      brand: 'RepoAssure',
      title: '信任账本',
      subtitle: '本地生成的证据',
      runIdLabel: '运行 ID',
      runId: 'run-2026-06-18T10-48-49-735Z',
      sidebar: ['概览', '硬化报告', '修复计划', '补丁计划', '验收决策', '环境', '来源'],
      columns: {
        artifact: '物料',
        status: '状态',
        summary: '摘要',
        evidence: '证据'
      },
      rows: [
        {
          id: 'hardening',
          artifact: '硬化报告',
          status: '已生成',
          timestamp: '2026-06-18 10:48:47Z',
          summary: '214 个发现',
          detail: '8 个高危 · 27 个中危',
          evidence: 'sha256: af83...b91c'
        },
        {
          id: 'repair',
          artifact: '修复计划',
          status: '已生成',
          timestamp: '2026-06-18 10:48:47Z',
          summary: '38 个动作',
          detail: '已排序',
          evidence: 'sha256: d2c7...770e'
        },
        {
          id: 'patch',
          artifact: '补丁计划',
          status: '已生成',
          timestamp: '2026-06-18 10:48:47Z',
          summary: '24 个补丁',
          detail: '可应用',
          evidence: 'sha256: 1c9a...e3d4'
        },
        {
          id: 'acceptance',
          artifact: '验收决策',
          status: '已接受',
          timestamp: '2026-06-18 10:50:02Z',
          summary: '风险：低',
          detail: '策略：team-default',
          evidence: 'sha256: 9e21...c5ab'
        }
      ],
      footer: '所有证据物料都会在本地签名并存储。',
      localNote: '证据永远不会离开你的机器。',
      localBadge: '100% 本地'
    },
    cliDemo: {
      label: '工作方式',
      heading: '一条命令在本地完成硬化',
      intro:
        'RepoAssure 会分析 AI 生成仓库，在需要时启动应用、探索路由，并把签名证据包写入 .hardening/。',
      command: 'pnpm hardening run ./my-ai-app --browser',
      lines: [
        '已识别仓库配置：vite · npm',
        '已启动 http://127.0.0.1:5173',
        '已生成 hardening-report.md、repair-plan.json、repair-task-package.json',
        '最新证据包：.hardening/latest/manifest.json'
      ],
      footnote: '默认不上传源码，证据保留在你的机器上。'
    },
    steps: {
      label: '交付角色',
      heading: '谁在本地审查什么',
      items: [
        {
          title: '开发者',
          text: '运行硬化流程，查看发现项，并把修复任务交给 IDE。'
        },
        {
          title: '评审者',
          text: '在批准交付前阅读报告、修复计划和补丁计划。'
        },
        {
          title: 'AI IDE',
          text: '消费 repair-plan.json 与 repair-task-package.json，无需云端上传。'
        },
        {
          title: '维护者',
          text: '用已签名的本地证据记录验收决策。'
        }
      ]
    },
    artifacts: {
      label: '证据物料',
      heading: '经得起评审的交付证据',
      intro: '每次运行都会生成已签名的证据包。默认情况下，任何内容都不会离开你的机器。',
      tabLabel: '证据示例',
      statusLabel: '状态',
      evidenceLabel: '证据',
      detailLabel: '评审细节',
      previewLabel: '物料预览',
      items: {
        hardening: {
          name: '硬化报告',
          status: '已生成',
          summary: '将发现、严重级别和证据映射到策略规则与最佳实践。',
          evidence: 'sha256: af83...b91c',
          detail: '214 个发现，已按严重级别和评审影响分组。',
          previewHeading: 'hardening-report.md 摘要',
          previewLines: [
            { kind: 'meta', label: '就绪度评分', text: '85 · P0: 0 · P1: 1' },
            {
              kind: 'finding',
              severity: 'P1',
              text: '/settings 页面 Save 控件交互未产生可观察结果（dead_control）。'
            },
            { kind: 'code', text: 'click_error=TimeoutError: page.click: Timeout 1000ms exceeded.' }
          ]
        },
        repair: {
          name: '修复计划',
          status: '已生成',
          summary: '按优先级和原因说明组织可执行修复步骤。',
          evidence: 'sha256: dc27...7f0e',
          detail: '38 个动作，可交给 AI IDE 或维护者执行。',
          previewHeading: 'repair-plan.json 任务摘要',
          previewLines: [
            { kind: 'meta', label: '任务数', text: '38 个已排序动作，供 AI IDE 交接' },
            {
              kind: 'json',
              text: '{\n  "taskId": "repair-014",\n  "severity": "P1",\n  "title": "稳定 /settings 页面 Save 控件"\n}'
            }
          ]
        },
        patch: {
          name: '补丁计划',
          status: '已生成',
          summary: '提供最小、可评审、带上下文和风险说明的变更。',
          evidence: 'sha256: 1c9a...e3d4',
          detail: '24 个补丁，可在应用前先评估。',
          previewHeading: 'patch-plan.md 候选补丁',
          previewLines: [
            { kind: 'meta', label: '候选数', text: '24 个可评审补丁，应用前需确认' },
            { kind: 'code', text: 'ruff I001 · 整理 src/components/SettingsForm.tsx 的 import' }
          ]
        },
        acceptance: {
          name: '验收决策',
          status: '已接受',
          summary: '记录最终决策、策略版本和审计风险等级。',
          evidence: 'sha256: 9e21...c5ab',
          detail: '评审决策已记录，交付风险较低。',
          previewHeading: '验收决策记录',
          previewLines: [
            { kind: 'meta', label: '决策', text: '已接受 · 风险：低 · 策略：team-default' },
            { kind: 'meta', label: '评审者', text: '已于 2026-06-18 10:50:02Z 在本地记录' }
          ]
        }
      }
    },
    openCore: {
      label: '开放核心',
      heading: '开放构建，以可信为设计原则。',
      body: 'RepoAssure 采用 open core 路线。核心引擎、策略和证据格式保持透明，并由社区共同演进。',
      bullets: ['核心引擎和证据规格保持开放', '支持可插拔策略与分析器', '可复现、可审计、可验证'],
      link: '查看代码仓库',
      repositoryNote: '公开仓库链接将在公开发布门禁关闭后开放。'
    },
    roadmap: {
      label: 'Team Cloud / Enterprise 计划中',
      heading: '路线图：Team Cloud 与 Enterprise',
      body: '面向团队协作、集中策略和规模化审计的安全能力。',
      bullets: ['证据存储与共享', '基于角色的访问与审批', '企业策略管理', '审计轨迹与合规导出'],
      note: '计划中。当前聚焦私密预览。'
    },
    trust: {
      label: '信任边界',
      heading: '你的代码留在你这里',
      items: [
        {
          title: '默认不上传源代码',
          text: '所有分析和证据生成都在你的本地环境中完成。'
        },
        {
          title: '可加密验证',
          text: '证据物料会被签名，完整性可独立于 RepoAssure 进行验证。'
        },
        {
          title: '你控制存储位置',
          text: '证据物料可以存放在你选择的位置。我们不存储你的代码。'
        }
      ]
    },
    preview: {
      heading: '加入私密预览',
      body: '一起塑造可信 AI 代码交付的未来。',
      emailLabel: '工作邮箱',
      emailPlaceholder: 'you@example.com',
      submit: '加入私密预览',
      idleStatus: '访问仅限邀请。当前不面向公众分发。',
      submittedStatus: '请求已在此原型中本地记录。'
    },
    footer: {
      description: '以可验证、本地优先证据保障 AI 代码交付。',
      product: '产品',
      community: '社区',
      company: '公司',
      repository: '代码仓库',
      contributing: '参与贡献',
      privacy: '隐私',
      contact: '联系',
      previewTitle: '私密预览',
      previewText: '访问仅限邀请。当前不面向公众分发。'
    }
  }
};

const storageKey = 'repoassure.website.locale';

export function isSupportedLocale(value: string | null): value is SupportedLocale {
  return supportedLocales.includes(value as SupportedLocale);
}

export function useWebsiteLocale() {
  const [locale, setLocaleState] = useState<SupportedLocale>(() => {
    if (typeof window === 'undefined') {
      return defaultLocale;
    }

    const storedLocale = window.localStorage.getItem(storageKey);
    if (isSupportedLocale(storedLocale)) {
      return storedLocale;
    }
    return defaultLocale;
  });

  const copy = locales[locale];

  useEffect(() => {
    document.documentElement.lang = locale;
    document.title = copy.meta.title;
    const description = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (description) {
      description.content = copy.meta.description;
    }
    window.localStorage.setItem(storageKey, locale);
  }, [copy.meta.description, copy.meta.title, locale]);

  const localeOptions = useMemo(
    () =>
      supportedLocales.map((option) => ({
        code: option,
        label: copy.language.options[option]
      })),
    [copy]
  );

  return {
    copy,
    locale,
    localeOptions,
    setLocale: setLocaleState
  };
}
