---
title: "A Hack to Pass AWS CLI Credentials to wrangler—AWS_PROFILE Alone Does Not Reach Cloudflare Workers"
description: "Resolve short-lived credentials from AWS CLI at wrangler dev startup and inject them as Worker bindings without copying keys into .dev.vars."
zennSlug: workers-hono-wrangler-dev-aws-profile
emoji: "🔑"
---

I run my Hono API migrated to Cloudflare Workers with `wrangler dev`. The API connects to AWS Secrets Manager, so I also set a profile I had already logged into with AWS IAM Identity Center.

```bash
AWS_PROFILE=my-dev-profile npx wrangler dev
```

I expected that to work. From the Worker's perspective, though, `AWS_ACCESS_KEY_ID` is `undefined`.

`AWS_PROFILE` reaches only the Node.js process running Wrangler. The local Workers runtime where Hono runs has neither the host's `~/.aws/config` nor AWS CLI credential resolution. `AWS_PROFILE` is not a Worker binding.

On the other hand, I wanted to avoid copying resolved access keys into `.dev.vars`. AWS CLI already authenticates via profile or IAM Identity Center, and I did not want a separate copy of these three values just for `wrangler dev`.

```text
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
AWS_SESSION_TOKEN
```

IAM Identity Center and AssumeRole credentials expire. Duplicating three secrets per project and repasting them whenever they expire is tedious.

# Getting started

The launcher ships with `@rdlabo/workers-hono-kit`. Install it in your Hono project first.

```bash
npm install @rdlabo/workers-hono-kit
```

With AWS CLI as the source of truth for credentials, resolve short-lived credentials from your profile at startup and launch `wrangler dev`.

```bash
AWS_PROFILE=${AWS_PROFILE:-my-dev-profile} node node_modules/@rdlabo/workers-hono-kit/scripts/sync-dev-aws.mjs dev
```

This launcher converts credentials managed by AWS CLI into a form the local Worker can use.

# Why AWS_PROFILE alone is not enough

`AWS_PROFILE` selects authentication settings on the host. That is separate from bindings the local Worker receives.

## Host and local Worker are different processes

Local development involves three processes.

```text
shell
  └─ Wrangler（Node.js）
       └─ local Workers runtime（workerd）
            └─ Hono API
```

`AWS_PROFILE` in the shell tells AWS CLI which config to use when resolving credentials. IAM Identity Center cache and AssumeRole are handled inside that resolution.

What the Hono API needs, however, is not a profile name but three values to sign AWS requests.

For temporary credentials especially, dropping the third value `AWS_SESSION_TOKEN` causes authentication to fail.

On the Workers side, these arrive via `env`.

```ts
type Env = {
  AWS_ACCESS_KEY_ID: string;
  AWS_SECRET_ACCESS_KEY: string;
  AWS_SESSION_TOKEN?: string;
};

const app = new Hono<{ Bindings: Env }>();

app.get('/example', async (c) => {
  return callAwsApi({
    accessKeyId: c.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: c.env.AWS_SECRET_ACCESS_KEY,
    sessionToken: c.env.AWS_SESSION_TOKEN,
  });
});
```

With a recent compatibility date and `nodejs_compat`, you can also read bindings from `process.env`. Host environment is not unconditionally inherited, though. With Hono, receiving values via `c.env` makes the boundary explicit.

