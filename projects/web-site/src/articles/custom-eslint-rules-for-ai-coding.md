---
title: "Why You Should Write Custom ESLint Rules — Generic Rules Won't Tame AI Coding"
description: "When AI writes your code, generic ESLint rules are not enough. Custom rules turn repeated review comments into CI guardrails that enforce your project's architecture and error-handling style."
zennSlug: custom-eslint-rules-for-ai-coding
emoji: "🚧"
---

The short answer: if you have AI generate code, you should write custom ESLint rules.

Generic ESLint rules stop accidents that are common across many projects. But they cannot know project-specific rules like "do not put non-lifecycle methods on Components."

What I want AI to follow is not just language correctness, but how I write code in this project.

I felt that most acutely when I asked AI to fix code where an error was occurring. The code it returned wrapped the entire operation in `try-catch`.

The error went away. More precisely, it became invisible.

Even when I wrote "do not wrap everything in try-catch" in the prompt, the next task would wrap it again. So I stopped asking. I wrote a custom ESLint rule that fails CI on violation.

And now I can have AI write those rules too. The volume of code being written has gone up, while the cost of building guardrails has gone down. There is no reason for a human to repeat the same review comment.

# AI hid errors in try-catch, so I stopped it with a rule

When I asked AI to fix something, this pattern came back often:

```ts
// ❌ Wrap the entire operation in try-catch
async save(): Promise<void> {
  try {
    await this.api.update(this.form.value);
    await this.reload();
    this.saved.set(true);
  } catch (error) {
    this.errorHandler.capture(error);
    throw error;
  }
}
```

To be clear upfront: using `try-catch` for async work is not wrong in itself. Catching a rejected Promise from `await` is valid JavaScript.

The problem was that large `try` blocks and catch-and-log kept appearing in my project, blurring where failure responsibility belongs. I want Promises to reject upward by default, and to limit where they are caught.

If I were writing the same logic, I would want it shaped like this:

```ts
// ✅ The operation is the same, but this form is preferred
save(): Promise<void> {
  return this.api
    .update(this.form.value)
    .then(() => this.reload())
    .then(() => this.saved.set(true))
    .catch((error) => {
      this.errorHandler.capture(error);
      throw error;
    });
}
```

On the other hand, I use `try-catch` for small synchronous boundaries where exceptions can occur:

```ts
// ✅ Keep only the synchronous-exception boundary small
parse(value: string): Settings | undefined {
  try {
    return JSON.parse(value) as Settings;
  } catch {
    return undefined;
  }
}
```

