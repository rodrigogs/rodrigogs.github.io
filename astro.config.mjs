// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://rodrigogs.github.io',
  output: 'static',
  trailingSlash: 'ignore',
  // The whole stylesheet is a few KB: inline it so nothing blocks first paint.
  build: { inlineStylesheets: 'always' },
  i18n: {
    locales: ['en', 'pt'],
    defaultLocale: 'en',
    routing: { prefixDefaultLocale: false },
  },
  integrations: [
    sitemap({
      i18n: { defaultLocale: 'en', locales: { en: 'en', pt: 'pt-BR' } },
    }),
  ],
  // The four faces of the world (see `type` in src/design/tokens.ts), self-hosted
  // from Fontsource. Latin subset only: it covers English and Portuguese.
  fonts: [
    {
      name: 'Yellowtail',
      cssVariable: '--font-script',
      provider: fontProviders.local(),
      options: {
        variants: [
          { src: ['./node_modules/@fontsource/yellowtail/files/yellowtail-latin-400-normal.woff2'], weight: 400, style: 'normal' },
        ],
      },
      fallbacks: ['cursive'],
    },
    {
      name: 'Luckiest Guy',
      cssVariable: '--font-display',
      provider: fontProviders.local(),
      options: {
        variants: [
          { src: ['./node_modules/@fontsource/luckiest-guy/files/luckiest-guy-latin-400-normal.woff2'], weight: 400, style: 'normal' },
        ],
      },
      fallbacks: ['Impact', 'sans-serif'],
    },
    {
      name: 'Inter',
      cssVariable: '--font-sans',
      provider: fontProviders.local(),
      options: {
        variants: [
          { src: ['./node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2'], weight: '100 900', style: 'normal' },
        ],
      },
      fallbacks: ['system-ui', 'Helvetica Neue', 'Arial', 'sans-serif'],
    },
    {
      name: 'Orbitron',
      cssVariable: '--font-hud',
      provider: fontProviders.local(),
      options: {
        variants: [
          { src: ['./node_modules/@fontsource-variable/orbitron/files/orbitron-latin-wght-normal.woff2'], weight: '400 900', style: 'normal' },
        ],
      },
      fallbacks: ['ui-monospace', 'Menlo', 'monospace'],
    },
  ],
});
