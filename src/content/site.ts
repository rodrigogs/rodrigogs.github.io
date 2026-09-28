/**
 * Curated content: everything a person wrote, in both locales.
 *
 * Numbers never live here. Anything countable (stars, downloads, releases,
 * PRs, contributions) comes from src/data/snapshot.json and is joined by
 * repo or package name. Facts here are ones no API can fetch (test counts
 * from a README, a career timeline from the public LinkedIn profile).
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
    'Software engineer since 2010, senior since 2018. I build whole products, from database internals to on-device AI and agent infrastructure. Release history, open source and contact.',
    'Engenheiro de software desde 2010, sênior desde 2018. Construo produtos completos, do motor do banco de dados à IA rodando no dispositivo e à infraestrutura de agentes. Histórico de releases, open source e contato.',
  ),
} as const;

export const hero = {
  title: l(
    'Senior software engineer building whole products, from database internals to on‑device AI.',
    'Engenheiro de software sênior que constrói produtos completos, do motor do banco de dados à IA rodando no dispositivo.',
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
        'Senior Software Engineer na Globant, na conta da Disney Entertainment desde agosto de 2025.',
      ),
    },
    {
      role: 'added' as Role,
      label: l('Product', 'Produto'),
      /** {tag} {stars} {downloads} from repo whats-reader. */
      repo: 'whats-reader',
      text: l(
        'whats-reader {tag}: a privacy-first WhatsApp archive reader with {stars} stars and {downloads} downloads.',
        'whats-reader {tag}: um leitor de conversas exportadas do WhatsApp com foco em privacidade, com {stars} estrelas e {downloads} downloads.',
      ),
    },
    {
      role: 'merged' as Role,
      label: l('AI', 'IA'),
      text: l(
        'I work with a team of AI agents: spec first, parallel subagents, adversarial review, and proof in the running app before anything ships.',
        'Trabalho com um time de agentes de IA: especificação primeiro, subagentes em paralelo, revisão adversarial e prova no app rodando antes de qualquer entrega.',
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
  ai: {
    label: l('How I work with AI', 'Como trabalho com IA'),
    claim: l(
      'I set the spec and the bar; a team of AI agents does the fan-out; nothing ships until it is proven.',
      'Eu defino a especificação e o nível de exigência; um time de agentes de IA distribui o trabalho; nada sai sem prova.',
    ),
  },
  work: {
    label: l('Work', 'Trabalho'),
    claim: l(
      'Products and libraries people use, each with the numbers to check.',
      'Produtos e bibliotecas que as pessoas usam, cada um com os números para conferir.',
    ),
  },
  openSource: {
    label: l('Open source', 'Open source'),
    claim: l(
      "Fixes and features that landed in other people's projects.",
      'Correções e funcionalidades aceitas em projetos de outras pessoas.',
    ),
  },
  packages: {
    label: l('Packages', 'Pacotes'),
    /** {count} {monthly} */
    claim: l(
      '{count} published packages, {monthly} downloads in the last 30 days.',
      '{count} pacotes publicados, {monthly} downloads nos últimos 30 dias.',
    ),
  },
  career: {
    label: l('Career', 'Carreira'),
    /** {years} */
    claim: l(
      '{years} years shipping software for media, retail, tax compliance and healthcare.',
      '{years} anos entregando software para mídia, varejo, área fiscal e saúde.',
    ),
  },
  stack: {
    label: l('Stack', 'Stack'),
    claim: l(
      'What I ship with, and the tools I work with every day, AI included.',
      'Com o que eu entrego, e as ferramentas que uso no dia a dia, incluindo IA.',
    ),
  },
  contact: {
    label: l('Contact', 'Contato'),
    claim: l(
      'Hiring for a senior or staff role? Write to me.',
      'Está contratando para uma vaga sênior ou staff? Me escreva.',
    ),
    body: l(
      'Email is the fastest way to reach me. I work remotely from Rio Grande do Sul, Brazil, on UTC−3, which overlaps the US and European working day.',
      'E-mail é o jeito mais rápido de falar comigo. Trabalho remotamente do Rio Grande do Sul, em UTC−3, com horário compatível com o dos EUA e da Europa.',
    ),
  },
} as const;

export type SectionKey = keyof typeof sections;
export const sectionOrder: SectionKey[] = ['ai', 'work', 'openSource', 'packages', 'career', 'stack', 'contact'];

/** Field labels of the fixed furniture every entry carries. */
export const field = {
  born: l('Since', 'Desde'),
  latest: l('Latest release', 'Última versão'),
  status: l('Status', 'Status'),
  stars: l('stars', 'estrelas'),
  downloadsMonth: l('downloads / 30 days', 'downloads / 30 dias'),
  downloadsYear: l('downloads / year', 'downloads / ano'),
  downloadsTotal: l('downloads, all time', 'downloads no total'),
  releaseDownloads: l('release downloads', 'downloads de releases'),
  releases: l('releases', 'releases'),
  mergedPrs: l('merged PRs', 'PRs mergeados'),
  prsOpened: l('PRs opened', 'PRs abertos'),
  commits: l('commits upstream', 'commits upstream'),
  repo: l('Repository', 'Repositório'),
  site: l('Live site', 'Site no ar'),
  demo: l('Live demo', 'Demo'),
  package: l('Package', 'Pacote'),
  docs: l('Docs', 'Documentação'),
  permalink: l('Link to this entry', 'Link para esta entrada'),
  commitsLink: l('My commits', 'Meus commits'),
  registry: l('Registry', 'Registro'),
  name: l('Name', 'Nome'),
  version: l('Version', 'Versão'),
  /** {count} */
  allPackages: l('All {count} packages', 'Todos os {count} pacotes'),
} as const;

/** Singular forms of counted field labels, used when the count is exactly 1. */
export const fieldOne: Partial<Record<keyof typeof field, L>> = {
  stars: l('star', 'estrela'),
  releases: l('release', 'release'),
  releaseDownloads: l('release download', 'download de release'),
  mergedPrs: l('merged PR', 'PR mergeado'),
  prsOpened: l('PR opened', 'PR aberto'),
  commits: l('commit upstream', 'commit upstream'),
};

/** Status vocabulary, computed from the repo's last push. */
export const status = {
  latest: { role: 'added' as Role, label: l('Active', 'Ativo') },
  maintained: { role: 'merged' as Role, label: l('Maintained', 'Mantido') },
  dormant: { role: 'deprecated' as Role, label: l('Legacy', 'Legado') },
} as const;
export type StatusKey = keyof typeof status;

export interface Fact {
  /** Formatted per locale at render time (1,959 in EN, 1.959 in PT). */
  value: number;
  unit?: '%';
  label: L;
}

export interface EntryLink {
  kind: 'repo' | 'site' | 'demo' | 'package' | 'docs' | 'commits';
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
  stack: string[];
  /** Facts no API returns (from the project's own README). */
  facts?: Fact[];
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
    stack: ['SvelteKit', 'Svelte 5', 'Electron', 'TypeScript', 'Transformers.js', 'WebGPU', 'Playwright', 'Vitest'],
    facts: [{ value: 10, label: l('README languages', 'idiomas no README') }],
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
    facts: [
      { value: 187, label: l('tests', 'testes') },
      { value: 91, unit: '%', label: l('coverage', 'de cobertura') },
    ],
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
    stack: ['TypeScript', 'Keyv', 'Redis', 'Baileys'],
    facts: [{ value: 151, label: l('tests', 'testes') }],
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
  {
    id: 'kairos',
    name: 'kairos',
    repo: 'kairos',
    package: { registry: 'npm', name: 'kairos' },
    note: l(
      'A time calculator without dates: add, subtract and multiply time expressions like 01:30 + 00:45.',
      'Uma calculadora de tempo sem datas: soma, subtrai e multiplica expressões como 01:30 + 00:45.',
    ),
    detail: l(
      'Time expressions combined with math expressions, with several output representations. Documented, with live examples.',
      'Expressões de tempo combinadas com expressões matemáticas, com várias representações de saída. Documentada, com exemplos interativos.',
    ),
    stack: ['JavaScript'],
    links: [
      { kind: 'docs', href: 'https://rodrigogs.github.io/kairos/' },
      { kind: 'repo', href: 'https://github.com/rodrigogs/kairos' },
    ],
  },
  {
    id: 'barracao-digital',
    name: 'barracao-digital',
    repo: 'barracao-digital',
    note: l(
      'A virtual queue and remote triage for COVID-19 screening tents, so patients could wait at home instead of crowding emergency rooms.',
      'Fila virtual e triagem remota para os barracões de atendimento da COVID-19, para que os pacientes esperassem em casa em vez de lotar as emergências.',
    ),
    detail: l(
      'Built in 2020 to stand up decentralized triage points fast. Serverless on AWS (Lambda, API Gateway, CloudFront). The service is offline now; the code stays public.',
      'Construído em 2020 para montar rapidamente pontos de triagem descentralizados. Serverless na AWS (Lambda, API Gateway, CloudFront). O serviço está fora do ar; o código continua público.',
    ),
    stack: ['Vue', 'Node.js', 'Serverless Framework', 'AWS'],
    links: [{ kind: 'repo', href: 'https://github.com/rodrigogs/barracao-digital' }],
  },
];

/** What landed in Hermes Agent; one wording for the AI engineering entry and the Open source row. */
const hermesAgentNote = l(
  'Gateway watchdog fixes against false wedge kills, a Bedrock context-window cache fix and an auth cooldown reset fix.',
  'Correções no watchdog do gateway contra falsos travamentos, no cache da janela de contexto do Bedrock e no reset do cooldown de autenticação.',
);

export interface AiProject {
  id: string;
  name: string | L;
  repo: string | null;
  /** Upstream repo whose snapshot row feeds the numbers. */
  upstream?: string;
  note: L;
  facts?: Fact[];
  links: EntryLink[];
}

export const aiProjects: AiProject[] = [
  {
    id: 'hermes-agent',
    name: 'Hermes Agent',
    repo: null,
    upstream: 'NousResearch/hermes-agent',
    note: hermesAgentNote,
    links: [{ kind: 'commits', href: 'https://github.com/NousResearch/hermes-agent/commits?author=rodrigogs' }],
  },
  {
    id: 'hermes-smart-router',
    name: 'hermes-smart-router',
    repo: 'hermes-smart-router',
    note: l(
      'A Hermes Agent plugin that runs delegated tasks under another profile in an isolated process, with an optional router that picks the profile and model by task difficulty.',
      'Um plugin do Hermes Agent que executa tarefas delegadas em outro perfil, num processo isolado, com um roteador opcional que escolhe perfil e modelo pela dificuldade da tarefa.',
    ),
    facts: [
      { value: 1959, label: l('tests', 'testes') },
      { value: 100, unit: '%', label: l('branch coverage', 'de cobertura de branches') },
    ],
    links: [{ kind: 'repo', href: 'https://github.com/rodrigogs/hermes-smart-router' }],
  },
  {
    id: 'hermes-web-resilient',
    name: 'hermes-web-resilient',
    repo: 'hermes-web-resilient',
    note: l(
      'A Hermes Agent plugin that chains web search providers and moves to the next one when a backend fails (expired key, outage, captcha), ending on a keyless free tier.',
      'Um plugin do Hermes Agent que encadeia provedores de busca web e passa para o próximo quando um falha (chave expirada, queda, captcha), terminando num nível gratuito sem chave.',
    ),
    links: [{ kind: 'repo', href: 'https://github.com/rodrigogs/hermes-web-resilient' }],
  },
  {
    id: 'hermes-one-fact-explorer',
    name: 'hermes-one-fact-explorer',
    repo: 'hermes-one-fact-explorer',
    note: l(
      "A read-only explorer for an agent's memory store: what it knows, why a fact is trusted, which retrieval path can reach it, and what keyword recall would return.",
      'Um explorador somente leitura da memória de um agente: o que ele sabe, por que um fato é confiável, qual caminho de recuperação o alcança e o que a busca por palavra-chave retornaria.',
    ),
    links: [{ kind: 'repo', href: 'https://github.com/rodrigogs/hermes-one-fact-explorer' }],
  },
];

/** One-line notes for upstream repos; numbers come from snapshot.upstream. */
export const upstreamNotes: Record<string, L> = {
  'NousResearch/hermes-agent': hermesAgentNote,
  'nesquena/hermes-webui': l(
    'Session sidecar performance, project CLI sessions kept visible, an aria-expanded accessibility fix.',
    'Performance do sidecar de sessões, sessões CLI de projeto mantidas visíveis e uma correção de acessibilidade em aria-expanded.',
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
  note?: L;
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
    title: l('Development Specialist', 'Especialista de Desenvolvimento'),
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
    note: l(
      'Electronic fiscal documents (NF-e) and reporting on Grails, Groovy and Java.',
      'Documentos fiscais eletrônicos (NF-e) e relatórios em Grails, Groovy e Java.',
    ),
  },
  { from: '2010', to: '2012', org: 'Secullum', title: l('Corporate Consultant', 'Consultor Corporativo') },
];

/**
 * Curated stack ranges for the Compare view, only where a public source
 * supports them (LinkedIn titles and project notes). Repo data covers the rest.
 */
export const careerStack: { from: number; to: number; stack: string[] }[] = [
  { from: 2011, to: 2015, stack: ['Java', 'Grails', 'Groovy'] },
  { from: 2013, to: 2013, stack: ['Android'] },
  { from: 2022, to: new Date().getFullYear(), stack: ['Node.js'] },
];

export const compare = {
  label: l('Compare', 'Comparar'),
  hint: l('Pick two years to diff the stack.', 'Escolha dois anos para comparar a stack.'),
  base: l('From', 'De'),
  head: l('To', 'Até'),
  /** Plural forms; the *One variants are used when the count is exactly 1. */
  added: l('added', 'entraram'),
  addedOne: l('added', 'entrou'),
  removed: l('removed', 'saíram'),
  removedOne: l('removed', 'saiu'),
  kept: l('kept', 'ficaram'),
  keptOne: l('kept', 'ficou'),
  /** {repos} */
  work: l('{repos} repos started in this range', '{repos} repos criados neste período'),
  workOne: l('{repos} repo started in this range', '{repos} repo criado neste período'),
  /** The fold under the diff lines: "+13 more" / "Show fewer". */
  more: l('more', 'a mais'),
  less: l('Show fewer', 'Mostrar menos'),
  defaultBase: 2014,
} as const;

/** Stack: what I ship with and the tools I use. Items are names; evidence is in PRODUCT.md and the repos. */
export const stack = {
  ships: {
    label: l('Ships with', 'Stack principal'),
    items: ['TypeScript', 'Node.js', 'Svelte', 'SvelteKit', 'React', 'Next.js', 'PostgreSQL', 'Python', 'Rust', 'Electron', 'AWS', 'Docker'],
  },
  groups: [
    {
      label: l('Agents', 'Agentes'),
      items: ['Claude Code', l('Hermes Agent (self-hosted)', 'Hermes Agent (auto-hospedado)'), l('Subagent workflows', 'Fluxos com subagentes')],
    },
    {
      label: l('Models', 'Modelos'),
      items: [l('Claude on AWS Bedrock', 'Claude via AWS Bedrock'), l('OpenAI GPT and Whisper', 'OpenAI GPT e Whisper'), 'DeepSeek', 'Z.ai GLM', 'Ollama', 'LM Studio', 'llama.cpp'],
    },
    {
      label: l('MCP servers', 'Servidores MCP'),
      items: ['Playwright', 'Chrome DevTools', 'GitHub', l('SearXNG (self-hosted)', 'SearXNG (auto-hospedado)'), 'Context7', 'Peekaboo', 'Godot'],
    },
    {
      label: l('Memory and skills', 'Memória e skills'),
      items: ['claude-mem', 'superpowers', 'impeccable'],
    },
    {
      label: l('AI libraries', 'Bibliotecas de IA'),
      items: [l('Transformers.js on WebGPU', 'Transformers.js com WebGPU'), 'LangChain', 'LangGraph', 'OpenAI SDK', 'Unity ML-Agents'],
    },
    {
      label: l('Retrieval', 'Busca e recuperação'),
      items: ['ChromaDB', 'Docling', 'OpenWebUI', l('BM25 + vector hybrid search', 'Busca híbrida BM25 + vetorial'), l('Cross-encoder reranking', 'Reranking com cross-encoder')],
    },
    {
      label: l('Quality', 'Qualidade'),
      items: ['Vitest', 'Playwright', 'Biome', 'semantic-release', 'GitHub Actions'],
    },
  ],
} as const;

/**
 * How I work with AI: the practices, in the order a change goes through
 * them. Public-safe by construction: tools and methods, never private projects.
 */
export const aiWorkflow = {
  label: l('The method', 'O método'),
  items: [
    {
      name: l('Spec before code', 'Especificação antes do código'),
      text: l(
        'Every non-trivial change starts as a written spec and a plan I review before the first line is written.',
        'Toda mudança não trivial começa como especificação e plano escritos, que eu reviso antes da primeira linha.',
      ),
      tools: ['Claude Code', 'superpowers'],
    },
    {
      name: l('A team, not a chatbot', 'Um time, não um chatbot'),
      text: l(
        'Work fans out to parallel subagents, each with its model and effort picked for the job: fast models for mechanical edits, the strongest for architecture and review.',
        'O trabalho se divide entre subagentes em paralelo, cada um com modelo e esforço escolhidos para a tarefa: modelos rápidos para edições mecânicas, os mais fortes para arquitetura e revisão.',
      ),
      tools: ['Claude Code', 'Claude on AWS Bedrock'],
    },
    {
      name: l('Adversarial review', 'Revisão adversarial'),
      text: l(
        'Independent reviewer agents try to refute every finding and audit truth, accessibility and performance before I accept a change.',
        'Agentes revisores independentes tentam refutar cada achado e auditam verdade, acessibilidade e performance antes de eu aceitar uma mudança.',
      ),
      tools: ['Claude Code', 'impeccable'],
    },
    {
      name: l('Proof, not "looks right"', 'Prova, não "parece certo"'),
      text: l(
        'Done means verified: agents drive the running app in a real browser, check the deployed URL and watch CI before anything is called finished.',
        'Pronto significa verificado: os agentes usam o app rodando num navegador de verdade, conferem a URL publicada e acompanham o CI antes de qualquer coisa ser dada como pronta.',
      ),
      tools: ['Playwright', 'Chrome DevTools', 'GitHub Actions'],
    },
    {
      name: l('Research over memory', 'Pesquisa em vez de memória'),
      text: l(
        'Before a decision, agents read current docs and search the web instead of trusting what a model remembers.',
        'Antes de decidir, os agentes leem a documentação atual e pesquisam na web em vez de confiar no que o modelo lembra.',
      ),
      tools: ['Context7', 'SearXNG (self-hosted)'],
    },
    {
      name: l('Memory across sessions', 'Memória entre sessões'),
      text: l(
        'A persistent memory layer keeps long projects coherent across days and sessions.',
        'Uma camada de memória persistente mantém projetos longos coerentes entre dias e sessões.',
      ),
      tools: ['claude-mem'],
    },
    {
      name: l('Guardrails', 'Limites claros'),
      text: l(
        'Nothing other people can see (pull requests, comments, posts) goes out without my approval, and secrets stay out of every output.',
        'Nada que outras pessoas possam ver (pull requests, comentários, posts) sai sem a minha aprovação, e segredos ficam fora de qualquer saída.',
      ),
      tools: ['Claude Code'],
    },
    {
      name: l('An agent on call', 'Um agente de plantão'),
      text: l(
        'A self-hosted agent I can reach from my phone over Telegram picks up work when I am away from the desk.',
        'Um agente auto-hospedado que eu aciono pelo celular, via Telegram, segue trabalhando quando estou longe do computador.',
      ),
      tools: ['Hermes Agent', 'Telegram'],
    },
  ],
  /** Proof line under the method. */
  builtWith: l(
    'This site and my GitHub profile were built this way: planned, built by parallel agents, reviewed adversarially and verified live.',
    'Este site e o meu perfil do GitHub foram feitos assim: planejados, construídos por agentes em paralelo, revisados de forma adversarial e verificados ao vivo.',
  ),
  builtWithHref: 'https://github.com/rodrigogs/rodrigogs.github.io',
  /** Label for the compact list of public agent projects under the method. */
  projectsLabel: l('Agent tooling I publish', 'Ferramentas para agentes que publico'),
} as const;

/** Easter egg: the Konami code brings back the retired 2026 palette. */
export const konami = {
  label: l('vaporwave (retired)', 'vaporwave (aposentado)'),
} as const;

/** The 404 page, printed in both languages at once. */
export const notFound = {
  title: l('Not found', 'Página não encontrada'),
  text: l('This page does not exist, or it moved.', 'Esta página não existe, ou mudou de lugar.'),
  home: l('Go to the home page', 'Ir para a página inicial'),
} as const;

export const footer = {
  /** {date} {sha} {age} */
  built: l('Built {date} from {sha}.', 'Gerado em {date} a partir de {sha}.'),
  /** {date}, for local builds without a commit sha. */
  builtNoSha: l('Built {date}.', 'Gerado em {date}.'),
  data: l(
    'Numbers from GitHub, npm and crates.io, fetched {age}.',
    'Números do GitHub, npm e crates.io, buscados {age}.',
  ),
  /** Plate on the stale-data warning. */
  staleTag: l('Outdated', 'Desatualizado'),
  stale: l(
    'Some sources failed on the last run; the numbers shown are from {date}.',
    'Algumas fontes falharam na última execução; os números mostrados são de {date}.',
  ),
  source: l('Source', 'Código-fonte'),
  previous: l('Previous version (2026, vaporwave)', 'Versão anterior (2026, vaporwave)'),
  previousHref: 'https://github.com/rodrigogs/rodrigogs/tree/legacy-vaporwave',
  switchTo: l('Português', 'English'),
  skip: l('Skip to content', 'Pular para o conteúdo'),
  top: l('Back to top', 'Voltar ao topo'),
} as const;
