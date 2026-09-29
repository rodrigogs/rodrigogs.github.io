/**
 * Curated content: everything a person wrote, in both locales.
 *
 * Numbers never live here. Anything countable (stars, downloads, releases,
 * PRs, contributions) comes from src/data/snapshot.json and is joined by
 * repo or package name. What lives here is what no API can fetch (the notes,
 * a career timeline from the public LinkedIn profile).
 *
 * Copy rules: plain first person, specific, no hype, no emoji, no em dashes.
 * Templates use {placeholders} filled from the snapshot at render time.
 */

import type { Role } from '../design/tokens.ts';

export const locales = ['en', 'pt'] as const;
export type Locale = (typeof locales)[number];
export type L = Record<Locale, string>;

const l = (en: string, pt: string): L => ({ en, pt });

/** BCP 47 tags for <html lang>, Intl and hreflang. */
export const localeTag: Record<Locale, string> = { en: 'en', pt: 'pt-BR' };

export const person = {
  name: 'Rodrigo Gomes da Silva',
  handle: 'rodrigogs',
  email: 'rodrigo.smscom@gmail.com',
  github: 'https://github.com/rodrigogs',
  linkedin: 'https://www.linkedin.com/in/rodrigogomesdasilva/' as string | null,
  site: 'https://rodrigogs.github.io',
  /** First professional role (public LinkedIn). */
  since: 2010,
  location: l('Rio Grande do Sul, Brazil', 'Rio Grande do Sul, Brasil'),
  timezone: 'UTC−3',
  spoken: l('English, Portuguese', 'Português, inglês'),
  role: l('Senior software engineer', 'Engenheiro de software sênior'),
} as const;

/** Page-level copy. */
export const meta = {
  title: l(
    'Rodrigo Gomes da Silva, senior software engineer',
    'Rodrigo Gomes da Silva, engenheiro de software sênior',
  ),
  description: l(
    'Shipping software since 2010, senior since 2018. I build whole products, from data tooling to on-device AI. Work, open source, career and contact.',
    'Entregando software desde 2010, sênior desde 2018. Construo produtos completos, de ferramentas de dados à IA rodando no dispositivo. Trabalho, open source, carreira e contato.',
  ),
} as const;

export const hero = {
  title: l(
    'Senior software engineer building whole products, from data tooling to on‑device AI.',
    'Engenheiro de software sênior que constrói produtos completos, de ferramentas de dados à IA rodando no dispositivo.',
  ),
  /**
   * The three notes of the first viewport. `role` picks the plate color,
   * `label` is the plain noun on it; `{…}` placeholders are filled from the snapshot.
   */
  notes: [
    {
      role: 'changed' as Role,
      label: l('Role', 'Cargo'),
      text: l(
        'Senior Software Engineer at Globant, on the Disney Entertainment account since August 2025.',
        'Senior Software Engineer na Globant, atendendo a Disney Entertainment desde agosto de 2025.',
      ),
    },
    {
      role: 'added' as Role,
      label: l('Product', 'Produto'),
      /** {tag} {stars} {downloads} from repo whats-reader. */
      repo: 'whats-reader',
      text: l(
        'whats-reader: a privacy-first WhatsApp archive reader with {stars} stars and {downloads} downloads.',
        'whats-reader: um leitor de conversas exportadas do WhatsApp com foco em privacidade, com {stars} estrelas e {downloads} downloads.',
      ),
    },
    {
      role: 'merged' as Role,
      label: l('AI', 'IA'),
      text: l(
        'I use AI agents every day to plan, build and review, and nothing ships without tests and a real run.',
        'Uso agentes de IA todo dia para planejar, construir e revisar, e nada vai para produção sem testes e uma execução real.',
      ),
    },
  ],
  cta: {
    email: l('Email me', 'Enviar e-mail'),
    copy: l('Copy address', 'Copiar endereço'),
    copied: l('Copied', 'Copiado'),
  },
} as const;

/**
 * Sections in page order. `label` is the literal noun used in the nav and
 * the heading; `claim` is the one sentence each section opens with.
 */
