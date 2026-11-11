import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import test from 'node:test';
import { projectDefinitions } from './project-manifest';
import {
  WEBVIEW_DOCS_ORIGIN,
  WEBVIEW_PROJECT_IDS,
  webviewDocsRedirect,
} from '../workers/webview-docs-redirect.mjs';
import docsWorker from '../workers/docs-worker.mjs';

test('all migrated projects become external cards without duplicated documentation sources', async () => {
  for (const id of WEBVIEW_PROJECT_IDS) {
    const project = projectDefinitions.find((entry) => entry.id === id)!;
    assert.equal(project.hostedUrl, `${WEBVIEW_DOCS_ORIGIN}/projects/${id}`);
    assert.deepEqual(project.pages, []);
    await assert.rejects(access(`projects/docs/src/${id}`));
  }
});

test('both delivery Workers permanently redirect every migrated language and retain query strings', async () => {
  for (const locale of ['', '/ja', '/fr', '/de']) {
    for (const id of WEBVIEW_PROJECT_IDS) {
      for (const prefix of ['/projects', '']) {
        for (const suffix of ['', '/', '/docs/setup', '/docs/getting-started/capacitor']) {
          const request = new Request(
            `https://docs.rdlabo.dev${locale}${prefix}/${id}${suffix}?from=old`,
            { headers: { Accept: 'text/markdown' } },
          );
          const expected = `${WEBVIEW_DOCS_ORIGIN}${locale}/projects/${id}${suffix}?from=old`;
          for (const response of [
            webviewDocsRedirect(request),
            await docsWorker.fetch(request, {
              ASSETS: {
                fetch: () => {
                  throw new Error('must redirect before assets');
                },
              },
            }),
          ]) {
            assert.equal(response?.status, 301);
            assert.equal(response?.headers.get('Location'), expected);
          }
        }
      }
    }
  }
});

test('historical Engine and theme aliases redirect directly to their new canonical guide', () => {
  for (const locale of ['', '/ja', '/fr', '/de']) {
    const request = new Request(
      `https://docs.rdlabo.dev${locale}/projects/webview-native-ui-engine/docs/cordova-plugin?x=1`,
    );
    assert.equal(
      webviewDocsRedirect(request)?.headers.get('Location'),
      `${WEBVIEW_DOCS_ORIGIN}${locale}/projects/webview-native-ui-engine/docs/getting-started/cordova?x=1`,
    );
  }
  const alias = new Request('http://127.0.0.1:8787/ja/ionic-theme-ios27/docs/api?from=legacy');
  assert.equal(
    webviewDocsRedirect(alias)?.headers.get('Location'),
    `${WEBVIEW_DOCS_ORIGIN}/ja/projects/ionic-theme-ios27/docs/setup?from=legacy`,
  );
  for (const path of [
    '/projects/capacitor-stripe',
    '/projects/ionic-theme-ios270',
    '/',
    '/ja/support',
  ]) {
    assert.equal(webviewDocsRedirect(new Request(`https://docs.rdlabo.dev${path}`)), undefined);
  }
});

test('all migrated routes invoke the source Worker before static asset fallback', async () => {
  const text = await readFile('wrangler.jsonc', 'utf8');
  for (const locale of ['', '/ja', '/fr', '/de']) {
    for (const id of WEBVIEW_PROJECT_IDS) {
      for (const prefix of ['/projects', '']) {
        const path = `${locale}${prefix}/${id}`;
        assert.ok(text.includes(JSON.stringify(path)));
        assert.ok(text.includes(JSON.stringify(path + '/*')));
      }
    }
  }
});

test('static redirects stay within Cloudflare rule limits in evaluation order', async () => {
  const text = await readFile('projects/docs/public/_redirects', 'utf8');
  const rules = text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'));
  let dynamic = false;
  let staticCount = 0;
  let dynamicCount = 0;
  for (const line of rules) {
    const [source] = line.split(/\s+/);
    dynamic ||= /\*|:[A-Za-z]/.test(source);
    if (dynamic) dynamicCount++;
    else staticCount++;
    assert.ok(
      !WEBVIEW_PROJECT_IDS.some((id) => source.includes(`/${id}/*`)),
      'migration wildcards belong to the Worker',
    );
  }
  assert.ok(staticCount <= 2000, `static redirects: ${staticCount}`);
  assert.ok(dynamicCount <= 100, `dynamic redirects: ${dynamicCount}`);
});
