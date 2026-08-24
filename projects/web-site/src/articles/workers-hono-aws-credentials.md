---
title: "Testing AWS SDK v3 on Cloudflare Workers—Why I Call Secrets Manager and STS With fetch and SigV4"
description: "AWS SDK v3 can reach AWS from Workers but lacks a credential chain; use aws4fetch for two operations with explicit Workers Secrets."
zennSlug: workers-hono-aws-credentials
emoji: "🔐"
---

When I migrated from NestJS to Hono + Cloudflare Workers, I assumed the AWS SDK would not work. Workers are not Node.js itself, and only some Node APIs are compatible.

On current workerd, though, `@aws-sdk/client-secrets-manager` reached AWS endpoints and deserialized JSON errors. I have not verified successful secret retrieval from a success response, but you cannot blanket-say "AWS SDK does not work on Workers."

Still, in my projects I call AWS Secrets Manager and STS with SigV4-signed `fetch()`, not the AWS SDK. The reason was not runtime compatibility alone but where credentials come from and bundle size for the operations I need.

# Wrangler was choosing the AWS SDK browser build

AWS SDK v3 is not Node-only—it also has browser implementations. Wrangler resolves the package `browser` field at deploy time and bundles that build. For example, `@aws-sdk/client-s3` maps Node `runtimeConfig` to the browser variant.

```json
{
  "browser": {
    "./dist-es/runtimeConfig": "./dist-es/runtimeConfig.browser"
  }
}
```

