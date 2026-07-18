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
  /* Reachability is shown because the graph previously implied the whole chain ships in
     the CLI. Patch plan and acceptance are internal pnpm scripts in this repository, not
     commands a user of the distributed CLI can run. */
  reachabilityLabels: {
    cli: string;
    internal: string;
  };
  nodes: Array<{
    id: 'docs' | 'code' | 'tests' | 'adrs' | 'repair' | 'patch' | 'acceptance';
    label: string;
    status: string;
    variant: 'verified' | 'generated' | 'accepted';
    reachability: 'cli' | 'internal';
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
    answers: string;
    assuranceGraph: string;
    artifacts: string;
    openCore: string;
    trust: string;
    privatePreview: string;
    toggleNavigation: string;
  };
  hero: {
    status: string;
    heading: string;
    lede: string;
    highlight: string;
    primaryCta: string;
    secondaryCta: string;
  };
  heroRunSummary: {
    label: string;
    items: Array<{
      label: string;
      value: string;
    }>;
  };
  answers: {
    label: string;
    heading: string;
    intro: string;
    items: Array<{
      id: 'ready' | 'evidence' | 'blocking' | 'next';
      question: string;
      text: string;
      value: string;
      highlight: string;
    }>;
  };
  roles: {
    label: string;
    heading: string;
    intro: string;
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
    diagram: {
      label: string;
      nodes: Array<{
        id: string;
        title: string;
        caption: string;
      }>;
    };
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
    designPartnerNote: string;
    emailLabel: string;
    emailPlaceholder: string;
    submit: string;
    idleStatus: string;
    submittedStatus: string;
  };
  footer: {
    description: string;
    linksLabel: string;
    note: string;
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
      answers: 'What it answers',
      assuranceGraph: 'Assurance Graph',
      artifacts: 'Proof artifacts',
      openCore: 'Open core',
      trust: 'Trust',
      privatePreview: 'Private preview',
      toggleNavigation: 'Toggle navigation'
    },
    hero: {
      status: 'Local-first by design',
      heading: 'Is this AI-generated repo ready to ship?',
      lede: 'RepoAssure boots your app, drives it with real Chromium, and turns what breaks into a readiness score, an evidence bundle, and a repair plan your AI IDE can execute. Entirely on your machine.',
      highlight:
        'Verified inputs become content-hashed artifacts and local acceptance decisions — without leaving your machine.',
      primaryCta: 'Join private preview',
      secondaryCta: 'View assurance graph'
    },
    heroRunSummary: {
      label: 'Latest local run',
      items: [
        { label: 'Readiness score', value: '85 · P0: 0 · P1: 1' },
        { label: 'Findings', value: '1 issue · 1 repair action' },
        { label: 'Evidence bundle', value: '.hardening/latest/manifest.json' }
      ]
    },
    answers: {
      label: 'What it answers',
      heading: 'Four questions a reviewer actually asks',
      intro:
        'Every run answers the same four questions, with evidence attached to each answer. Figures below come from a recorded benchmark run.',
      items: [
        {
          id: 'ready',
          question: 'Is this repo ready to ship?',
          text: 'Readiness starts at 100 and deducts per finding: 35 for a P0, 15 for a P1, 5 for a P2, 25 if the app never booted. The formula is published, so the number can be checked.',
          value: 'readiness · P0: 0 · P1: 1',
          highlight: '85'
        },
        {
          id: 'evidence',
          question: 'What evidence proves it?',
          text: 'Each run writes an evidence bundle. Every artifact records a content fingerprint, so anyone can recompute it on another machine and confirm nothing changed.',
          value: 'artifacts · all verified',
          highlight: '4'
        },
        {
          id: 'blocking',
          question: 'What is still blocking acceptance?',
          text: 'Findings are grouped by severity and reviewer impact, each with reproduction steps and captured evidence rather than a bare warning.',
          value: 'P1 finding · no P0 blockers',
          highlight: '1'
        },
        {
          id: 'next',
          question: 'What should the AI IDE fix first?',
          text: 'The repair plan is ordered and carries a root-cause hypothesis, target areas, and verification commands. An AI IDE consumes it directly instead of guessing.',
          value: 'repair action · sequenced for handoff',
          highlight: '1'
        }
      ]
    },
    roles: {
      label: 'Delivery roles',
      heading: 'Who reads what, locally',
      intro: 'The same bundle serves four readers. None of them has to trust the other three.'
    },
    assuranceGraph: {
      label: 'Assurance Graph',
      centerLabel: 'All checks verified',
      verifiedLabel: 'Verified',
      generatedLabel: 'Generated',
      producesLabel: 'Produces',
      reachabilityLabels: { cli: 'In the CLI', internal: 'Internal tooling' },
      nodes: [
        { id: 'docs', label: 'Docs', status: 'Verified', variant: 'verified', reachability: 'cli' },
        { id: 'code', label: 'Code', status: 'Verified', variant: 'verified', reachability: 'cli' },
        { id: 'tests', label: 'Tests', status: 'Verified', variant: 'verified', reachability: 'cli' },
        { id: 'adrs', label: 'ADRs', status: 'Verified', variant: 'verified', reachability: 'cli' },
        { id: 'repair', label: 'Repair Plan', status: 'Generated', variant: 'generated', reachability: 'cli' },
        { id: 'patch', label: 'Patch Plan', status: 'Generated', variant: 'generated', reachability: 'internal' },
        { id: 'acceptance', label: 'Acceptance', status: 'Accepted', variant: 'accepted', reachability: 'internal' }
      ]
    },
    assuranceGraphSection: {
      label: 'Assurance Graph',
      heading: 'See how local evidence connects across the delivery loop',
      intro:
        'Verified inputs produce content-hashed artifacts and acceptance decisions without leaving your machine.'
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
          summary: '1 finding',
          detail: '8 high · 27 medium',
          evidence: 'sha256: af83...b91c'
        },
        {
          id: 'repair',
          artifact: 'Repair plan',
          status: 'Generated',
          timestamp: '2026-06-18 10:48:47Z',
          summary: '1 action',
          detail: 'Prioritized',
          evidence: 'sha256: d2c7...770e' },
        {
          id: 'patch',
          artifact: 'Patch plan',
          status: 'Generated',
          timestamp: '2026-06-18 10:48:47Z',
          summary: 'Patch candidates',
          detail: 'Ready to apply',
          evidence: 'sha256: 1c9a...e3d4' },
        {
          id: 'acceptance',
          artifact: 'Acceptance',
          status: 'Accepted',
          timestamp: '2026-06-18 10:50:02Z',
          summary: 'Risk: Low',
          detail: 'Policy: team-default',
          evidence: 'sha256: 9e21...c5ab' }
      ],
      footer: 'Every artifact is content-hashed and stored locally.',
      localNote: 'Evidence never leaves your machine.',
      localBadge: '100% LOCAL'
    },
    cliDemo: {
      label: 'How it works',
      heading: 'Run hardening locally in one command',
      intro:
        'RepoAssure analyzes your AI-generated repo, boots the app when needed, explores routes, and writes a content-hashed artifact bundle under .hardening/.',
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
          text: 'Records acceptance decisions with content-hashed local evidence.'
        }
      ]
    },
    artifacts: {
      label: 'Proof artifacts',
      heading: 'Evidence that stands up to review',
      intro: 'Every run produces a content-hashed artifact bundle. Nothing leaves your machine by default.',
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
          detail: '1 finding, grouped by severity and reviewer impact.',
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
          evidence: 'sha256: d2c7...770e',
          detail: '1 action, sequenced for AI IDE or maintainer execution.',
          previewHeading: 'repair-plan.json task excerpt',
          previewLines: [
            { kind: 'meta', label: 'Tasks', text: 'Prioritized actions for AI IDE handoff' },
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
          detail: 'Reviewable patch candidates, evaluated before anything is applied.',
          previewHeading: 'patch-plan.md candidate',
          previewLines: [
            { kind: 'meta', label: 'Candidates', text: 'Reviewable patches before apply' },
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
      repositoryNote: 'Public repository link opens after the public release gate closes.',
      diagram: {
        label: 'Local-first open core flow',
        nodes: [
          { id: 'repo', title: 'AI repo', caption: 'Local workspace' },
          { id: 'engine', title: 'RepoAssure', caption: 'CLI · MCP · Action' },
          { id: 'bundle', title: '.hardening/', caption: 'Hashed artifacts' },
          { id: 'acceptance', title: 'Acceptance', caption: 'Local decision' }
        ]
      }
    },
    roadmap: {
      label: 'Evidence model · Team Cloud planned',
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
          title: 'Two network calls, both to localhost',
          text: 'The product makes exactly two network calls: one health probe and one page crawl, both against the app being tested. There is no third, and no telemetry SDK. Count them yourself.'
        },
        {
          title: 'It cannot write to your repo',
          text: 'Repair plans are plans. Every execution artifact carries a machine-readable no-write proof: targetRepoWriteAuthorized: false.'
        },
        {
          title: 'Tampering shows up',
          text: 'Every artifact records a content fingerprint. Recompute it on another machine and confirm nothing changed — without trusting RepoAssure.'
        }
      ]
    },
    preview: {
      heading: 'Join the private preview',
      body: 'Help shape the future of trustworthy AI code delivery.',
      designPartnerNote:
        'Private preview includes invited engineering teams. Partner names are shared only with permission — no public logo wall yet.',
      emailLabel: 'Work email',
      emailPlaceholder: 'you@example.com',
      submit: 'Join private preview',
      idleStatus: 'Access is by invitation only. Not for public distribution.',
      submittedStatus: 'Request noted locally for this prototype.'
    },
    footer: {
      description: 'Local-first assurance for AI-generated repositories.',
      linksLabel: 'Footer navigation',
      note: 'Private preview · invitation only.'
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
      answers: '它回答什么',
      assuranceGraph: '保障图谱',
      artifacts: '证据物料',
      openCore: '开放核心',
      trust: '信任边界',
      privatePreview: '私密预览',
      toggleNavigation: '切换导航'
    },
    hero: {
      status: '本地优先设计',
      heading: '这个 AI 生成的仓库，能交付了吗？',
      lede: 'RepoAssure 启动你的应用，用真实 Chromium 跑一遍，把出问题的地方变成就绪度评分、证据包，和你的 AI IDE 能直接执行的修复计划。全程在你的机器上。',
      highlight: '已验证输入在本地生成带内容指纹的证据与验收决策，交付链路全程可审计。',
      primaryCta: '加入私密预览',
      secondaryCta: '查看保障图谱'
    },
    heroRunSummary: {
      label: '最近一次本地运行',
      items: [
        { label: '就绪度评分', value: '85 · P0: 0 · P1: 1' },
        { label: '发现项', value: '1 个问题 · 1 个修复动作' },
        { label: '证据包', value: '.hardening/latest/manifest.json' }
      ]
    },
    answers: {
      label: '它回答什么',
      heading: '评审者真正会问的四个问题',
      intro: '每次运行都回答同样四个问题，每个答案都附带证据。下面的数字来自一次真实的基准运行记录。',
      items: [
        {
          id: 'ready',
          question: '这个仓库能交付吗？',
          text: '就绪度从 100 起扣：P0 每条 −35，P1 −15，P2 −5，应用启动失败 −25。算法公开，分数可以复核。',
          value: '就绪度 · P0: 0 · P1: 1',
          highlight: '85'
        },
        {
          id: 'evidence',
          question: '凭什么证据？',
          text: '每次运行产出一个证据包。每份物料都记录内容指纹，换一台机器重算就能确认它没被改过。',
          value: '份物料 · 全部校验通过',
          highlight: '4'
        },
        {
          id: 'blocking',
          question: '还有什么卡着验收？',
          text: '发现项按严重级别和评审影响分组，每条都带复现步骤和抓取到的证据，而不是一句「有问题」。',
          value: '项 P1 · 无 P0 阻塞',
          highlight: '1'
        },
        {
          id: 'next',
          question: '下一个 AI IDE 该先修什么？',
          text: '修复计划已排序，带根因假设、目标区域和验证命令。AI IDE 直接消费，不用猜。',
          value: '个动作 · 已排序待交接',
          highlight: '1'
        }
      ]
    },
    roles: {
      label: '交付角色',
      heading: '谁在本地审查什么',
      intro: '同一个证据包服务四类读者，而他们彼此之间不需要互相信任。'
    },
    assuranceGraph: {
      label: '保障图谱',
      centerLabel: '所有检查已验证',
      verifiedLabel: '已验证',
      generatedLabel: '已生成',
      producesLabel: '生成',
      reachabilityLabels: { cli: 'CLI 可达', internal: '内部工具' },
      nodes: [
        { id: 'docs', label: '文档', status: '已验证', variant: 'verified', reachability: 'cli' },
        { id: 'code', label: '代码', status: '已验证', variant: 'verified', reachability: 'cli' },
        { id: 'tests', label: '测试', status: '已验证', variant: 'verified', reachability: 'cli' },
        { id: 'adrs', label: 'ADR', status: '已验证', variant: 'verified', reachability: 'cli' },
        { id: 'repair', label: '修复计划', status: '已生成', variant: 'generated', reachability: 'cli' },
        { id: 'patch', label: '补丁计划', status: '已生成', variant: 'generated', reachability: 'internal' },
        { id: 'acceptance', label: '验收决策', status: '已接受', variant: 'accepted', reachability: 'internal' }
      ]
    },
    assuranceGraphSection: {
      label: '保障图谱',
      heading: '看清本地证据如何在交付链路中串联',
      intro: '已验证输入会生成带内容指纹的证据与验收决策，全程不离开你的机器。'
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
          summary: '1 个发现',
          detail: '8 个高危 · 27 个中危',
          evidence: 'sha256: af83...b91c'
        },
        {
          id: 'repair',
          artifact: '修复计划',
          status: '已生成',
          timestamp: '2026-06-18 10:48:47Z',
          summary: '1 个动作',
          detail: '已排序',
          evidence: 'sha256: d2c7...770e' },
        {
          id: 'patch',
          artifact: '补丁计划',
          status: '已生成',
          timestamp: '2026-06-18 10:48:47Z',
          summary: '补丁候选',
          detail: '可应用',
          evidence: 'sha256: 1c9a...e3d4' },
        {
          id: 'acceptance',
          artifact: '验收决策',
          status: '已接受',
          timestamp: '2026-06-18 10:50:02Z',
          summary: '风险：低',
          detail: '策略：team-default',
          evidence: 'sha256: 9e21...c5ab' }
      ],
      footer: '每份证据物料都会在本地生成内容指纹并存储。',
      localNote: '证据永远不会离开你的机器。',
      localBadge: '100% 本地'
    },
    cliDemo: {
      label: '工作方式',
      heading: '一条命令在本地完成硬化',
      intro:
        'RepoAssure 会分析 AI 生成仓库，在需要时启动应用、探索路由，并把带内容指纹的证据包写入 .hardening/。',
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
          text: '用带内容指纹的本地证据记录验收决策。'
        }
      ]
    },
    artifacts: {
      label: '证据物料',
      heading: '经得起评审的交付证据',
      intro: '每次运行都会生成带内容指纹的证据包。默认情况下，任何内容都不会离开你的机器。',
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
          detail: '1 个发现，已按严重级别和评审影响分组。',
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
          evidence: 'sha256: d2c7...770e',
          detail: '1 个动作，可交给 AI IDE 或维护者执行。',
          previewHeading: 'repair-plan.json 任务摘要',
          previewLines: [
            { kind: 'meta', label: '任务数', text: '已排序动作，供 AI IDE 交接' },
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
          detail: '可评审的补丁候选，应用前先评估。',
          previewHeading: 'patch-plan.md 候选补丁',
          previewLines: [
            { kind: 'meta', label: '候选数', text: '可评审补丁，应用前需确认' },
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
      repositoryNote: '公开仓库链接将在公开发布门禁关闭后开放。',
      diagram: {
        label: '本地优先开放核心流程',
        nodes: [
          { id: 'repo', title: 'AI 仓库', caption: '本地工作区' },
          { id: 'engine', title: 'RepoAssure', caption: 'CLI · MCP · Action' },
          { id: 'bundle', title: '.hardening/', caption: '带指纹的证据' },
          { id: 'acceptance', title: '验收决策', caption: '本地记录' }
        ]
      }
    },
    roadmap: {
      label: '证据模型 · Team Cloud 计划中',
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
          title: '网络调用只有两处，都打本地',
          text: '产品代码里的网络调用总共两个：一个健康探测、一个页面爬取，都指向被测应用本身。没有第三个，也没有任何遥测 SDK。你可以自己数。'
        },
        {
          title: '它不能改你的仓库',
          text: '修复计划就只是计划。每份执行产物都带机器可读的不写入证明：targetRepoWriteAuthorized: false。'
        },
        {
          title: '改过就能看出来',
          text: '每份产出都记录了内容指纹。换一台机器重算一遍，就能确认它没被改过——不需要相信 RepoAssure。'
        }
      ]
    },
    preview: {
      heading: '加入私密预览',
      body: '一起塑造可信 AI 代码交付的未来。',
      designPartnerNote: '私密预览面向受邀工程团队。合作伙伴名称仅在获得授权后共享，当前不展示公开 logo 墙。',
      emailLabel: '工作邮箱',
      emailPlaceholder: 'you@example.com',
      submit: '加入私密预览',
      idleStatus: '访问仅限邀请。当前不面向公众分发。',
      submittedStatus: '请求已在此原型中本地记录。'
    },
    footer: {
      description: '为 AI 生成仓库提供本地优先的可信保障。',
      linksLabel: '页脚导航',
      note: '私密预览 · 仅限邀请。'
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