export const sections = {
  about: {
    label: l('About', 'Sobre'),
    claim: l(
      "I've been shipping software since 2010, mostly for media and retail companies. Today I'm a Senior Software Engineer at Globant, working with Disney Entertainment, and I like owning a product end to end: the data, the API, the interface and the release.",
      'Entrego software desde 2010, principalmente para empresas de mídia e varejo. Hoje sou Senior Software Engineer na Globant, atendendo a Disney Entertainment, e gosto de cuidar de um produto de ponta a ponta: dados, API, interface e release.',
    ),
    body: l(
      'AI is part of how I work every day. I plan, build and review with Claude Code and a few MCP tools (a real browser, GitHub, current docs and web search), and I hold the result to the same bar as my own code: tests, review and a real run before anything ships.',
      'IA faz parte do meu dia a dia. Planejo, construo e reviso com o Claude Code e algumas ferramentas MCP (um navegador de verdade, GitHub, documentação atual e busca na web), e cobro do resultado o mesmo que cobro do meu código: testes, revisão e uma execução real antes de qualquer entrega.',
    ),
  },
  work: {
    label: l('Work', 'Trabalho'),
    claim: l(
      'Products and libraries I built and maintain, with live numbers.',
      'Produtos e bibliotecas que construí e mantenho, com números ao vivo.',
    ),
  },
  openSource: {
    label: l('Open source', 'Open source'),
    claim: l(
      "Fixes and features that landed in other people's projects.",
      'Correções e funcionalidades aceitas em projetos de outras pessoas.',
    ),
  },
  career: {
    label: l('Career', 'Carreira'),
    /** {years} */
    claim: l(
      '{years} years shipping software for media, retail and tax compliance.',
      '{years} anos entregando software para mídia, varejo e área fiscal.',
    ),
  },
  contact: {
    label: l('Contact', 'Contato'),
    claim: l(
      'Hiring for a senior or staff role? Write to me.',
      'Está contratando para uma vaga sênior ou staff? Me escreva.',
    ),
  },
} as const;

export type SectionKey = keyof typeof sections;
export const sectionOrder: SectionKey[] = ['about', 'work', 'openSource', 'career', 'contact'];

/** Labels of the proof numbers and links an entry carries. */
export const field = {
  stars: l('stars', 'estrelas'),
  downloadsMonth: l('downloads / 30 days', 'downloads / 30 dias'),
  downloadsYear: l('downloads / year', 'downloads / ano'),
  downloadsTotal: l('downloads, all time', 'downloads no total'),
  releases: l('releases', 'releases'),
  mergedPrs: l('merged PRs', 'PRs mergeados'),
  commits: l('commits upstream', 'commits upstream'),
  repo: l('Repository', 'Repositório'),
  demo: l('Live demo', 'Demo'),
  permalink: l('Link to this entry', 'Link para esta entrada'),
} as const;

/** Singular forms of counted field labels, used when the count is exactly 1. */
export const fieldOne: Partial<Record<keyof typeof field, L>> = {
  stars: l('star', 'estrela'),
  releases: l('release', 'release'),
  mergedPrs: l('merged PR', 'PR mergeado'),
  commits: l('commit upstream', 'commit upstream'),
};

/** Package links are labeled by their registry, the name a visitor recognizes. */
export const registryLabel = { npm: 'npm', crates: 'crates.io' } as const;

export interface EntryLink {
  kind: 'repo' | 'demo' | 'package';
  href: string;
}

export interface WorkEntry {
  /** Anchor id, stable: used as the permalink (#<id>). */
  id: string;
  name: string | L;
  /** Public repo name for the snapshot join. Private projects are never listed (owner's rule). */
  repo: string;
  /** Package for the snapshot join. */
  package?: { registry: 'npm' | 'crates'; name: string };
  note: L;
  detail: L;
  /** Three or four names at most: what the project is made of, not every dependency. */
  stack: string[];
  links: EntryLink[];
}

