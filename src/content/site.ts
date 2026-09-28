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
  /** Hidden while null. Set once the profile URL is confirmed by the owner. */
  linkedin: null as string | null,
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
    'Engenheiro de software desde 2010, sênior desde 2018. Construo produtos completos, dos internals de banco de dados à IA rodando no dispositivo e à infraestrutura de agentes. Histórico de releases, open source e contato.',
  ),
} as const;

export const hero = {
  /** Shown on the "Latest" plate next to the build date (CalVer). */
  latest: l('Latest', 'Mais recente'),
  title: l(
    'Senior software engineer building whole products, from database internals to on‑device AI.',
    'Engenheiro de software sênior que constrói produtos completos, dos internals de banco de dados à IA rodando no dispositivo.',
  ),
  /**
   * The three release notes of the first viewport. `role` picks the plate
   * color and label; `{…}` placeholders are filled from the snapshot.
   */
  notes: [
    {
      role: 'changed' as Role,
      text: l(
        'Senior Software Engineer on the Disney Entertainment account, via Globant, since August 2025.',
        'Senior Software Engineer na conta da Disney Entertainment, pela Globant, desde agosto de 2025.',
      ),
    },
    {
      role: 'added' as Role,
      /** {tag} {stars} {downloads} from repo whats-reader. */
      repo: 'whats-reader',
      text: l(
        'whats-reader {tag}: a privacy-first WhatsApp archive reader with {stars} stars and {downloads} downloads.',
        'whats-reader {tag}: um leitor de conversas exportadas do WhatsApp com foco em privacidade, com {stars} estrelas e {downloads} downloads.',
      ),
    },
    {
      role: 'merged' as Role,
      /** {agentCommits} from NousResearch/hermes-agent, {webuiMerged} from nesquena/hermes-webui. */
      text: l(
        'Agent infrastructure: {agentCommits} commits landed in Hermes Agent and {webuiMerged} merged PRs in Hermes WebUI.',
        'Infraestrutura de agentes: {agentCommits} commits integrados ao Hermes Agent e {webuiMerged} PRs mergeados no Hermes WebUI.',
      ),
    },
  ],
  cta: {
    email: l('Email me', 'Enviar e-mail'),
    copy: l('Copy address', 'Copiar endereço'),
    copied: l('Copied', 'Copiado'),
  },
} as const;

/** Labels for the release roles (tag plates, legends, diff lines). */
export const roleLabel: Record<Role, L> = {
  added: l('Added', 'Adicionado'),
  changed: l('Changed', 'Alterado'),
  merged: l('Upstream', 'Upstream'),
  deprecated: l('Deprecated', 'Descontinuado'),
};

/**
 * Sections in page order. `label` is the literal noun used in the nav and
 * the heading; `claim` is the one sentence each section opens with.
 */