[AWS SDK v3 S3 client package](https://github.com/aws/aws-sdk-js-v3/blob/v3.1106.0/clients/client-s3/package.json)

In the browser build, Node's default credential provider is replaced with:

```ts
credentialDefaultProvider:
  config?.credentialDefaultProvider ??
  (() => () => Promise.reject(new Error('Credential is missing'))),
```

`nodejs_compat` does not select the AWS SDK Node build. The generated bundle has no Node credential chain; omit credentials and you get `Credential is missing` without searching shared config.

The browser build communicates with Web standard `fetch()`. It avoids Node `http` and `fs` for credential loading, so the Secrets Manager client could request AWS endpoints from Workers. My initial "Node SDK so it won't run" take was too coarse.

[Cloudflare official: Bundling](https://developers.cloudflare.com/workers/wrangler/bundling/)

[AWS SDK for JavaScript v3 supported environments](https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/setting-up.html)

# Even on the browser build, some operations stop

Using `@aws-sdk/client-secrets-manager`, `@aws-sdk/client-s3`, and `@aws-sdk/client-sts` 3.1106.0, I drove real operations on local workerd and Cloudflare production.

| Check | Result |
|---|---|
| Secrets Manager `GetSecretValue` | Reached AWS locally and in production; deserialized JSON error |
| S3 presigned URL for `PutObject` | Succeeded locally and in production |
| S3 `ListBuckets` | `DOMParser is not defined` locally and in production |
| STS `AssumeRole` | `DOMParser is not defined` locally |
| S3 signing with credentials omitted | `Credential is missing` locally and in production |

For Secrets Manager I passed AWS official sample credentials, so `UnrecognizedClientException` from AWS was expected. It shows SigV4 requests reached AWS and JSON responses deserialized.

S3 `ListBuckets` and STS `AssumeRole` return XML. The AWS SDK browser XML parser requires global `DOMParser`, which Workers does not have. They stopped at deserialize after reaching AWS.

Secrets Manager progressed through JSON error deserialize; S3 presigner without response parsing works. S3 LIST and STS that read XML stop. That is the practical boundary I confirmed—not whether you can import the package, but whether the command completes protocol handling at the end.

[AWS SDK v3 browser XML parser](https://github.com/aws/aws-sdk-js-v3/blob/v3.1106.0/packages-internal/xml-builder/package.json)

## Compatibility date did not change the outcome

It was not because of `2025-09-23` that the browser build was chosen. Bundles from dry-run with `compatibility_date = "2021-11-02"` and no `nodejs_compat` were still browser builds. I reran the same operations on local workerd and got the same pass/fail as the table. I confirmed production runtime at `2025-09-23`. Compatibility dates switch runtime behavior; they are not what picks AWS SDK browser vs Node builds.

This is from switching dates with current SDK and Wrangler, not reproducing 2021-era SDK versions.

[Cloudflare official: Compatibility dates](https://developers.cloudflare.com/workers/configuration/compatibility-dates/)

# Even when the AWS SDK runs, there is no credential chain

First I sorted out how much of AWS credentials that worked implicitly on EC2 or local Node.js carry over to Workers.

## What "no credential chain" means

The AWS SDK for JavaScript Node.js default provider chain searches environment variables, SSO cache, web identity tokens, shared config, ECS/EC2 metadata, and so on in order.

[AWS official: Node.js default credential provider chain](https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/setting-credentials-node.html)

AWS official documentation says browser and React Native runtimes have an empty credential chain and require explicit credentials.

[AWS official: Credential providers by runtime](https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/migrate-credential-providers.html)

Enabling `nodejs_compat` on Workers widens Node API compatibility but does not create an IAM Role on AWS. The issue is that there is **no trusted AWS execution environment credential source**.

## Where to put long-term keys if you use them

AWS recommends temporary credentials for workloads. First consider OIDC federation or IAM Roles Anywhere to obtain temporary role credentials from external workloads. In my existing setup I did not adopt those and used bootstrap long-term keys, so I limited them to a least-privilege IAM user stored in Workers Secrets.

[AWS official: IAM security best practices](https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html)

```sh
npx wrangler secret put AWS_ACCESS_KEY_ID
npx wrangler secret put AWS_SECRET_ACCESS_KEY
```

I do not put production keys in plaintext `[vars]` in `wrangler.toml` or in Git-managed `.dev.vars`. I also avoid omnipotent administrator keys and limit permissions to specific Secrets Manager reads and AssumeRole on specific roles.

Because these are long-term credentials from outside AWS into AWS, I need regular rotation and a revocation procedure on leak.

Cloudflare offers Secrets Store in addition to per-Worker Secrets—shared and managed at account level. When the same AWS credential goes to multiple Workers, that reduces rotation touch points compared to separate `wrangler secret put` calls. As of August 2026 it is open beta; check terms and limits.

[Cloudflare Secrets Store](https://developers.cloudflare.com/secrets-store/integrations/workers/)

# Why I chose aws4fetch anyway

Narrowed to the two operations I need, the decision is clear.

| Operation | AWS SDK v3 | Adoption |
|---|---|---|
| Secrets Manager `GetSecretValue` | Reached AWS; JSON error deserialize confirmed | Success fetch unverified; avoid large client for few APIs |
| STS `AssumeRole` | Stopped at XML deserialize | SigV4 `fetch()` can handle response directly |

Credentials do not disappear when you drop the SDK. With my long-term key setup, both implementations must pass values explicitly from Workers Secrets. On top of that, unifying Secrets Manager and STS in the same SigV4 `fetch()` and keeping only needed operations was aws4fetch's advantage.

Retry, error mapping, and response schema tracking from the SDK become my responsibility. I chose it not only for size but because I can own implementation and tests for the two operations I need.

Dry-run bundling a minimal Worker with only one Secrets Manager operation showed:

| Implementation | Total Upload | gzip |
|---|---:|---:|
| `@aws-sdk/client-secrets-manager` | 362.02 KiB | 70.64 KiB |
| `aws4fetch` | 31.11 KiB | 8.31 KiB |

This measures one operation in a hand-built Worker, not a benchmark of the entire AWS SDK. For calling a few AWS APIs, `aws4fetch` on Web APIs alone is smaller and narrows what runtime compatibility I must track.

Bundle size here is not about frontend download speed. Workers deploy limits are 3 MB compressed on Free and 10 MB on Paid. Both fit this time, but ~71 KiB vs ~8 KiB for a few AWS operations affects headroom for other dependencies.

[Cloudflare Workers limits](https://developers.cloudflare.com/workers/platform/limits/#worker-size)

If you need many services, want middleware or retry strategies, or rely heavily on SDK types, AWS SDK v3 is worth it. Even then, pass credentials explicitly and run the commands you use through production runtime.

If you can move values to Cloudflare's side, leaving AWS Secrets Manager off the request path is simpler. Unless AWS remains source of truth for rotation or you share values across multiple AWS workloads, put secrets directly in Cloudflare Secrets or Secrets Store. I kept AWS as source of truth this time, so I chose SigV4 `fetch()`.

# Call AWS with Web APIs only

Instead of the AWS SDK, I call Secrets Manager and STS with SigV4-signed `fetch()`.

## Fetch Secrets Manager with SigV4

AWS APIs can be signed with Signature Version 4. With `aws4fetch`, I build signed `fetch()` on Workers Web APIs.

```ts
import { AwsClient } from 'aws4fetch';

const aws = new AwsClient({
  accessKeyId: env.AWS_ACCESS_KEY_ID,
  secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  sessionToken: env.AWS_SESSION_TOKEN,
  service: 'secretsmanager',
  region: 'ap-northeast-1',
});

const response = await aws.fetch(
  'https://secretsmanager.ap-northeast-1.amazonaws.com/',
  {
    method: 'POST',
    headers: {
      'content-type': 'application/x-amz-json-1.1',
      'x-amz-target': 'secretsmanager.GetSecretValue',
    },
    body: JSON.stringify({
      SecretId: 'production/authentication',
      VersionStage: 'AWSCURRENT',
    }),
  },
);
```

Parse `SecretString` from the response as JSON. Handle `SecretBinary` separately if your design needs it.

```ts
if (!response.ok) {
  throw new Error(`GetSecretValue failed: ${response.status}`);
}
const body = (await response.json()) as { SecretString?: string };
if (!body.SecretString) throw new Error('SecretString is missing');
const secret = JSON.parse(body.SecretString);
```

## Cache secrets per isolate

Calling Secrets Manager every request increases latency, subrequests, and AWS cost. My implementation puts the in-flight Promise in isolate scope, keyed by `region:accessKeyId:secretId`, so concurrent requests in the same isolate share it. On fetch failure I remove the Promise from cache so the next request retries.

This cache has no TTL. If AWS rotates a value while credential and secret ID stay the same, an existing isolate may keep the old value. For immediate reflection, add TTL or version to the cache key or skip caching. That is a latency vs rotation latency trade-off.

[Cloudflare Workers bindings](https://developers.cloudflare.com/workers/runtime-apis/bindings/)

## Issue short-lived credentials with STS

For direct browser upload to S3, you must not return Workers long-term keys. On an endpoint callable only by authenticated users, run STS `AssumeRole` and return temporary credentials with a short lifetime and limited permissions.

```ts
const sts = new AwsClient({
  accessKeyId: env.AWS_ACCESS_KEY_ID,
  secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  service: 'sts',
  region: 'us-east-1', // Signing region for the global STS endpoint
});

const userHash = Array.from(
  new Uint8Array(
    await crypto.subtle.digest('SHA-256', new TextEncoder().encode(userId)),
  ),
)
  .map((byte) => byte.toString(16).padStart(2, '0'))
  .join('')
  .slice(0, 16);

const params = new URLSearchParams({
  Action: 'AssumeRole',
  Version: '2011-06-15',
  RoleArn: env.UPLOAD_ROLE_ARN,
  RoleSessionName: `upload-${userHash}-${Date.now()}`,
  DurationSeconds: '900',
});

const response = await sts.fetch('https://sts.amazonaws.com/', {
  method: 'POST',
  headers: { 'content-type': 'application/x-www-form-urlencoded' },
  body: params,
});

const xml = await response.text();
if (!response.ok) {
  throw new Error(`AssumeRole failed: ${response.status} ${xml}`);
}

const pick = (tag: string) =>
  new RegExp(`<${tag}>([^<]*)</${tag}>`).exec(xml)?.[1];
const values = [
  pick('AccessKeyId'),
  pick('SecretAccessKey'),
  pick('SessionToken'),
  pick('Expiration'),
];
if (values.some((value) => !value)) {
  throw new Error('AssumeRole response is missing credentials');
}
```

I validate the four required credential tags before use. This handles STS's fixed response only—not a generic XML parser. I avoid extra dependencies and Workers' missing `DOMParser`, but I must track AWS response changes in tests.

`RoleSessionName` is an audit name, not access control. The example hashes arbitrary user IDs to fit STS allowed characters and the 64-character limit. Narrow bucket and operations in the role policy; if you isolate prefixes per user, inline session policy on AssumeRole can restrict further. If you do not need to hand temporary credentials to the browser, presigned URLs scoped to specific objects are safer. Even 15-minute credentials can cause large harm if they can touch other users' prefixes or entire buckets.

# Summary

On current Cloudflare Workers, the AWS SDK v3 Secrets Manager client reached AWS locally and in production and deserialized JSON errors. Successful secret fetch from a success response is unverified. The current browser bundle reached the same path locally even at the oldest compatibility date with no `nodejs_compat`. S3 `ListBuckets` stopped on `DOMParser` locally and in production; STS `AssumeRole` stopped on `DOMParser` locally. Do not judge by package name alone—run the commands you actually use.

Even when the AWS SDK runs, Workers do not get an AWS IAM Role. Put only least-privilege entry credentials in Workers Secrets. Cache Secrets Manager values with TTL or similar according to acceptable rotation delay. Keep client-facing permissions short and narrow via STS. If you need few APIs, call them with SigV4 `fetch()`.

Moving outside AWS made visible in code boundaries that IAM Roles used to hide.

See you next time.
