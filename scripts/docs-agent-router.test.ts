import assert from 'node:assert/strict';
import type { JevInput, JevResult } from 'hono-jev-router';
import { afterEach, test, vi } from 'vitest';
import {
  createAgentRouter,
  isExperimentRequest,
  routingMode,
  sanitizeJevInput,
  type AgentRouterBindings,
} from '../workers/docs-agent-router';
import { AGENT_MARKDOWN } from '../workers/generated/agent-markdown.generated';
import { PUBLISHED_DOCS_LOCALES } from '../shared/docs-locales';

const target = 'https://docs.rdlabo.dev/projects/capacitor-brotherprint';
const guide = 'https://docs.rdlabo.dev/projects/capacitor-stripe/docs/payment-sheet';
const japaneseGuide = 'https://docs.rdlabo.dev/ja/projects/capacitor-admob/docs/banner';

afterEach(() => vi.restoreAllMocks());

function decision(match: string) {
  return async (_context: unknown, input: JevInput): Promise<JevResult> => {
    const route = input.routes.find((candidate) => candidate.includes(match));
    assert.ok(route, `missing semantic route containing ${match}`);
    return {
      route,
      confidence: 0.99,
      probabilities: Object.fromEntries(input.routes.map((candidate) => [candidate, 0.01])),
    };
  };
}

function env(mode: 'off' | 'observe' | 'enforce'): AgentRouterBindings {
  return {
    JEV_ROUTING_MODE: mode,
    X402_NETWORK: 'eip155:84532',
    X402_FACILITATOR_URL: 'https://x402.org/facilitator',
    X402_PAY_TO: '0x0000000000000000000000000000000000000001',
  };
}

test('covers every generated project documentation route', () => {
  const paths = Object.keys(AGENT_MARKDOWN);
  assert.ok(
    paths.length > 300,
    `expected the complete docs catalog, received ${paths.length} paths`,
  );
  for (const path of paths.filter((candidate) => candidate.startsWith('/projects/'))) {
    for (const { code, subPath } of PUBLISHED_DOCS_LOCALES) {
      const localizedPath = `${subPath ? `/${subPath}` : ''}${path}`;
      assert.equal(
        Object.hasOwn(AGENT_MARKDOWN, localizedPath),
        true,
        `missing ${code} path for ${path}`,
      );
      assert.equal(
        isExperimentRequest(new Request(`https://docs.rdlabo.dev${localizedPath}`)),
        true,
      );
    }
  }
  assert.equal(isExperimentRequest(new Request(target)), true);
  assert.equal(isExperimentRequest(new Request(`${target}/`)), true);
  assert.equal(isExperimentRequest(new Request(guide)), true);
  assert.equal(isExperimentRequest(new Request(japaneseGuide)), true);
  assert.equal(isExperimentRequest(new Request('https://docs.rdlabo.dev/support')), false);
  assert.equal(isExperimentRequest(new Request('https://docs.rdlabo.dev/main.js')), false);
  assert.equal(isExperimentRequest(new Request(target, { method: 'POST' })), false);
});

test('removes query data before sending a request description to TypeSafe', () => {
  const input = {
    state: {
      method: 'GET',
      url: `${target}?token=secret&campaign=x402`,
      headers: { accept: 'text/markdown' },
    },
    questions: {
      agent: { type: 'noul' as const, instructions: 'a request from an AI agent' },
    },
  };
  assert.equal(sanitizeJevInput(input).state.url, target);
  assert.equal(sanitizeJevInput(input).state.headers, input.state.headers);
});

