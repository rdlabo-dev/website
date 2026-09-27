/// <reference types="@cloudflare/workers-types" />

import { HTTPFacilitatorClient } from '@x402/core/server';
import type { Network } from '@x402/core/types';
import { ExactEvmScheme } from '@x402/evm/exact/server';
import { paymentMiddleware, x402ResourceServer } from '@x402/hono';
import { Hono } from 'hono';
import { fetchJev, JevRouter, type JevRouterOptions } from 'hono-jev-router';
import { createCdpFacilitatorClient } from './cdp-facilitator';
import { AGENT_MARKDOWN } from './generated/agent-markdown.generated';

const DEFAULT_FACILITATOR_URL = 'https://api.cdp.coinbase.com/platform/v2/x402';
const DEFAULT_NETWORK = 'eip155:8453' as Network;
const DEFAULT_PRICE = '$0.001';
const PAYMENT_HEADERS = ['payment-signature', 'x-payment'];
const MAX_PAID_APP_CACHE_SIZE = 32;
const paidApps = new Map<string, Hono>();

export type RoutingMode = 'off' | 'observe' | 'enforce';

export type AgentRouterBindings = {
  TYPESAFE_API_KEY?: string;
  JEV_ROUTING_MODE?: RoutingMode;
  X402_FACILITATOR_URL?: string;
  X402_NETWORK?: string;
  X402_PAY_TO?: string;
  X402_PRICE?: string;
  CDP_API_KEY_ID?: string;
  CDP_API_KEY_SECRET?: string;
};

type AgentRouterDependencies = {
  choose?: JevRouterOptions['choose'];
  originFetch?: typeof fetch;
  paidMarkdown?: (request: Request, env: AgentRouterBindings) => Promise<Response>;
};

function requestForOrigin(request: Request): Request {
  const headers = new Headers(request.headers);
  for (const header of PAYMENT_HEADERS) headers.delete(header);
  return new Request(request, { headers });
}

function isConfiguredMode(value: string | undefined): value is RoutingMode {
  return value === 'off' || value === 'observe' || value === 'enforce';
}

export function routingMode(env: AgentRouterBindings): RoutingMode {
  return isConfiguredMode(env.JEV_ROUTING_MODE) ? env.JEV_ROUTING_MODE : 'off';
}

export function sanitizeJevInput(input: Parameters<NonNullable<JevRouterOptions['run']>>[1]) {
  const url = new URL(input.state.url);
  return {
    ...input,
    state: { ...input.state, url: `${url.origin}${url.pathname}` },
  };
}

export function isExperimentRequest(request: Request): boolean {
  if (request.method !== 'GET') return false;
  const path = new URL(request.url).pathname.replace(/\/$/, '');
  return Object.hasOwn(AGENT_MARKDOWN, path);
}

function markdownForRequest(request: Request): string | undefined {
  const path = new URL(request.url).pathname.replace(/\/$/, '');
  return AGENT_MARKDOWN[path as keyof typeof AGENT_MARKDOWN];
}

