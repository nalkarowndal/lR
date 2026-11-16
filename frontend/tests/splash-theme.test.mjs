import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';
import { createElement, Fragment } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

test('Initial HTML includes the selected splash art and layout without an extra request', async () => {
  const root = fileURLToPath(new URL('../', import.meta.url));
  const server = await createServer({ root, server: { middlewareMode: true, ws: false } });
  try {
    const source = await readFile(new URL('../index.html', import.meta.url), 'utf8');
    const html = await server.transformIndexHtml('/', source);
    const artUrl = html.match(/class="lr-splash__art"[^>]+src="([^"]+)"/)?.[1];
    assert.ok(artUrl?.startsWith('data:image/svg+xml,'), 'Initial splash embeds its SVG image');
    assert.match(decodeURIComponent(artUrl), /LuxuryRental LR monogram/);
    assert.match(html, /\.lr-splash\s*\{/);
  } finally {
    await server.close();
  }
});

test('Repeated engraved artwork and every sell grade resolve their own SVG effects', async () => {
  const root = fileURLToPath(new URL('../', import.meta.url));
  const server = await createServer({ root, server: { middlewareMode: true, ws: false } });
  try {
    const { AtelierAuthenticSeal, AtelierGradeMedal } =
      await server.ssrLoadModule('/src/components/icons/atelier/AtelierBadges.tsx');
    const html = renderToStaticMarkup(createElement(Fragment, null,
      createElement(AtelierAuthenticSeal),
      createElement(AtelierAuthenticSeal),
      createElement(AtelierGradeMedal, { grade: 'A' }),
      createElement(AtelierGradeMedal, { grade: 'B' }),
    ));
    const allIds = [...html.matchAll(/ id="([^"]+)"/g)].map(([, id]) => id);
    assert.equal(new Set(allIds).size, allIds.length, 'Each artwork instance has unique effect IDs');
    for (const svg of html.match(/<svg[\s\S]+?<\/svg>/g)) {
      const localIds = new Set([...svg.matchAll(/ id="([^"]+)"/g)].map(([, id]) => id));
      for (const [, reference] of svg.matchAll(/url\(#([^)]+)\)/g)) {
        assert.ok(localIds.has(reference), `Missing local effect ${reference}`);
      }
    }
  } finally {
    await server.close();
  }
});