export const sections = {
  now: {
    label: l('Now', 'Agora'),
    tag: l('Unreleased', 'Em desenvolvimento'),
    claim: l(
      'Agent infrastructure I am building in the open and upstream.',
      'Infraestrutura de agentes que construo em público e upstream.',
    ),
  },
  work: {
    label: l('Work', 'Trabalho'),
    claim: l(
      'Products and libraries people use, each with the numbers to check.',
      'Produtos e bibliotecas que as pessoas usam, cada um com os números para conferir.',
    ),
  },
  upstream: {
    label: l('Upstream', 'Upstream'),
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
  toolchain: {
    label: l('Toolchain', 'Ferramentas'),
    claim: l(
      'The stack I ship with and the AI tooling I work with.',
      'A stack com que entrego e as ferramentas de IA que uso.',
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
export const sectionOrder: SectionKey[] = ['now', 'work', 'upstream', 'packages', 'career', 'toolchain', 'contact'];

/** Field labels of the fixed furniture every entry carries. */
export const field = {
  born: l('Born', 'Criado'),
  latest: l('Latest', 'Última versão'),
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
  privateCode: l('Private codebase', 'Código privado'),
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

/** Status vocabulary. Computed from pushedAt unless an entry is private. */
export const status = {
  latest: { role: 'added' as Role, label: l('Active', 'Ativo') },
  maintained: { role: 'merged' as Role, label: l('Maintained', 'Mantido') },
  dormant: { role: 'deprecated' as Role, label: l('Dormant', 'Inativo') },
  private: { role: 'changed' as Role, label: l('Private, live', 'Privado, no ar') },
  wip: { role: 'changed' as Role, label: l('In progress', 'Em andamento') },
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
  /** Public repo name for the snapshot join; null for private products. */
  repo: string | null;
  /** Package for the snapshot join. */
  package?: { registry: 'npm' | 'crates'; name: string };
  /** Only for entries without a public repo. */
  status?: StatusKey;
  /** Year it started, only when there is no repo to read it from. */
  born?: number;
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
    id: 'cardiac-ct-planning',
    name: l('Cardiac CT planning workstation', 'Estação de planejamento cardíaco por tomografia'),
    repo: null,
    status: 'private',
    born: 2026,
    note: l(
      'Plans transcatheter aortic valve procedures from a CT angiography, in the browser.',
      'Planejamento de implante transcateter de válvula aórtica (TAVI) a partir de uma angiotomografia, no navegador.',
    ),
    detail: l(
      'DICOM parsing, 3D volume rendering and the clinical measurements a heart team needs (annulus, aortic root, coronary heights, implant projection) in a zero-install web app built for hospital reading rooms.',
      'Leitura de DICOM, renderização volumétrica 3D e as medidas clínicas de que a equipe cardíaca precisa (anel aórtico, raiz da aorta, altura dos óstios coronarianos, projeção do implante) num app web sem instalação, feito para as salas de laudo do hospital.',
    ),
    stack: ['TypeScript', 'React', 'Cornerstone.js', 'vtk.js', 'three.js', 'Rust', 'Supabase'],
    links: [],
  },
  {
    id: 'pitstop',
    name: 'PitStop',
    repo: null,
    status: 'private',
    born: 2025,
    note: l(
      'Runs an auto repair shop in one system, from the front desk to work orders and finance.',
      'Gestão completa de oficinas num só sistema, do atendimento às ordens de serviço e ao financeiro.',
    ),
    detail: l(
      'A multi-tenant B2B SaaS for repair shops and auto centers in Brazil: service intake, work orders, cash and receivables in one product.',
      'Um SaaS B2B multi-tenant para oficinas e auto centers: atendimento, ordens de serviço, caixa e recebimentos num só produto.',
    ),
    stack: ['Next.js', 'TypeScript', 'Prisma', 'PostgreSQL', 'next-intl', 'Turborepo'],
    links: [{ kind: 'site', href: 'https://pitstop.sh' }],
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

/** What landed in Hermes Agent; one wording for the Now entry and the Upstream row. */
const hermesAgentNote = l(
  'Gateway watchdog fixes against false wedge kills, a Bedrock context-window cache fix and an auth cooldown reset fix.',
  'Correções no watchdog do gateway contra falsos travamentos, no cache da janela de contexto do Bedrock e no reset do cooldown de autenticação.',
);

/** The two-way MCP bridge, named the same way everywhere. */
const bridgeNote = l(
  'A two-way MCP bridge that lets Claude Code and Hermes Agent call each other as tool providers across machines, with anti-recursion guards and a shared append-only mailbox.',
  'Uma ponte MCP nos dois sentidos que deixa o Claude Code e o Hermes Agent chamarem um ao outro como provedores de ferramentas entre máquinas, com proteção contra recursão e uma caixa de mensagens compartilhada, só de acréscimo.',
);

export interface NowEntry {
  id: string;
  name: string | L;
  repo: string | null;
  /** Upstream repo whose snapshot row feeds the numbers. */
  upstream?: string;
  note: L;
  facts?: Fact[];
  links: EntryLink[];
}

export const now: NowEntry[] = [
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
    id: 'mcp-bridge',
    name: l('Claude Code and Hermes bridge', 'Ponte Claude Code e Hermes'),
    repo: null,
    note: bridgeNote,
    links: [],
  },
  {
    id: 'trama',
    name: 'Trama',
    repo: null,
    note: l(
      'A plugin-first browser workspace for agent runs, drawn as a node graph: panels are nodes, wires are connections.',
      'Um workspace de navegador para execuções de agentes, plugin-first, desenhado como grafo: painéis são nós, fios são conexões.',
    ),
    links: [],
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
  defaultBase: 2014,
} as const;

/** Toolchain. Items are names; evidence is in PRODUCT.md and the repos. */
export const toolchain = {
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
  skillsLabel: l('AI engineering', 'Engenharia de IA'),
  skills: [
    {
      name: l('Multi-agent orchestration', 'Orquestração multi-agente'),
      text: l(
        'Spec-first pipelines that plan, fan out to parallel subagents, review adversarially and verify in the running app, with a model and effort policy per task. This site was built that way.',
        'Pipelines guiados por especificação que planejam, distribuem para subagentes em paralelo, revisam de forma adversarial e verificam no app em execução, com política de modelo e esforço por tarefa. Este site foi feito assim.',
      ),
      href: 'https://github.com/rodrigogs/rodrigogs.github.io',
    },
    {
      name: l('Agent interoperability', 'Interoperabilidade de agentes'),
      text: l(
        'A two-way MCP bridge between Claude Code and Hermes Agent across machines, with anti-recursion guards and a shared append-only mailbox.',
        'Uma ponte MCP nos dois sentidos entre Claude Code e Hermes Agent, entre máquinas, com proteção contra recursão e uma caixa de mensagens compartilhada, só de acréscimo.',
      ),
    },
    {
      name: l('Capability routing', 'Roteamento por capacidade'),
      text: l(
        'Classifies how hard a delegated task is and routes it to the right profile and model in an isolated process.',
        'Classifica a dificuldade de uma tarefa delegada e a envia para o perfil e o modelo certos num processo isolado.',
      ),
      href: 'https://github.com/rodrigogs/hermes-smart-router',
    },
    {
      name: l('Agent memory and retrieval', 'Memória e recuperação para agentes'),
      text: l(
        'Hybrid dense and lexical recall with cross-encoder reranking, embedding models evaluated in Portuguese and English, gated by a frozen eval set in CI.',
        'Recall híbrido denso e lexical com reranking por cross-encoder, modelos de embedding avaliados em português e inglês, com um conjunto de avaliação congelado no CI.',
      ),
    },
    {
      name: l('Provider-agnostic LLM integration', 'Integração de LLMs independente de provedor'),
      text: l(
        'One interface over Anthropic, OpenAI, DeepSeek, Z.ai and Nous models and local runtimes, with automatic failover.',
        'Uma interface sobre modelos Anthropic, OpenAI, DeepSeek, Z.ai e Nous e runtimes locais, com failover automático.',
      ),
    },
    {
      name: l('Local-first AI', 'IA local-first'),
      text: l(
        'Speech-to-text in the browser over WebGPU: after a one-time model download, no audio or message ever leaves the device, a privacy property users can audit.',
        'Transcrição de voz no navegador via WebGPU: depois de baixar o modelo uma vez, nenhum áudio ou mensagem sai do dispositivo, uma garantia de privacidade que o usuário pode auditar.',
      ),
      href: 'https://github.com/rodrigogs/whats-reader',
    },
    {
      name: l('Document RAG', 'RAG de documentos'),
      text: l(
        'OCR ingestion, a vector store, hybrid BM25 and vector retrieval and reranking, behind a chat front end.',
        'Ingestão com OCR, banco vetorial, recuperação híbrida BM25 e vetorial com reranking, por trás de uma interface de chat.',
      ),
    },
    {
      name: l('Messaging agents', 'Agentes em mensageria'),
      text: l(
        'WhatsApp bots with persistent sessions, and a self-hosted agent gateway I operate over Telegram.',
        'Bots de WhatsApp com sessões persistentes e um gateway de agentes auto-hospedado que opero pelo Telegram.',
      ),
      href: 'https://github.com/rodrigogs/baileys-store',
    },
  ],
} as const;

/** Easter egg: the Konami code brings back the retired 2026 palette. */
export const konami = {
  label: l('vaporwave (retired)', 'vaporwave (aposentado)'),
} as const;

/** The 404 page, printed in both languages at once. */
export const notFound = {
  title: l('Not found', 'Página não encontrada'),
  text: l(
    'This address was never released, or it was removed.',
    'Este endereço nunca foi publicado, ou foi removido.',
  ),
  home: l('Go to the latest release', 'Ir para a versão mais recente'),
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