test('calls TypeSafe directly with the current environment key and redacted request state', async () => {
  const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
    Response.json({
      answers: { route_1: { noul: 0.01 }, route_2: { noul: 0.99 }, route_3: { noul: 0.01 } },
    }),
  );
  const router = createAgentRouter({
    originFetch: async () => new Response('static html'),
    paidMarkdown: async () => new Response('payment required', { status: 402 }),
  });
  const response = await router.fetch(
    new Request(`${target}?token=private-query`, {
      headers: {
        Accept: '*/*',
        Authorization: 'private-auth',
        Cookie: 'private-cookie',
        'X-API-Key': 'private-client-key',
        'Payment-Signature': 'private-payment',
        'X-Payment': 'private-legacy-payment',
      },
    }),
    { ...env('enforce'), TYPESAFE_API_KEY: 'test-typesafe-key' },
  );
  assert.equal(response.status, 402);
  assert.equal(fetchMock.mock.calls.length, 1);
  const [url, init] = fetchMock.mock.calls[0];
  assert.equal(url, 'https://api.typesafe.ai/v1/systemone');
  assert.equal(init?.method, 'POST');
  assert.equal(new Headers(init?.headers).get('authorization'), 'Bearer test-typesafe-key');
  const body = JSON.parse(init?.body as string);
  assert.equal(body.model, 'jev-latest');
  assert.equal(body.state.url, target);
  assert.equal(body.state.headers.accept, '*/*');
  for (const header of ['authorization', 'cookie', 'x-api-key', 'payment-signature', 'x-payment']) {
    assert.equal(body.state.headers[header], '[redacted]');
  }
  assert.doesNotMatch(init?.body as string, /private-|test-typesafe-key/);
  assert.equal(Object.keys(body.questions).length, 3);

  fetchMock.mockResolvedValueOnce(Response.json({ answers: { route_3: { noul: 0.99 } } }));
  const nextResponse = await router.fetch(new Request(target), {
    ...env('enforce'),
    TYPESAFE_API_KEY: 'rotated-typesafe-key',
  });
  assert.equal(await nextResponse.text(), 'static html');
  assert.equal(
    new Headers(fetchMock.mock.calls[1][1]?.headers).get('authorization'),
    'Bearer rotated-typesafe-key',
  );
});

test('missing or blank TypeSafe keys fail open without sending a classifier request', async () => {
  const fetchMock = vi.spyOn(globalThis, 'fetch');
  vi.spyOn(console, 'error').mockImplementation(() => undefined);
  const router = createAgentRouter({ originFetch: async () => new Response('static html') });
  for (const TYPESAFE_API_KEY of [undefined, '', '   ']) {
    const response = await router.fetch(new Request(target), {
      ...env('enforce'),
      TYPESAFE_API_KEY,
    });
    assert.equal(await response.text(), 'static html');
  }
  assert.equal(fetchMock.mock.calls.length, 0);
});

test('TypeSafe HTTP errors and malformed responses fail open to the public site', async () => {
  const fetchMock = vi.spyOn(globalThis, 'fetch');
  vi.spyOn(console, 'error').mockImplementation(() => undefined);
  const router = createAgentRouter({ originFetch: async () => new Response('static html') });
  for (const result of [
    new Response('invalid key', { status: 401 }),
    new Response('rate limited', { status: 429 }),
    new Response('unavailable', { status: 503 }),
    new Response('invalid json'),
    Response.json({}),
  ]) {
    fetchMock.mockResolvedValueOnce(result);
    const response = await router.fetch(new Request(target), {
      ...env('enforce'),
      TYPESAFE_API_KEY: 'test-typesafe-key',
    });
    assert.equal(response.status, 200);
    assert.equal(await response.text(), 'static html');
  }
});

test('defaults unknown routing modes to off', () => {
  assert.equal(routingMode(env('observe')), 'observe');
  assert.equal(routingMode({ ...env('observe'), JEV_ROUTING_MODE: 'unknown' as 'off' }), 'off');
});

test('off and observe modes always return the static origin response', async () => {
  let classifications = 0;
  const originFetch = async () =>
    new Response('static html', { headers: { 'Content-Type': 'text/html' } });
  const router = createAgentRouter({
    originFetch,
    choose: async (context, input) => {
      classifications += 1;
      return decision('AI agent')(context, input);
    },
    paidMarkdown: async () => new Response('paid markdown'),
  });

  assert.equal(
    (await router.fetch(new Request(target), env('off'))).headers.get('content-type'),
    'text/html',
  );
  assert.equal(classifications, 0);
  assert.equal(
    (await router.fetch(new Request(target), env('observe'))).headers.get('content-type'),
    'text/html',
  );
  assert.equal(classifications, 1);
});

test('enforce mode sends agent traffic through the paid Markdown handler', async () => {
  const router = createAgentRouter({
    originFetch: async () => new Response('static html'),
    choose: decision('AI agent'),
    paidMarkdown: async () =>
      new Response('# Paid documentation', {
        headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
      }),
  });

  const response = await router.fetch(
    new Request(target, { headers: { Accept: 'text/markdown' } }),
    env('enforce'),
  );
  assert.equal(response.status, 200);
  assert.match(response.headers.get('content-type') ?? '', /^text\/markdown/);
});