export const work: WorkEntry[] = [
  {
    id: 'whats-reader',
    name: 'whats-reader',
    repo: 'whats-reader',
    note: l(
      'Read, search and replay WhatsApp chat exports on your own device, with voice notes transcribed locally.',
      'Leia, busque e reveja exportações de conversas do WhatsApp no seu dispositivo, com áudios transcritos localmente.',
    ),
    detail: l(
      'A desktop and web app for WhatsApp exports. Messages, photos and voice notes never leave the machine: Whisper runs in the browser over WebGPU, so after a one-time model download transcription needs no server. It handles chats with more than ten thousand messages, and the desktop app updates itself.',
      'Um app desktop e web para exportações do WhatsApp. Mensagens, fotos e áudios nunca saem da máquina: o Whisper roda no navegador via WebGPU, então, depois de baixar o modelo uma vez, a transcrição não precisa de servidor. Aguenta conversas com mais de dez mil mensagens, e o app desktop se atualiza sozinho.',
    ),
    stack: ['SvelteKit', 'Electron', 'Transformers.js', 'WebGPU'],
    links: [
      { kind: 'demo', href: 'https://rodrigogs.github.io/whats-reader/' },
      { kind: 'repo', href: 'https://github.com/rodrigogs/whats-reader' },
    ],
  },
  {
    id: 'mysql-events',
    name: 'mysql-events',
    repo: 'mysql-events',
    package: { registry: 'npm', name: '@rodrigogs/mysql-events' },
    note: l(
      'React to MySQL inserts, updates and deletes in real time by reading the binlog, with no polling and no database triggers.',
      'Reaja a inserts, updates e deletes do MySQL em tempo real lendo o binlog, sem polling e sem triggers no banco.',
    ),
    detail: l(
      'Change data capture for Node.js. It grew out of the original mysql-events and runs on my maintained fork of the ZongJi binlog parser. Still downloaded thousands of times a month.',
      'Change data capture para Node.js. Nasceu do mysql-events original e roda sobre o fork do parser de binlog ZongJi que eu mantenho. Ainda é baixado milhares de vezes por mês.',
    ),
    stack: ['Node.js', 'MySQL', 'JavaScript'],
    links: [
      { kind: 'repo', href: 'https://github.com/rodrigogs/mysql-events' },
      { kind: 'package', href: 'https://www.npmjs.com/package/@rodrigogs/mysql-events' },
    ],
  },
  {
    id: 'pg-turbo',
    name: 'pg-turbo',
    repo: 'pg-turbo',
    package: { registry: 'npm', name: 'pg-turbo' },
    note: l(
      'Dumps and restores large PostgreSQL databases over unreliable links, resuming where a dropped connection left off.',
      'Faz dump e restore de bancos PostgreSQL grandes em conexões instáveis, retomando de onde a queda parou.',
    ),
    detail: l(
      'Talks the COPY protocol directly, splits big tables into volume-balanced chunks that retry on their own, keeps one consistent snapshot through pg_export_snapshot(), and streams zstd or lz4.',
      'Usa o protocolo COPY diretamente, divide tabelas grandes em blocos balanceados por volume com retry automático, mantém um snapshot consistente com pg_export_snapshot() e comprime em stream com zstd ou lz4.',
    ),
    stack: ['TypeScript', 'Node.js', 'PostgreSQL'],
    links: [
      { kind: 'repo', href: 'https://github.com/rodrigogs/pg-turbo' },
      { kind: 'package', href: 'https://www.npmjs.com/package/pg-turbo' },
    ],
  },
  {
    id: 'vibewatch',
    name: 'vibewatch',
    repo: 'vibewatch',
    package: { registry: 'crates', name: 'vibewatch' },
    note: l(
      'Watches files by glob and runs a different command per event, from one fast cross-platform binary.',
      'Observa arquivos por glob e roda um comando diferente por evento, num binário rápido e multiplataforma.',
    ),
    detail: l(
      'Async on Tokio with debouncing, prebuilt binaries for five targets, published on crates.io.',
      'Assíncrono com Tokio e debounce, binários prontos para cinco plataformas, publicado no crates.io.',
    ),
    stack: ['Rust', 'Tokio'],
    links: [
      { kind: 'repo', href: 'https://github.com/rodrigogs/vibewatch' },
      { kind: 'package', href: 'https://crates.io/crates/vibewatch' },
    ],
  },
  {
    id: 'baileys-store',
    name: 'baileys-store',
    repo: 'baileys-store',
    package: { registry: 'npm', name: '@rodrigogs/baileys-store' },
    note: l(
      'Keeps WhatsApp bot auth sessions in Redis, Postgres or any Keyv backend, plus an in-memory chat store, so bots survive restarts.',
      'Guarda as sessões de autenticação de bots de WhatsApp em Redis, Postgres ou qualquer backend Keyv, além de um store de conversas em memória, para o bot sobreviver a reinícios.',
    ),
    detail: l(
      'A drop-in store for the Baileys WhatsApp library, typed end to end.',
      'Um store plugável para a biblioteca Baileys de WhatsApp, tipado de ponta a ponta.',
    ),
    stack: ['TypeScript', 'Keyv', 'Redis'],
    links: [
      { kind: 'repo', href: 'https://github.com/rodrigogs/baileys-store' },
      { kind: 'package', href: 'https://www.npmjs.com/package/@rodrigogs/baileys-store' },
    ],
  },
  {
    id: 'easyvpn',
    name: 'easyvpn',
    repo: 'easyvpn',
    package: { registry: 'npm', name: 'easyvpn' },
    note: l(
      'Connects to a free VPN server in the country you pick with one command, on Windows, macOS or Linux.',
      'Conecta a um servidor VPN gratuito no país que você escolher com um comando, no Windows, macOS ou Linux.',
    ),
    detail: l(
      'My most starred project. A small CLI over OpenVPN and the VPN Gate server list.',
      'Meu projeto com mais estrelas. Uma CLI pequena sobre o OpenVPN e a lista de servidores do VPN Gate.',
    ),
    stack: ['Node.js', 'OpenVPN'],
    links: [
      { kind: 'repo', href: 'https://github.com/rodrigogs/easyvpn' },
      { kind: 'package', href: 'https://www.npmjs.com/package/easyvpn' },
    ],
  },
];