[Workers environment variables](https://developers.cloudflare.com/workers/configuration/environment-variables/)

## I did not want dual management with AWS CLI and `.dev.vars`

Cloudflare's basic local secret pattern is `.dev.vars` or `.env`. For a fixed development API key, that is enough.

```dotenv
AWS_ACCESS_KEY_ID="..."
AWS_SECRET_ACCESS_KEY="..."
AWS_SESSION_TOKEN="..."
```

Short-lived AWS credentials did not fit that model well.

- You have to copy three values every time
- When you manage multiple AWS accounts, it is hard to tell from a file which account the values belong to
- Even with `.gitignore`, you still store secrets as plaintext inside the project

I did not want a second source of truth for short-lived credentials besides AWS CLI.

[Workers local secrets](https://developers.cloudflare.com/workers/local-development/environment-variables/)

# Bridge from AWS CLI to Wrangler

Resolve currently valid credentials with AWS CLI and pass only the three required values to Wrangler.

## Let AWS CLI handle credential resolution

AWS CLI v2 has `aws configure export-credentials`, which outputs credentials resolved from a profile.

```bash
AWS_PROFILE=my-dev-profile \
  aws configure export-credentials --format env-no-export
```

Output looks like this:

```text
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_SESSION_TOKEN=...
```

This command does not read access keys directly from config files. It uses AWS CLI's own credential resolution. With `env-no-export`, you receive currently valid credentials as `KEY=VALUE` without exporting them into the shell.

[AWS CLI `export-credentials`](https://docs.aws.amazon.com/cli/latest/reference/configure/export-credentials.html)

## Pass the resolved three values to wrangler dev

The launcher runs in four stages:

```text
AWS_PROFILE
  ↓
aws configure export-credentials
  ↓ parse only three fields
wrangler dev --var AWS_ACCESS_KEY_ID:... --var ...
  ↓
Hono c.env.AWS_*
```

The core looks like this:

```js
import { spawnSync } from 'node:child_process';

const keys = [
  'AWS_ACCESS_KEY_ID',
  'AWS_SECRET_ACCESS_KEY',
  'AWS_SESSION_TOKEN',
];

const result = spawnSync(
  'aws',
  ['configure', 'export-credentials', '--format', 'env-no-export'],
  { encoding: 'utf8' },
);

if (result.status !== 0) {
  console.error('[dev-aws] Failed to resolve AWS credentials');
  process.exit(1);
}

const credentialVars = result.stdout
  .split('\n')
  .filter((line) => keys.some((key) => line.startsWith(`${key}=`)))
  .flatMap((line) => {
    const separator = line.indexOf('=');
    const key = line.slice(0, separator);
    const value = line.slice(separator + 1);
    return ['--var', `${key}:${value}`];
  });

const wrangler = spawnSync(
  'wrangler',
  [...process.argv.slice(2), ...credentialVars],
  { stdio: 'inherit' },
);

process.exit(wrangler.status ?? 1);
```

The real script also builds `PATH` to prefer the repository-local `node_modules/.bin/wrangler`.

[`sync-dev-aws.mjs` implementation](https://github.com/rdlabo-dev/workers-hono-kit/blob/main/scripts/sync-dev-aws.mjs)

Wrangler's `dev` command can inject multiple `--var KEY:VALUE` pairs into the local Worker.

[Wrangler `dev` command](https://developers.cloudflare.com/workers/wrangler/commands/#dev)

I parse only the three allowed keys instead of `eval`ing AWS CLI output in the shell. Credentials are not logged, and if resolution fails, `wrangler dev` does not start.

# Wire it into npm scripts

In each Hono project I added this to `package.json`:

```json
{
  "scripts": {
    "dev:api": "AWS_PROFILE=${AWS_PROFILE:-my-dev-profile} node node_modules/@rdlabo/workers-hono-kit/scripts/sync-dev-aws.mjs dev --var APP_ENV:development"
  }
}
```

Normally I start with the default profile and override when needed.

```bash
npm run dev:api
AWS_PROFILE=another-dev-profile npm run dev:api
```

If the IAM Identity Center session expired, log in first and restart.

```bash
aws sso login --profile my-dev-profile
npm run dev:api
```

The launcher resolves credentials only when starting `wrangler dev`. If the dev server keeps running past expiration, log in again and restart the development server.

[AWS CLI IAM Identity Center authentication](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-sso.html)

`${AWS_PROFILE:-my-dev-profile}` is POSIX shell expansion. If you share the same `package.json` on Windows `cmd.exe`, set the profile from outside or pick a cross-platform default inside the launcher.

# Scope and limitations

Avoiding duplicate files in `.dev.vars` has trade-offs with passing values via `--var`.

## Weakness of passing secrets via `--var`

This method does not write secrets to disk, but `--var KEY:VALUE` puts credentials on the Wrangler process command line. That works on a personal dev machine; I would not use it on a shared host or shared runner.

It is also local-start only. Deploy-time secrets belong in Cloudflare Workers Secrets or Secrets Store.

Current Wrangler can load values declared in `secrets.required` from the process environment. For a new setup, consider that first. If a Node.js launcher passes resolved credentials into a child process environment, you may not need `--var`.

```jsonc
{
  "secrets": {
    "required": [
      "AWS_ACCESS_KEY_ID",
      "AWS_SECRET_ACCESS_KEY",
      "AWS_SESSION_TOKEN"
    ]
  }
}
```

The essence of `sync-dev-aws.mjs` is not `--var`:

- Resolve currently valid values from AWS CLI's credential chain
- Pass three values including `AWS_SESSION_TOKEN` into Worker bindings
- Do not leave secrets in logs or project files
- Abort startup if credentials cannot be resolved

The final handoff can change to match Wrangler features.

## When you do not need this launcher

Official `.dev.vars` or `.env` is enough without extra tooling when:

- Local dev does not hit AWS and you can swap in fakes or local services
- Your organization's secret injection already feeds Wrangler
- You standardize on `secrets.required` and process environment

If multiple Hono projects call AWS APIs and each developer uses a different profile, a shared launcher is worth it.

# Summary

`AWS_PROFILE` is a host-side setting, not a Worker binding. I resolve credentials from AWS CLI at startup and bridge them to Wrangler so I do not transcribe expiring three-value sets into per-project `.dev.vars`.

Because `--var` puts values on process arguments, compare `secrets.required` with current Wrangler too.

What looked like an AWS authentication problem was really a boundary problem between the host process and the Workers runtime.

See you next time.