test('explicit Markdown requests do not depend on classifier availability', async () => {
  let classifications = 0;
  const router = createAgentRouter({
    originFetch: async () => new Response('static html'),
    choose: async () => {
      classifications += 1;
      throw new Error('TypeSafe API unavailable');
    },
    paidMarkdown: async () => new Response('payment required', { status: 402 }),
  });
  const response = await router.fetch(
    new Request(target, { headers: { Accept: 'text/markdown' } }),
    env('enforce'),
  );
  assert.equal(response.status, 402);
  assert.equal(classifications, 0);
});

test('explicit HTML requests skip the classifier and retain the public site', async () => {
  let classifications = 0;
  const router = createAgentRouter({
    originFetch: async () => new Response('static html', { status: 200 }),
    choose: async () => {
      classifications += 1;
      throw new Error('TypeSafe API unavailable');
    },
  });
  const response = await router.fetch(
    new Request(target, { headers: { Accept: 'text/html' } }),
    env('enforce'),
  );
  assert.equal(response.status, 200);
  assert.equal(classifications, 0);
});

test('enforce mode requires payment before returning generated Markdown', async () => {
  const router = createAgentRouter({
    originFetch: async () => new Response('static html'),
    choose: decision('AI agent'),
  });
  const response = await router.fetch(
    new Request(target, { headers: { Accept: 'text/markdown' } }),
    env('enforce'),
  );

  assert.equal(response.status, 402);
  assert.equal(response.headers.get('cache-control'), 'private, no-store');
  assert.ok(response.headers.get('payment-required'));
  assert.notEqual(await response.text(), AGENT_MARKDOWN[new URL(target).pathname]);
});

test('a trailing slash cannot bypass the payment middleware', async () => {
  const router = createAgentRouter({
    originFetch: async () => new Response('static html'),
    choose: decision('AI agent'),
  });
  const response = await router.fetch(
    new Request(`${target}/`, { headers: { Accept: 'text/html, text/markdown' } }),
    env('enforce'),
  );

  assert.equal(response.status, 402);
  assert.ok(response.headers.get('payment-required'));
  assert.notEqual(await response.text(), AGENT_MARKDOWN[new URL(target).pathname]);
});

test('Base mainnet stays on static HTML until CDP credentials are configured', async () => {
  const router = createAgentRouter({
    originFetch: async () =>
      new Response('static html', { headers: { 'Content-Type': 'text/html' } }),
    choose: decision('AI agent'),
  });
  const response = await router.fetch(new Request(target), {
    ...env('enforce'),
    X402_NETWORK: 'eip155:8453',
    X402_FACILITATOR_URL: 'https://api.cdp.coinbase.com/platform/v2/x402',
  });

  assert.equal(response.status, 200);
  assert.equal(await response.text(), 'static html');
});

test('human traffic, classifier failures, and paid-service failures fail open to HTML', async () => {
  const originFetch = async () =>
    new Response('static html', { headers: { 'Content-Type': 'text/html' } });
  const human = createAgentRouter({ originFetch, choose: decision('human browser') });
  const classifierFailure = createAgentRouter({
    originFetch,
    choose: async () => {
      throw new Error('TypeSafe API quota exceeded');
    },
  });
  const paymentFailure = createAgentRouter({
    originFetch,
    choose: decision('AI agent'),
    paidMarkdown: async () => new Response('facilitator unavailable', { status: 503 }),
  });

  for (const router of [human, classifierFailure, paymentFailure]) {
    const response = await router.fetch(new Request(target), env('enforce'));
    assert.equal(response.status, 200);
    assert.match(response.headers.get('content-type') ?? '', /^text\/html/);
  }
});

test('does not forward payment credentials to the static origin', async () => {
  let forwarded: Request | undefined;
  const router = createAgentRouter({
    originFetch: async (request) => {
      forwarded = request;
      return new Response('static html');
    },
  });
  await router.fetch(
    new Request(target, {
      headers: {
        'Payment-Signature': 'secret-payment-payload',
        'X-Payment': 'legacy-secret-payment-payload',
      },
    }),
    env('off'),
  );

  assert.ok(forwarded);
  assert.equal(forwarded.headers.has('payment-signature'), false);
  assert.equal(forwarded.headers.has('x-payment'), false);
});