function withPaidResponseHeaders(response: Response): Response {
  const headers = new Headers(response.headers);
  headers.set('Cache-Control', 'private, no-store');
  headers.append('Vary', 'Accept');
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

async function servePaidMarkdown(request: Request, env: AgentRouterBindings): Promise<Response> {
  const markdown = markdownForRequest(request);
  if (!markdown || !env.X402_PAY_TO) {
    throw new Error('Paid Markdown is not configured');
  }

  const network = (env.X402_NETWORK || DEFAULT_NETWORK) as Network;
  const facilitatorUrl = env.X402_FACILITATOR_URL || DEFAULT_FACILITATOR_URL;
  const price = env.X402_PRICE || DEFAULT_PRICE;
  if (network === 'eip155:8453' && (!env.CDP_API_KEY_ID || !env.CDP_API_KEY_SECRET)) {
    throw new Error('CDP facilitator credentials are not configured for Base mainnet');
  }
  const normalizedUrl = new URL(request.url);
  normalizedUrl.pathname = normalizedUrl.pathname.replace(/\/$/, '');
  const path = normalizedUrl.pathname;
  const cacheKey = JSON.stringify([
    path,
    facilitatorUrl,
    network,
    price,
    env.X402_PAY_TO,
    env.CDP_API_KEY_ID,
  ]);
  let paid = paidApps.get(cacheKey);
  if (!paid) {
    const facilitator =
      network === 'eip155:8453'
        ? createCdpFacilitatorClient({
            apiKeyId: env.CDP_API_KEY_ID!,
            apiKeySecret: env.CDP_API_KEY_SECRET!,
            baseUrl: facilitatorUrl,
          })
        : new HTTPFacilitatorClient({ url: facilitatorUrl });
    const server = new x402ResourceServer(facilitator).register(network, new ExactEvmScheme());
    paid = new Hono();
    paid.use(
      '*',
      paymentMiddleware(
        {
          [`GET ${path}`]: {
            accepts: [
              {
                scheme: 'exact',
                price,
                network,
                payTo: env.X402_PAY_TO,
              },
            ],
            description: 'Markdown documentation for AI agents',
            mimeType: 'text/markdown',
          },
        },
        server,
      ),
    );
    paid.get(path, (c) =>
      c.body(markdown, 200, {
        'Content-Type': 'text/markdown; charset=utf-8',
      }),
    );
    paidApps.set(cacheKey, paid);
    if (paidApps.size > MAX_PAID_APP_CACHE_SIZE) {
      const oldestKey = paidApps.keys().next().value;
      if (oldestKey) paidApps.delete(oldestKey);
    }
  } else {
    paidApps.delete(cacheKey);
    paidApps.set(cacheKey, paid);
  }

  return withPaidResponseHeaders(await paid.fetch(new Request(normalizedUrl, request)));
}

export function createAgentRouter(dependencies: AgentRouterDependencies = {}) {
  const originFetch = dependencies.originFetch ?? fetch;
  const paidMarkdown = dependencies.paidMarkdown ?? servePaidMarkdown;
  const fallback = (request: Request) => originFetch(requestForOrigin(request));
  const app = new Hono<{ Bindings: AgentRouterBindings }>({
    router: new JevRouter({
      threshold: 0.7,
      redactHeaders: [
        'authorization',
        'cookie',
        'proxy-authorization',
        'x-api-key',
        'x-auth-token',
        ...PAYMENT_HEADERS,
      ],
      ...(dependencies.choose
        ? { choose: dependencies.choose }
        : {
            run: async (c, request) => {
              const apiKey = c.env.TYPESAFE_API_KEY?.trim();
              if (!apiKey) throw new Error('TYPESAFE_API_KEY is not configured');
              return fetchJev({ apiKey })(sanitizeJevInput(request));
            },
          }),
    }),
  });

  const respond = async (
    request: Request,
    env: AgentRouterBindings,
    decision: 'suspicious' | 'agent' | 'human',
  ): Promise<Response> => {
    const mode = routingMode(env);
    console.log(
      JSON.stringify({ event: 'jev-route', decision, mode, path: new URL(request.url).pathname }),
    );
    if (mode !== 'enforce') return fallback(request);
    if (decision === 'suspicious') return new Response('Forbidden', { status: 403 });
    if (decision === 'human') return fallback(request);

    const response = await paidMarkdown(request, env);
    return response.status >= 500 ? fallback(request) : response;
  };

  app.on('jev', 'suspicious automated traffic', (c) => respond(c.req.raw, c.env, 'suspicious'));
  app.on(
    'jev',
    'a request from an AI agent, including a request that explicitly prefers text/markdown',
    (c) => respond(c.req.raw, c.env, 'agent'),
  );
  app.on('jev', 'a request from a human browser', (c) => respond(c.req.raw, c.env, 'human'));
  app.notFound((c) => fallback(c.req.raw));

  return {
    async fetch(request: Request, env: AgentRouterBindings, ctx?: ExecutionContext) {
      if (!isExperimentRequest(request) || routingMode(env) === 'off') return fallback(request);
      try {
        if (
          routingMode(env) === 'enforce' &&
          request.headers.get('accept')?.toLowerCase().includes('text/markdown')
        ) {
          const response = await paidMarkdown(request, env);
          return response.status >= 500 ? fallback(request) : response;
        }
        if (
          routingMode(env) === 'enforce' &&
          request.headers.get('accept')?.toLowerCase().includes('text/html')
        ) {
          return fallback(request);
        }
        const response = await app.fetch(request, env, ctx);
        return response.status >= 500 ? fallback(request) : response;
      } catch (error) {
        console.error('docs-agent-router failed open', error);
        return fallback(request);
      }
    },
  };
}

export default createAgentRouter();
