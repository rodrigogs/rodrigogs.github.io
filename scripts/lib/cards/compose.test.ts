import { describe, expect, it } from 'vitest';
import { embedSvg, mergeTextRuns, prefixIds, roundNumbers, svgDocument, svgInner } from './compose.ts';

describe('mergeTextRuns', () => {
  it('joins touching words on one line into one run', () => {
    const words =
      '<text x="0" y="20" width="30" height="24" font-size="20" fill="#fff">Every</text>' +
      '<text x="30" y="20" width="5" height="24" font-size="20" fill="#fff"> </text>' +
      '<text x="35" y="20" width="40" height="24" font-size="20" fill="#fff">change</text>';
    expect(mergeTextRuns(words)).toBe('<text x="0" y="20" font-size="20" fill="#fff">Every change</text>');
  });

  it('keeps separate lines, colors and gaps apart', () => {
    const words =
      '<text x="0" y="20" width="30" height="24" fill="#fff">one</text>' +
      '<text x="0" y="44" width="30" height="24" fill="#fff">two</text>' +
      '<text x="30" y="44" width="30" height="24" fill="#f0f">three</text>' +
      '<text x="200" y="44" width="30" height="24" fill="#f0f">far</text>';
    expect(mergeTextRuns(words).match(/<text /g)).toHaveLength(4);
  });

  it('keeps stroke-width (only the x, width and height attributes are dropped)', () => {
    expect(mergeTextRuns('<text x="1" y="2" width="3" height="4" stroke-width="6px">A</text>')).toBe('<text x="1" y="2" stroke-width="6px">A</text>');
  });
});

describe('roundNumbers', () => {
  it('rounds attribute values and never the text', () => {
    expect(roundNumbers('<text x="12.345" y="3.99">v1.31.0 2.5x</text>', 1)).toBe('<text x="12.3" y="4">v1.31.0 2.5x</text>');
  });
});

describe('prefixIds', () => {
  it('prefixes ids and their references', () => {
    expect(prefixIds('<mask id="a"/><g mask="url(#a)"/>', 'p')).toBe('<mask id="p-a"/><g mask="url(#p-a)"/>');
  });
});

describe('svgInner / embedSvg', () => {
  it('unwraps and places a document', () => {
    expect(svgInner('<svg width="1"><rect/></svg>')).toBe('<rect/>');
    expect(embedSvg('<svg width="1"><rect/></svg>', 5, 6)).toBe('<svg x="5" y="6" width="1"><rect/></svg>');
  });
});

describe('svgDocument', () => {
  it('names the card and escapes the name', async () => {
    const svg = await svgDocument({ width: 10, height: 10, title: 'A "quoted" name & more', body: '<rect/>' });
    expect(svg).toMatch(/^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg" width="10" height="10" viewBox="0 0 10 10" role="img" aria-label="A &quot;quoted&quot; name &amp; more">/);
    expect(svg).toContain('<title>A &quot;quoted&quot; name &amp; more</title>');
    expect(svg).not.toContain('<style>');
  });

  it('embeds only the faces the text uses', async () => {
    const svg = await svgDocument({ width: 10, height: 10, title: 'Fonts', body: '<text x="0" y="0" font-weight="600" font-family="rg-inter">Hi</text>' });
    expect(svg).toContain("@font-face{font-family:'rg-inter';font-weight:600");
    expect(svg).not.toContain('rg-orbitron');
  });
});
