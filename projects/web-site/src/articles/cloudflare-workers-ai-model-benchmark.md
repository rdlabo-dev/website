---
title: "I Was Ready to Move Everything to OSS Models on Cloudflare Workers AI—Then the Benchmarks Said No"
description: "A production-shaped benchmark of seven OSS models on Workers AI against GPT-5.2, Gemini 3.5 Flash-Lite, and Claude Haiku 4.5 for schema compliance, latency, accuracy, and cost."
zennSlug: cloudflare-workers-ai-model-benchmark
emoji: "⏱️"
publishedDate: "2026-09-02"
originalUrl: "https://zenn.dev/rdlabo/articles/cloudflare-workers-ai-model-benchmark"
---

I went into this project thinking, “Let's move everything to OSS models on Workers AI!” My plan was to replace the generative AI used across all of our applications, including our food-label printing product, in one sweep.

What caught my attention were model IDs such as `@cf/openai/...` and `@cf/google/...`. I thought they meant I could run Cloudflare versions of each vendor's API right next to my Workers.

That was wishful thinking. Once I tested them, the story turned out to be much less straightforward.

## Conclusion: no full migration to OSS models on Workers AI

I reached the following decision.

| Target | Decision | Reason |
| --- | --- | --- |
| OSS models tested on Workers AI | Do not migrate | Schema mismatches, false positives, and long waits in a synchronous API |
| External commercial models | Continue using | They led this evaluation in both structured output and speed |

This is not an assessment of Workers AI as a whole. It is a decision about whether the seven OSS models I selected can serve our food-label printing use case.

## `@cf` does not mean “Cloudflare's version of each vendor's API”

`@cf/` is the prefix used to identify Workers AI models. It does not indicate additional training by Cloudflare or parity with a commercial API from the same developer.

Workers AI is a service that runs a curated catalog of OSS models serverlessly on Cloudflare's GPU infrastructure. In other words, `@cf/google/gemma-*` does not mean an equivalent of the Gemini API, and `@cf/openai/gpt-oss-*` does not mean an equivalent of the GPT API. See the [Workers AI overview](https://developers.cloudflare.com/workers-ai/) and [model catalog](https://developers.cloudflare.com/workers-ai/models/).

## Comparing models under real application conditions

### Models and migration requirements

I took these measurements on September 2, 2026. A live evaluation running on Node.js called each model sequentially through Cloudflare AI Gateway.

I compared our current OpenAI `gpt-5.2`, seven OSS models on Workers AI, Vertex AI `gemini-3.5-flash-lite`, and Anthropic `claude-haiku-4-5-20251001`. For the Workers AI models, the results table shows the complete `@cf/...` IDs actually called.

