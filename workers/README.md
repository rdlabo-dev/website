# Documentation agent router

`docs-agent-router.ts` is an optional Worker Route in front of the existing `docs.rdlabo.dev`
Static Assets Worker. It experiments with Jev request classification and x402 without making either
service part of the site's availability path.

The checked-in configuration uses `enforce` mode. Requests that explicitly accept `text/markdown`
receive an x402 payment challenge and the generated Markdown after payment. Requests that accept
`text/html` use the public static site. Ambiguous requests go directly to the
[TypeSafe API](https://docs.typesafe.ai/api) using `TYPESAFE_API_KEY` and the `jev-latest` model
(`POST https://api.typesafe.ai/v1/systemone`). Workers AI and AI Gateway are not used.
Missing keys and classifier errors fall back to the public site.
`observe` logs Jev decisions while returning static HTML; `off` skips Jev entirely. Requests for
assets and pages without generated Markdown use the static site.

The Markdown module under `workers/generated/` is a disposable build artifact and is ignored by
Git. `docs:generate:content`, `build:docs-agent-router`, and `deploy:docs-agent-router` recreate it
from the documentation sources before Wrangler bundles the Worker.

Production setup:

1. Choose a wallet you control that can receive USDC on Base. The checked-in `X402_NETWORK`
   is Base mainnet (`eip155:8453`). Copy only its public `0x` address; never put a recovery
   phrase or private key in this repository or Wrangler.
2. Set that public receiving address as a Worker secret with
   `npx wrangler secret put X402_PAY_TO --config wrangler.docs-agent-router.jsonc`.
3. Create a Coinbase Developer Platform API key, then set `CDP_API_KEY_ID` and
   `CDP_API_KEY_SECRET` as Worker secrets. The CDP facilitator needs these for Base mainnet;
   the Coinbase Wallet app account alone does not provide them. Do not create a CDP wallet
   secret: the external wallet in `X402_PAY_TO` receives funds. Set each value with
   `npx wrangler secret put NAME --config wrangler.docs-agent-router.jsonc`, replacing
   `NAME` with the corresponding variable name.
4. Create a TypeSafe API key, then set it as a Worker secret:
   `npx wrangler secret put TYPESAFE_API_KEY --config wrangler.docs-agent-router.jsonc`.
   Paste the key at the prompt; do not put it in Wrangler `vars` or source control.
5. Deploy with `npm run deploy:docs-agent-router`.
6. In the Cloudflare dashboard, set both `docs-agent-router` routes to **Fail open**. Workers Static
   Assets `run_worker_first` does not fall back after the Free plan request limit, so this separate
   fail-open Worker Route is intentional.
7. Check that Markdown requests receive HTTP 402 with Base USDC payment requirements and browser
   requests continue to receive HTML. No wallet payment was sent during this check.

Application errors, TypeSafe API errors, and x402 responses with status 5xx return the static
site. Invalid or missing payment remains an x402 `402` response. Removing the Worker Routes restores
the original static site without changing the docs Worker.

For local development, copy `.dev.vars.example` to `.dev.vars` next to the Wrangler config and set
`TYPESAFE_API_KEY` there. If `.dev.vars` already exists, add the variable without overwriting the
other secrets. `.dev.vars*` is ignored by Git except for the empty example. Generate the Markdown
with `npm run docs:generate:content`, then run
`npx wrangler dev --config wrangler.docs-agent-router.jsonc`. The key is read per request, so each
environment uses its own secret. Existing sensitive-header redaction and URL query removal still
apply before sending request descriptions to TypeSafe.