/** One-line notes for upstream repos; numbers come from snapshot.upstream. */
export const upstreamNotes: Record<string, L> = {
  'NousResearch/hermes-agent': l(
    'Stopped the gateway watchdog from killing healthy sessions as hung, plus Bedrock context-window caching and auth cooldown fixes.',
    'Impedi que o watchdog do gateway matasse sessões saudáveis como travadas, além de correções no cache da janela de contexto do Bedrock e no cooldown de autenticação.',
  ),
  'nesquena/hermes-webui': l(
    'Faster session loading, CLI sessions kept visible in projects, and an accessibility fix.',
    'Carregamento de sessões mais rápido, sessões CLI visíveis nos projetos e uma correção de acessibilidade.',
  ),
  'RocketChat/Rocket.Chat': l('Fixed multiline code block overflow.', 'Correção do overflow de blocos de código multilinha.'),
  'moleculerjs/moleculer': l('Refactored the health status provider.', 'Refatoração do provedor de health status.'),
  'ACloudGuru/serverless-plugin-aws-alerts': l(
    'Per-method lodash imports to shrink the plugin.',
    'Imports de lodash por método para reduzir o tamanho do plugin.',
  ),
  'friedrith/node-wifi': l('Fixed a missing netsh argument on Windows.', 'Correção de um argumento que faltava no netsh no Windows.'),
};

/**
 * Wording guard: repos where nothing was merged through the GitHub button,
 * so the page must count commits, never "merged PRs".
 */
export const upstreamCountCommits = ['NousResearch/hermes-agent'];

export interface Role_ {
  /** "YYYY-MM" or "YYYY". */
  from: string;
  to: string | null;
  org: string;
  via?: string;
  title: L;
}

/** Public LinkedIn timeline, newest first. */
export const career: Role_[] = [
  {
    from: '2025-08',
    to: null,
    org: 'Disney Entertainment',
    via: 'Globant',
    title: l('Senior Software Engineer', 'Senior Software Engineer'),
  },
  {
    from: '2022-09',
    to: '2025-07',
    org: 'Warner Bros. Discovery',
    via: 'Globant',
    title: l('Senior Software Engineer', 'Senior Software Engineer'),
  },
  {
    from: '2021-06',
    to: '2022-09',
    org: 'Stilingue',
    title: l('Development Specialist', 'Especialista em Desenvolvimento'),
  },
  { from: '2018', to: '2020', org: 'Meltwater', title: l('Senior Software Engineer', 'Senior Software Engineer') },
  { from: '2017', to: '2018', org: 'Involves', title: l('Full-stack Developer', 'Desenvolvedor Full-stack') },
  { from: '2016', to: '2017', org: 'ntxdev', title: l('Full-stack Developer', 'Desenvolvedor Full-stack') },
  { from: '2015', to: '2016', org: 'Stefanini', title: l('Programmer Analyst', 'Analista Programador') },
  {
    from: '2011',
    to: '2015',
    org: 'Safetech',
    title: l('Java Developer', 'Desenvolvedor Java'),
  },
  { from: '2010', to: '2012', org: 'Secullum', title: l('Corporate Consultant', 'Consultor Corporativo') },
];