To enforce this in-house policy, I created [`@rdlabo/rules/restrict-try-block`](https://github.com/rdlabo-dev/eslint-plugin-rules/blob/main/docs/rules/restrict-try-block.md). It blocks `await`, Promises, and RxJS work inside `try`[^typed-linting], limits `try` itself to three lines by default, and does not allow `try` inside Angular `computed()` or `effect()`.

At first I thought that was the end of it.

But once `try` could not contain Promises, code like `Promise.resolve().then(() => ...)` showed up. Fair enough — there is no `await`.

Clever. But that is not the point.

So I added bypasses via `Promise.resolve()` to the rule as well.

AI is not defying instructions. It is finding another solution that satisfies the given constraints. So I turn each workaround into a guardrail. Once it is a rule, I never repeat the same review.

# Going further: enforcing how code is written

`restrict-try-block` is a rule that stops processing I do not want written. One step further, ESLint can enforce architecture too.

If I ask AI to implement an Ionic Angular screen in the ordinary way, it puts state and logic on the Component.

```ts
// ❌ Correct for Angular, but not the form we want to write
@Component({ selector: 'app-foods', template: '' })
class FoodsPage {
  ionViewWillEnter(): void {
    this.reload();
  }

  reload(): void {}
  save(): void {}
}
```

It works even without implementing Ionic lifecycle interfaces, and the Component can have `reload()` and `save()` and still compile.

But the shape I want AI to write is this:

```ts
// ✅ Keep the Component focused on the view and lifecycle
@Component({ selector: 'app-foods', template: '' })
class FoodsPage implements ViewWillEnter {
  readonly vm = new ViewModel(this);

  ionViewWillEnter(): void {
    this.vm.reload();
  }
}

// ✅ Put state and behavior in the ViewModel
class ViewModel extends ViewModelStore<FoodsPage> {
  reload(): void {}
  save(): void {}
}
```

I enforce this with three rules.

First, [`require-viewmodel`](https://github.com/rdlabo-dev/eslint-plugin-rules/blob/main/docs/rules/require-viewmodel.md) defines where logic lives. Every `@Component` must have `new ViewModel(this)`, and ViewModels must extend `ViewModelStore<ComponentType>`. View-side APIs like `viewChild` and `computed` must not move into the ViewModel.

Next, [`implements-ionic-lifecycle`](https://github.com/rdlabo-dev/eslint-plugin-rules/blob/main/docs/rules/implements-ionic-lifecycle.md) labels the lifecycle methods that may remain on the Component. If you write `ionViewWillEnter()`, you must also `implements ViewWillEnter`.

Finally, [`no-component-method-except-lifecycle`](https://github.com/rdlabo-dev/eslint-plugin-rules/blob/main/docs/rules/no-component-method-except-lifecycle.md) shuts out ordinary methods[^component-method] beyond that. A Component that implements `ViewWillEnter` may write `ionViewWillEnter()`, but not `save()`. Logic goes to the ViewModel.

Create a place for logic. Label what may stay. Shut out everything else. That is the three-step structure.

Providing a ViewModel alone does not guarantee AI will put logic there. Instead of asking it to "use the ViewModel," I shape the terrain so ordinary methods must be written on the ViewModel.

This is not lint to detect bugs. It is lint that forces a design decision — "I split Component and ViewModel like this" — into actual code.

# Prompts are the manual; ESLint is the guardrail

A prompt is the manual that explains why to write something a certain way. ESLint is the guardrail you cannot cross even if you skip the manual.

Convey intent in prompts; guarantee outcomes with ESLint. Human review can go back from repeating the same style notes to thinking about specs and design.

Of course I do not put every preference into lint. I turn something into a rule only when all three hold:

1. The same comment keeps coming up
2. It can be judged mechanically from the AST
3. It is settled as a team design decision

Forcing design choices that depend on context into rules increases false positives and maintenance cost. I still look at those in human and AI review.

# The cost of writing rules dropped sharply with AI

I used to find "custom ESLint rule" heavy just to hear the phrase. Understand the AST, read the Rule API, write tests for happy and unhappy paths. Automating one review comment felt like a lot.

Now, if I test first, I can delegate quite a bit to AI.

1. Give AI the code that should pass and the code that should fail
2. Have it write `RuleTester` tests and a rule that satisfies them
3. Add tests for workarounds found in the real project

ESLint rules have clear input and output — "this code passes, this code fails" — so they pair well with AI.

I do not need a perfect rule usable by other companies from day one. Stopping the next landmine I am about to step on is enough.

# Summary: turn the next review comment into a rule

Generic ESLint rules are guardrails on the public highway. But there is not always a convenient guardrail where you crash repeatedly.

The people who know a project's accident sites best are the people building that project. So put up your own guardrails.

Next time you write the same review comment, save the before and after. Then have AI write the first `RuleTester` case.

Have the AI that writes code write rules that stop AI too. Custom rules do not start from a grand style guide; they start from that one case.

With the cost of writing rules this low, there is no reason for a human to repeat the same warning.

See you next time.

[^typed-linting]: Detecting Promise-like and RxJS types requires ESLint settings that use TypeScript type information, such as `projectService`. Without type information, `await`, `Promise.resolve()`, `try` inside Signals, and line count are still detected.
[^component-method]: What is forbidden is ordinary class methods. constructor, getter / setter, and properties are excluded; arrow-function fields are allowed.
