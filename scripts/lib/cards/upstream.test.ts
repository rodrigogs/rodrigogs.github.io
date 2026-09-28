import { describe, expect, it } from 'vitest';
import type { UpstreamView } from '../../../src/lib/view.ts';
import { upstreamTitle } from './upstream.ts';

const row = (repo: string): UpstreamView => ({
  repo,
  url: `https://github.com/${repo}`,
  stars: '1',
  starsRaw: 1,
  note: '',
  count: '1 merged PR',
  countValue: '1',
  countLabel: 'merged PR',
  proofUrl: '',
  years: '',
  highlights: [],
});

describe('upstreamTitle', () => {
  it('never doubles "and" when rows are omitted', () => {
    const title = upstreamTitle(
      ['NousResearch/hermes-agent', 'RocketChat/Rocket.Chat', 'nesquena/hermes-webui', 'moleculerjs/moleculer', 'friedrith/node-wifi'].map(row),
    );
    expect(title).toBe('Upstream contributions: hermes-agent, Rocket.Chat, hermes-webui, moleculer and more.');
    expect(title.match(/ and /g)).toHaveLength(1);
  });

  it('lists every repo, Oxford-free, when none are omitted', () => {
    const title = upstreamTitle(['NousResearch/hermes-agent', 'RocketChat/Rocket.Chat', 'nesquena/hermes-webui'].map(row));
    expect(title).toBe('Upstream contributions: hermes-agent, Rocket.Chat and hermes-webui.');
  });

  it('names the single repo with no conjunction', () => {
    const title = upstreamTitle(['NousResearch/hermes-agent'].map(row));
    expect(title).toBe('Upstream contributions: hermes-agent.');
  });
});