/**
 * UI strings of the site surface: the HUD, the toast, the cheat code and
 * the closing sign. Game vocabulary lives only here, as UI flavor, never as
 * a claim about the person.
 */
export const ui = {
  /** The pause-menu nav and the HUD over the hero scene. */
  nav: l('Sections', 'Seções'),
  hud: l('At a glance', 'Em resumo'),
  /** {tz} */
  time: l('Local time in Brazil ({tz})', 'Hora local no Brasil ({tz})'),
  contributions: l('contributions / year', 'contribuições / ano'),
  /** The stamp shown when the email is copied. */
  toast: l('Email copied!', 'E-mail copiado!'),
  /** {email} */
  toastSub: l('{email} is on your clipboard', '{email} está na sua área de transferência'),
  /** Typing VAPORWAVE toggles the owner's original vaporwave grid. */
  cheatOn: l('Cheat activated', 'Cheat ativado'),
  cheatOff: l('Cheat deactivated', 'Cheat desativado'),
  /** The neon sign that is the visible Contact heading (the section label stays the landmark name). */
  sign: l("Let's talk", 'Vamos conversar'),
} as const;

/** The two short lines under About: what I ship with, and the AI tools I use daily. */
export const about = {
  stack: {
    label: l('Stack', 'Stack'),
    items: ['TypeScript', 'Node.js', 'Svelte', 'React', 'Next.js', 'PostgreSQL', 'Python', 'Rust', 'Electron', 'AWS', 'Docker'],
  },
  aiTools: {
    label: l('AI tools I use daily', 'Ferramentas de IA que uso todo dia'),
    items: ['Claude Code', 'Playwright MCP', 'Chrome DevTools MCP', 'GitHub MCP', 'Context7'],
  },
} as const;

/** Smaller public work, one line each under the featured projects. */
export const moreWork = {
  label: l('Also', 'Também'),
  items: [
    {
      name: 'kairos',
      href: 'https://github.com/rodrigogs/kairos',
      note: l('a time calculator without dates', 'uma calculadora de tempo sem datas'),
    },
    {
      name: 'barracao-digital',
      href: 'https://github.com/rodrigogs/barracao-digital',
      note: l('a virtual queue for COVID-19 screening tents (2020)', 'fila virtual para os barracões de triagem da COVID-19 (2020)'),
    },
    {
      name: 'mongoose-timezone',
      href: 'https://github.com/rodrigogs/mongoose-timezone',
      note: l('a Mongoose plugin that normalizes stored dates', 'um plugin do Mongoose que normaliza datas salvas'),
    },
    {
      name: 'hermes-smart-router',
      href: 'https://github.com/rodrigogs/hermes-smart-router',
      note: l('task routing for an open source AI agent', 'roteamento de tarefas para um agente de IA open source'),
    },
  ],
} as const;

/** The 404 page, printed in both languages at once. */
export const notFound = {
  title: l('Not found', 'Página não encontrada'),
  text: l('This page does not exist, or it moved.', 'Esta página não existe ou mudou de lugar.'),
  home: l('Go to the home page', 'Ir para a página inicial'),
} as const;

export const footer = {
  /** {date} {sha} {age} */
  built: l('Built {date} from {sha}.', 'Gerado em {date} a partir de {sha}.'),
  /** {date}, for local builds without a commit sha. */
  builtNoSha: l('Built {date}.', 'Gerado em {date}.'),
  data: l(
    'Numbers from GitHub, npm and crates.io, fetched {age}.',
    'Números do GitHub, npm e crates.io, atualizados {age}.',
  ),
  /** Plate on the stale-data warning. */
  staleTag: l('Outdated', 'Desatualizado'),
  stale: l(
    'Some sources failed on the last run; the numbers shown are from {date}.',
    'Algumas fontes falharam na última execução; os números mostrados são de {date}.',
  ),
  source: l('Source', 'Código-fonte'),
  previous: l('Previous site (early 2026)', 'Site anterior (início de 2026)'),
  previousHref: 'https://github.com/rodrigogs/rodrigogs/tree/legacy-vaporwave',
  switchTo: l('Português', 'English'),
  skip: l('Skip to content', 'Pular para o conteúdo'),
  top: l('Back to top', 'Voltar ao topo'),
} as const;