For Gemini, I chose the GA release of 3.5 Flash-Lite rather than the 2.5 family approaching retirement. I used the `global` endpoint with `thinkingLevel: minimal`; see the [model specification](https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/gemini/3-5-flash-lite). The official [model catalog](https://developers.cloudflare.com/workers-ai/models/) and [pricing page](https://developers.cloudflare.com/workers-ai/platform/pricing/) list Workers AI models and prices.

Before testing, I fixed three migration requirements:

1. Pass the existing JSON Schema without changing it
2. Maintain response speed comparable to the current model
3. Reduce inference cost

The evaluation used the same inputs and safeguards as the real application:

- A Japanese prompt for generating food labels
- The JSON Schema defined with Zod
- `temperature: 0` (Gemini 3.5 Flash-Lite uses its model default because it ignores custom values)
- A maximum output of 4,096 tokens
- The same deterministic allergen safety guard

### Four evaluation cases

The four representative cases were:

1. A baked confection containing multiple allergens
2. A prepared dish containing shrimp, milk, and wheat
3. Jam containing no mandatory allergens
4. A salad requiring detection of egg from mayonnaise

I checked all of the following, not merely whether a model returned JSON:

- Whether the output conformed to the JSON Schema
- Whether any required fields were missing
- Whether the output matched the expected set of mandatory allergens
- Whether the output contained false positives
- Response time
- Input and output token counts
- Estimated cost based on measured tokens and published prices

:::message
The latency figures are measurements from a small number of runs for each model. They are not rigorous p50 or p95 values; treat them as an initial benchmark for deciding whether to proceed with a migration. Results vary with model load and region.
:::

:::details Appendix: complete reproduction steps and evaluation code

This appendix is for readers who want to reproduce the evaluation. It includes every environment variable, dependency version, evaluation script, and command used for the food-label benchmark. You can continue with the main article without opening it.

### 1. Prepare Cloudflare

1. Create an AI Gateway in the Cloudflare Dashboard
2. Create an API Token with `Workers AI: Read` permission for the target account
3. Enable billing if you want to test models that require Workers Paid

See the Cloudflare [AI REST API documentation](https://developers.cloudflare.com/ai-gateway/usage/rest-api/) for authentication requirements. A Token with only AI Gateway management permission cannot call `/accounts/{account_id}/ai/*`.

```bash
export CLOUDFLARE_ACCOUNT_ID='your-account-id'
export CLOUDFLARE_API_TOKEN='your-workers-ai-token'
export AI_GATEWAY_NAME='your-gateway-id'
```

To reproduce the Vertex AI results as well, prepare a service account JSON file from a GCP project with the Vertex AI API enabled.

```bash
export GOOGLE_APPLICATION_CREDENTIALS="$PWD/service-account.json"
export GOOGLE_VERTEX_LOCATION='global'
export ANTHROPIC_API_KEY='your-anthropic-api-key'
# AI Gatewayを認証ありで運用している場合だけ設定
export CF_AIG_TOKEN='your-ai-gateway-token'
```

Do not commit service account JSON files or API Keys to Git. The Vertex and Anthropic requests also use Cloudflare's provider-native endpoints. See the documentation for [Vertex](https://developers.cloudflare.com/ai-gateway/usage/providers/vertex/) and [Anthropic](https://developers.cloudflare.com/ai-gateway/usage/providers/anthropic/).

### 2. Pin the dependencies

The measurements used Node.js v24. Create an empty working directory and save the following as `package.json`.

```json
{
  "type": "module",
  "dependencies": {
    "@ai-sdk/anthropic": "3.0.94",
    "@ai-sdk/google-vertex": "4.0.157",
    "@ai-sdk/openai": "3.0.81",
    "ai": "6.0.220",
    "zod": "4.5.4"
  },
  "devDependencies": {
    "tsx": "4.23.0"
  }
}
```

```bash
npm install
```

### 3. Add the evaluation script

Save the following as `benchmark.mts`. It includes the model IDs, prices, four cases, JSON Schema, prompt, cost calculation, and Neurons collection used for the article's comparison.

#### benchmark.mts (full listing)

```ts
import { createAnthropic } from "@ai-sdk/anthropic";
import { createVertex } from "@ai-sdk/google-vertex/edge";
import { createOpenAI } from "@ai-sdk/openai";
import { generateText, Output } from "ai";
import { readFileSync } from "node:fs";
import { z } from "zod";

const { CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_API_TOKEN, AI_GATEWAY_NAME } =
  process.env;
if (!CLOUDFLARE_ACCOUNT_ID || !CLOUDFLARE_API_TOKEN || !AI_GATEWAY_NAME) {
  throw new Error("Cloudflareの3環境変数が必要です");
}

const PRICING = {
  "gpt-5.2": { input: 1.75, output: 14.0 },
  "@cf/openai/gpt-oss-120b": { input: 0.35, output: 0.75 },
  "@cf/openai/gpt-oss-20b": { input: 0.2, output: 0.3 },
  "@cf/qwen/qwen3-30b-a3b-fp8": { input: 0.051, output: 0.335 },
  "@cf/zai-org/glm-4.7-flash": { input: 0.06, output: 0.4 },
  "@cf/zai-org/glm-5.3-flash": { input: 0.15, output: 0.5 },
  "@cf/google/gemma-4-26b-a4b-it": { input: 0.1, output: 0.3 },
  "@cf/moonshotai/kimi-k2.6": { input: 0.95, output: 4.0 },
  "vertex@gemini-3.5-flash-lite": { input: 0.3, output: 2.5 },
  "claude@claude-haiku-4-5-20251001": { input: 1, output: 5 },
} as const;

type ModelId = keyof typeof PRICING;
const modelId = (process.env.MODEL_ID ||
  "@cf/qwen/qwen3-30b-a3b-fp8") as ModelId;
if (!PRICING[modelId]) throw new Error(`未登録モデル: ${modelId}`);

const schema = z.object({
  productName: z.string(),
  categoryName: z.string(),
  ingredients: z.string(),
  detectedAllergens: z.array(z.string()),
});

const cases = [
  {
    name: "パウンドケーキ",
    recipe:
      "薄力粉100g、バター100g、砂糖80g、卵2個、ベーキングパウダー小さじ1を混ぜて焼く。",
    expected: ["小麦", "卵", "乳"],
  },
  {
    name: "えびグラタン",
    recipe:
      "えび、玉ねぎ、マカロニをバターで炒め、小麦粉と牛乳でホワイトソースを作りチーズをのせて焼く。",
    expected: ["えび", "乳", "小麦"],
  },
  {
    name: "いちごジャム",
    recipe: "いちご500g、砂糖250g、レモン果汁大さじ1を煮詰める。",
    expected: [],
  },
  {
    name: "ポテトサラダ",
    recipe:
      "じゃがいも、にんじん、きゅうり、ハムを茹でて、マヨネーズと塩こしょうで和える。",
    expected: ["卵"],
  },
] as const;

const allergens = [
  "えび",
  "かに",
  "くるみ",
  "小麦",
  "そば",
  "卵",
  "乳",
  "落花生",
] as const;
const variants: Record<(typeof allergens)[number], RegExp> = {
  えび: /えび|エビ|海老/,
  かに: /かに|カニ|蟹/,
  くるみ: /くるみ|クルミ|胡桃/,
  小麦: /小麦|薄力粉|マカロニ|しょうゆ|醤油|パン粉|グルテン/,
  そば: /そば|ソバ|蕎麦/,
  卵: /卵|たまご|玉子|鶏卵|マヨネーズ/,
  乳: /乳|牛乳|バター|チーズ|ミルク|クリーム/,
  落花生: /落花生|ピーナッツ|ピーナツ/,
};

const detect = (text: string): string[] =>
  allergens.filter((a) => variants[a].test(text));
const canonical = (value: string): string | undefined =>
  allergens.find((a) => variants[a].test(value));
const asSet = (values: readonly string[]): Set<string> =>
  new Set(values.map(canonical).filter((v): v is string => Boolean(v)));
const equalSet = (a: Set<string>, b: Set<string>): boolean =>
  a.size === b.size && [...a].every((v) => b.has(v));

const annotation = (a: string): string => (a === "乳" ? "乳成分" : a);
const buildPrompt = (
  recipe: string,
  required: string[],
): string => `あなたは食品表示法の専門家。日本の食品表示法に基づき、以下のレシピから、食品表示ラベルに必要な情報を生成せよ。

# レシピ
${recipe}

# 【決定論検知】レシピに含まれる義務アレルゲン（必ず反映）
- 「${required.map(annotation).join("・")}」がレシピから検出されました。該当原材料に「（〇〇を含む）」注記を付け、detectedAllergens にも必ず含めてください（名称から読み取れない原材料由来＝しょうゆ→小麦・バター→乳成分・マヨネーズ→卵 等の取りこぼしに注意）。

# 生成ルール
1. productName: レシピから適切な商品名を生成。シンプルで分かりやすい名前にする。
2. categoryName: 食品表示法に基づく正式な食品分類名（例：惣菜、菓子、調理パン、弁当、漬物、佃煮、煮豆、調味料、ジャム類など）
3. ingredients::
  - 重量の多い順に記載（レシピの分量から推測）
  - アレルゲンは「（〇〇を含む）」形式で表示（義務8品目のみ。推奨品目は付けない）。一括表記に統一（例: 末尾に「（一部に小麦・乳成分・卵を含む）」をまとめて記載）。個別と一括の併用は不可。
  - 添加物は「/」で区切って記載
  - 一般的な名称を使用（例：「グラニュー糖」→「砂糖」、「薄力粉」→「小麦粉」）
4. detectedAllergens: レシピに含まれる義務8品目（特定原材料）のうち該当するものだけを配列で返す（推奨品目は含めない）

## アレルゲン（検出・注記は義務8品目のみ・推奨は出力しない）: えび、かに、くるみ、小麦、そば、卵、乳、落花生（ピーナッツ）
- detectedAllergens は義務品目名を格納。注記の「乳」は「乳成分」。味噌・豆乳・大豆は小麦ではない（誤検出注意）。

# 返却値: productName(商品名) / categoryName(名称) / ingredients(原材料名・重量順・アレルゲン注記含む) / detectedAllergens(配列)`;

type Usage = { input: number; output: number; neurons: number };
const usageQueue: Usage[] = [];
const workersAI = createOpenAI({
  apiKey: CLOUDFLARE_API_TOKEN,
  baseURL: `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/ai/v1`,
  headers: { "cf-aig-gateway-id": AI_GATEWAY_NAME },
  name: "workers-ai",
  fetch: async (input, init) => {
    const response = await fetch(input, init);
    const body = (await response
      .clone()
      .json()
      .catch(() => null)) as {
      usage?: {
        prompt_tokens?: number;
        completion_tokens?: number;
        neurons?: number;
      };
    } | null;
    if (body?.usage) {
      usageQueue.push({
        input: body.usage.prompt_tokens || 0,
        output: body.usage.completion_tokens || 0,
        neurons: body.usage.neurons || 0,
      });
    }
    return response;
  },
});

const isVertex = modelId === "vertex@gemini-3.5-flash-lite";
const isClaude = modelId === "claude@claude-haiku-4-5-20251001";
const isOpenAI = modelId === "gpt-5.2";
const vertexLocation = process.env.GOOGLE_VERTEX_LOCATION || "global";
const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
const serviceAccount =
  isVertex && serviceAccountPath
    ? (JSON.parse(readFileSync(serviceAccountPath, "utf8")) as {
        project_id: string;
        client_email: string;
        private_key: string;
        private_key_id?: string;
      })
    : undefined;
if (isVertex && !serviceAccount) {
  throw new Error("VertexにはGOOGLE_APPLICATION_CREDENTIALSが必要です");
}
const vertex = serviceAccount
  ? createVertex({
      project: serviceAccount.project_id,
      location: vertexLocation,
      googleCredentials: {
        clientEmail: serviceAccount.client_email,
        privateKey: serviceAccount.private_key,
        privateKeyId: serviceAccount.private_key_id,
      },
      headers: process.env.CF_AIG_TOKEN
        ? { "cf-aig-authorization": `Bearer ${process.env.CF_AIG_TOKEN}` }
        : undefined,
      // 実測と同じくCloudflare AI Gatewayのprovider-native endpointを通す
      baseURL:
        `https://gateway.ai.cloudflare.com/v1/${CLOUDFLARE_ACCOUNT_ID}/` +
        `${AI_GATEWAY_NAME}/google-vertex-ai/v1/projects/${serviceAccount.project_id}/` +
        `locations/${vertexLocation}/publishers/google`,
    })
  : undefined;

if (isClaude && !process.env.ANTHROPIC_API_KEY) {
  throw new Error("ClaudeにはANTHROPIC_API_KEYが必要です");
}
const claude = isClaude
  ? createAnthropic({
      apiKey: process.env.ANTHROPIC_API_KEY!,
      headers: process.env.CF_AIG_TOKEN
        ? { "cf-aig-authorization": `Bearer ${process.env.CF_AIG_TOKEN}` }
        : undefined,
      baseURL:
        `https://gateway.ai.cloudflare.com/v1/${CLOUDFLARE_ACCOUNT_ID}/` +
        `${AI_GATEWAY_NAME}/anthropic`,
    })
  : undefined;

if (isOpenAI && !process.env.OPENAI_API_KEY) {
  throw new Error("gpt-5.2にはOPENAI_API_KEYが必要です");
}
const openai = isOpenAI
  ? createOpenAI({
      apiKey: process.env.OPENAI_API_KEY!,
      baseURL:
        `https://gateway.ai.cloudflare.com/v1/${CLOUDFLARE_ACCOUNT_ID}/` +
        `${AI_GATEWAY_NAME}/openai`,
    })
  : undefined;

let totalInput = 0;
let totalOutput = 0;
let totalNeurons = 0;
const started = performance.now();

for (const testCase of cases.slice(
  0,
  Number(process.env.CASE_LIMIT || cases.length),
)) {
  const required = detect(testCase.recipe);
  const caseStarted = performance.now();
  try {
    const result = await generateText({
      model: isVertex
        ? vertex!("gemini-3.5-flash-lite")
        : isClaude
          ? claude!("claude-haiku-4-5-20251001")
          : isOpenAI
            ? openai!.chat("gpt-5.2")
            : workersAI.chat(modelId),
      prompt: buildPrompt(testCase.recipe, required),
      output: Output.object({ schema }),
      temperature: 0,
      maxOutputTokens: 4096,
      maxRetries: 1,
      providerOptions: isVertex
        ? {
            google: {
              thinkingConfig: { thinkingLevel: "minimal" },
            },
          }
        : isOpenAI
          ? { openai: { reasoningEffort: "none" } }
          : undefined,
    });
    const parsed = result.output;
    // 本番と同じ考え方の決定論ガード:
    // 生成ingredientsまたは元レシピに根拠がある義務品目だけ残し、
    // ingredientsから確実に読める品目はモデル出力に和集合する。
    const supported = new Set([...detect(parsed.ingredients), ...required]);
    const guarded = parsed.detectedAllergens
      .map(canonical)
      .filter((a): a is string => Boolean(a) && supported.has(a));
    for (const a of detect(parsed.ingredients)) guarded.push(a);
    const actual = new Set(guarded);
    const expected = asSet(testCase.expected);
    const usage = usageQueue.shift() || {
      input: result.usage.inputTokens || 0,
      output: result.usage.outputTokens || 0,
      neurons: 0,
    };
    totalInput += usage.input;
    totalOutput += usage.output;
    totalNeurons += usage.neurons;
    console.log(
      JSON.stringify({
        case: testCase.name,
        ok: equalSet(actual, expected) && parsed.categoryName.length > 0,
        expected: [...expected],
        actual: [...actual],
        durationMs: Math.round(performance.now() - caseStarted),
        usage,
      }),
    );
  } catch (error) {
    console.error(
      JSON.stringify({
        case: testCase.name,
        ok: false,
        durationMs: Math.round(performance.now() - caseStarted),
        error: error instanceof Error ? error.message : String(error),
      }),
    );
    process.exitCode = 1;
    break;
  }
}

const price = PRICING[modelId];
console.log(
  JSON.stringify({
    model: modelId,
    durationMs: Math.round(performance.now() - started),
    inputTokens: totalInput,
    outputTokens: totalOutput,
    neurons: totalNeurons,
    estimatedUsd:
      (totalInput * price.input + totalOutput * price.output) / 1_000_000,
  }),
);
```

### 4. Run every model sequentially

Run the models sequentially, not in parallel, so concurrency does not distort the speed comparison.

```bash
for MODEL_ID in \
  '@cf/openai/gpt-oss-120b' \
  '@cf/openai/gpt-oss-20b' \
  '@cf/qwen/qwen3-30b-a3b-fp8' \
  '@cf/zai-org/glm-4.7-flash' \
  '@cf/zai-org/glm-5.3-flash' \
  '@cf/google/gemma-4-26b-a4b-it' \
  '@cf/moonshotai/kimi-k2.6' \
  'vertex@gemini-3.5-flash-lite' \
  'claude@claude-haiku-4-5-20251001'
do
  MODEL_ID="$MODEL_ID" npx tsx benchmark.mts
done
```

For repeated measurements, add an outer `seq` loop and save JSON Lines.

```bash
for RUN in $(seq 1 5); do
  MODEL_ID='@cf/qwen/qwen3-30b-a3b-fp8' \
    npx tsx benchmark.mts 2>&1 | tee -a qwen-results.jsonl
done
```

This format lets readers repeat the measurements at the same time, in another region, or after a model update—and potentially disprove the article's results.

### 5. Call the OpenAI-compatible endpoint

New Cloudflare integrations can use the AI REST API's OpenAI-compatible endpoint. Specify a model ID beginning with `@cf/` for a Workers AI model.

```ts
import { createOpenAI } from "@ai-sdk/openai";

const workersAI = createOpenAI({
  apiKey: process.env.CLOUDFLARE_API_TOKEN,
  baseURL:
    `https://api.cloudflare.com/client/v4/accounts/` +
    `${process.env.CLOUDFLARE_ACCOUNT_ID}/ai/v1`,
  headers: {
    "cf-aig-gateway-id": process.env.AI_GATEWAY_NAME!,
  },
  name: "workers-ai",
});

const model = workersAI.chat("@cf/qwen/qwen3-30b-a3b-fp8");
```

I call `chat()` explicitly here. When using the provider's default Responses API path, the combination of the SDK version I tested and Cloudflare reported usage as zero. The Chat Completions path let me obtain `prompt_tokens`, `completion_tokens`, and `neurons` from the raw response.

Structured output passes the existing Zod Schema to Vercel AI SDK's `Output.object()`.

```ts
const result = await generateText({
  model,
  prompt,
  output: Output.object({ schema }),
  temperature: 0,
  maxOutputTokens: 4096,
  maxRetries: 1,
});
```

#### Reproduce the current gpt-5.2 baseline

I called the current model through the same AI Gateway using the OpenAI API. Unlike Cloudflare-hosted models, it requires an OpenAI API Key. The `benchmark.mts` above includes selection of `gpt-5.2`, time measurement, token usage, and estimated cost output.

```bash
export OPENAI_API_KEY='your-openai-api-key'
CASE_LIMIT=1 MODEL_ID='gpt-5.2' npx tsx benchmark.mts
```

`CASE_LIMIT=1` runs only the first case, matching the table. The final JSON object's `durationMs`, `inputTokens`, `outputTokens`, and `estimatedUsd` correspond to the baseline values in the article.

The comparison explicitly sets `reasoningEffort: 'none'`. Be aware that using the default or `low` changes both the output-token count and the speed, producing a different test condition.

:::

## Results across all models

| Category | Model | Evaluations | Result | Response time | Estimated cost (measured tokens × published price) |
| --- | --- | ---: | --- | --- | ---: |
| External commercial (OpenAI) | `gpt-5.2` | 1 | 1/1 passed | 4.64 s | $0.002392/case |
| External commercial (Vertex AI) | `gemini-3.5-flash-lite` | 20 | 20/20 passed | Median 6.93 s for four cases | $0.000405/case |
| External commercial (Anthropic) | `claude-haiku-4-5-20251001` | 20 | 20/20 passed | Median 6.21 s for four cases | $0.001473/case |
| Workers AI (OSS) | `@cf/openai/gpt-oss-120b` | 4 | 4/4 passed | 60.68 s for four cases | $0.001005/case |
| Workers AI (OSS) | `@cf/openai/gpt-oss-20b` | 1 | Schema mismatch | Failed after 8.3 s | — |
| Workers AI (OSS) | `@cf/qwen/qwen3-30b-a3b-fp8` | 4 | 4/4 passed | 89.38 s for four cases | $0.000728/case |
| Workers AI (OSS) | `@cf/zai-org/glm-4.7-flash` | Up to 4 | Output failed partway through | Failed request took up to 148.9 s | — |
| Workers AI (OSS) | `@cf/zai-org/glm-5.3-flash` | 1 | Output failed | Failed after 76.1 s | — |
| Workers AI (OSS) | `@cf/google/gemma-4-26b-a4b-it` | 4 | One false positive | 83.56 s for four cases | — |
| Workers AI (OSS) | `@cf/moonshotai/kimi-k2.6` | 1 | Output failed | Failed after 118.5 s | — |

Only Vertex AI `gemini-3.5-flash-lite` and Anthropic `claude-haiku-4-5-20251001` share the same repeated-test conditions in this table. The OSS models on Workers AI received a single screening pass to narrow down migration candidates, while OpenAI `gpt-5.2` ran only the first case. Differences between those rows must not be treated as general speed multipliers or savings percentages between models.

Even so, the screening was sufficient to decide which candidates should advance to repeated evaluation. The OSS models I tried on Workers AI were not merely “a little slower in exchange for being cheaper.” They either failed to produce structured output or, when they succeeded, took 60 or 89 seconds for four cases. Those numbers are difficult to put directly behind a synchronous API while a user waits at the screen.

:::details Raw logs before rounding

The following line aggregates the four successful cases from `@cf/qwen/qwen3-30b-a3b-fp8`. These are the original values before rounding for display in the article.

```json
{
  "model": "@cf/qwen/qwen3-30b-a3b-fp8",
  "cases": 4,
  "durationMs": 89377,
  "inputTokens": 2434,
  "outputTokens": 8325,
  "neurons": 264.9587001800537,
  "estimatedUsd": 0.002913009
}
```

Here is the aggregate for the four `@cf/openai/gpt-oss-120b` cases.

```json
{
  "model": "@cf/openai/gpt-oss-120b",
  "cases": 4,
  "durationMs": 60675,
  "inputTokens": 2801,
  "outputTokens": 4052,
  "neurons": 365.39485931396484,
  "estimatedUsd": 0.00401935
}
```

This is a direct comparison of the same first case.

```json
{"model":"@cf/openai/gpt-oss-120b","cases":1,"durationMs":17041,"inputTokens":735,"outputTokens":1054,"neurons":95.24984741210938,"estimatedUsd":0.00104775}
{"model":"gpt-5.2","cases":1,"durationMs":4643,"inputTokens":727,"outputTokens":80,"estimatedUsd":0.00239225}
```

The failures are included as well.

```text
@cf/openai/gpt-oss-20b
8294ms: No object generated: response did not match schema.
実際のcontent: -1.1

@cf/zai-org/glm-4.7-flash
148888ms: No output generated.

@cf/zai-org/glm-5.3-flash
76136ms: No output generated.

@cf/google/gemma-4-26b-a4b-it
83561ms: ポテトサラダ expected=["卵"] actual=["小麦","卵"]

@cf/moonshotai/kimi-k2.6
118519ms: No output generated.
```

:::

### Measuring the two external models across 20 cases each

For each model, I started a fresh process for every run and executed the four cases five times, for a total of 20 cases. Both models satisfied the Schema and expected allergen set in all 40 cases.

| Metric | Gemini 3.5 Flash-Lite | Claude Haiku 4.5 |
| --- | ---: | ---: |
| Range for four cases | 6.293–7.453 s | 5.883–6.760 s |
| Median for four cases | 6.933 s | 6.211 s |
| Mean for four cases | 6.896 s | 6.269 s |
| Median first request per process | 2.172 s | 1.757 s |
| Median subsequent request | 1.529 s | 1.351 s |
| Subsequent-request p90 | 1.824 s | 1.839 s |
| Mean estimated cost per case | $0.000405 | $0.001473 |
| Passed | 20/20 | 20/20 |

:::details Raw logs from five Gemini and Claude runs

These are the five Gemini 3.5 Flash-Lite runs.

```json
{"durationMs":7453,"inputTokens":2538,"outputTokens":331,"estimatedUsd":0.0015889,"caseDurations":[3009,1825,1163,1454]}
{"durationMs":6933,"inputTokens":2538,"outputTokens":342,"estimatedUsd":0.0016164,"caseDurations":[2478,1529,1298,1627]}
{"durationMs":7202,"inputTokens":2538,"outputTokens":339,"estimatedUsd":0.0016089,"caseDurations":[2172,1796,1408,1824]}
{"durationMs":6293,"inputTokens":2538,"outputTokens":364,"estimatedUsd":0.0016714,"caseDurations":[1883,1590,1201,1617]}
{"durationMs":6598,"inputTokens":2538,"outputTokens":340,"estimatedUsd":0.0016114,"caseDurations":[2021,1381,1455,1739]}
```

These are the five Claude Haiku 4.5 runs.

```json
{"durationMs":6760,"inputTokens":4181,"outputTokens":337,"estimatedUsd":0.005866,"caseDurations":[2388,1811,1246,1314]}
{"durationMs":5957,"inputTokens":4181,"outputTokens":350,"estimatedUsd":0.005931,"caseDurations":[1757,1766,1033,1399]}
{"durationMs":5883,"inputTokens":4181,"outputTokens":339,"estimatedUsd":0.005876,"caseDurations":[1714,1671,1147,1349]}
{"durationMs":6536,"inputTokens":4181,"outputTokens":336,"estimatedUsd":0.005861,"caseDurations":[1845,2027,1312,1351]}
{"durationMs":6211,"inputTokens":4181,"outputTokens":347,"estimatedUsd":0.005916,"caseDurations":[1692,1839,1259,1420]}
```

:::

Gemini used the `global` endpoint with `thinkingLevel: minimal`; Claude used the Anthropic API. Both passed through AI Gateway. I measured only the model calls, excluding SDK initialization and secret retrieval. Because the first and subsequent requests used different recipes, I do not label them `cold` and `warm`.

Across the same four cases repeated five times, Claude's median total was about 10.4% faster, while Gemini's estimated cost per case was about 72.5% lower. Gemini's published prices are `$0.30/M` input and `$2.50/M` output on the [Google Cloud pricing page](https://cloud.google.com/gemini-enterprise-agent-platform/generative-ai/pricing); Claude's are `$1/M` input and `$5/M` output on the [Anthropic pricing page](https://platform.claude.com/docs/en/about-claude/pricing).

## What the results revealed

### External commercial models were still stronger

In this evaluation, the external commercial models had no structured-output failures. In particular, Vertex AI `gemini-3.5-flash-lite` and Anthropic `claude-haiku-4-5-20251001` passed all 20 cases. OpenAI `gpt-5.2` also passed the first case, although one run is not enough to compare reliability.

Gemini and Claude both completed four cases in a median of about six seconds. The OSS models tested on Workers AI produced structured-output failures and a false positive, while the two models that passed all four cases took 60.68 and 89.38 seconds in total. Within this use case, configuration, and measurement scope, the external commercial models I tested met the migration requirements more successfully.

### A model name and compatibility table are not enough

`@cf/openai/gpt-oss-20b` responded faster than `@cf/openai/gpt-oss-120b`, but it did not return a JSON object and failed Schema validation.

Likewise, `@cf/zai-org/glm-4.7-flash`, `@cf/zai-org/glm-5.3-flash`, and `@cf/moonshotai/kimi-k2.6` waited for tens of seconds—or almost two minutes—before producing “no structured output.” Model size and a name such as `Flash` do not tell you how long an application will actually wait.

For one case, `@cf/qwen/qwen3-30b-a3b-fp8` used 1,670 output tokens for 644 input tokens. Our current OpenAI `gpt-5.2` used 80 output tokens for 727 input tokens. Even with a low token price, a large increase in inference tokens increases latency.

A model catalog may claim structured output or JSON Mode support without guaranteeing that the model will satisfy a real business Schema on every request. Cloudflare's [JSON Mode documentation](https://developers.cloudflare.com/workers-ai/features/json-mode/) also notes that Schema compliance may not always be guaranteed.

`@cf/zai-org/glm-4.7-flash` and `@cf/google/gemma-4-26b-a4b-it` passed the first case but failed when the evaluation expanded to all four.

- `@cf/zai-org/glm-4.7-flash`: failed to generate structured output for one case
- `@cf/google/gemma-4-26b-a4b-it`: falsely detected unsupported “wheat” in a salad containing mayonnaise

Passing a single case is not enough to establish compatibility.

## Conclusion: measure a model before adopting it

Our food-label printing product uses generative AI behind a synchronous API. Returning JSON that matches the Schema is not enough; the model must also respond within a time a user can reasonably wait. The OSS models I tested on Workers AI did not meet those requirements.

That does not make them unsuitable everywhere. We have adopted one in a different product that runs asynchronously, where we determined that longer processing time was acceptable. Ultimately, each use case needs its own balance of cost, speed, and accuracy.

Until next time.
