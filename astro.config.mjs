// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://rodrigogs.github.io',
  output: 'static',
  trailingSlash: 'ignore',
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
  fonts: [
    {
      name: 'Archivo',
      cssVariable: '--font-archivo',
      provider: fontProviders.local(),
      options: {
        variants: [
          {
            src: ['./node_modules/@fontsource-variable/archivo/files/archivo-latin-standard-normal.woff2'],
            weight: '100 900',
            style: 'normal',
            stretch: '62% 125%',
          },
        ],
      },
      fallbacks: ['Helvetica Neue', 'Arial', 'sans-serif'],
    },
    {
      name: 'Martian Mono',
      cssVariable: '--font-martian',
      provider: fontProviders.local(),
      options: {
        variants: [
          {
            src: ['./node_modules/@fontsource-variable/martian-mono/files/martian-mono-latin-standard-normal.woff2'],
            weight: '100 800',
            style: 'normal',
            stretch: '75% 112.5%',
          },
        ],
      },
      fallbacks: ['ui-monospace', 'Menlo', 'monospace'],
    },
  ],
});
