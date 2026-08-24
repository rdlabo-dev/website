---
title: "Angular v20 Resources API Changes: Better Error Handling and a Cleaner API"
description: "Breaking changes ahead of Angular v20 Resources: value() throws on error, reload() on WritableResource only, request→params rename, and httpResource URL functions."
zennSlug: ff0bc7de29bd65
emoji: "👻"
---
This article summarizes how Angular Resources will change in the next release, based on GitHub discussion threads and related commits.

- [[Complete] Resource RFC 2: APIs #60121](https://github.com/angular/angular/discussions/60121)

- [b35396345cb48f9ce1e318d2c7f056eb6a7c9bb4](https://github.com/angular/angular/commit/b35396345cb48f9ce1e318d2c7f056eb6a7c9bb4)
- [905194fa57b048364b4c3a2333083888a43f77ca](https://github.com/angular/angular/commit/905194fa57b048364b4c3a2333083888a43f77ca)
- [05eb028c7ae670e60f651cdbecb14ee0d73552e9](https://github.com/angular/angular/commit/05eb028c7ae670e60f651cdbecb14ee0d73552e9)
- [07811ddd7d4f027e60cb33ecf341e8d1d5675a8a](https://github.com/angular/angular/commit/07811ddd7d4f027e60cb33ecf341e8d1d5675a8a)
- [d0c9a6401a388ae5cd2ca40439b48781ceff95ef](https://github.com/angular/angular/commit/d0c9a6401a388ae5cd2ca40439b48781ceff95ef)

Resources remain experimental and are expected to stay experimental through v20—more changes may follow.


# 1. Improved error handling

## Change in Resource.value() behavior

Previously, when a resource was in an error state, `resource.value()` returned `undefined`. In the new implementation, reading `resource.value()` while in an error state throws an exception.
You must handle errors explicitly.

__Previous behavior__: errors were hidden by default
```typescript
const res = resource({
  loader: () => fetch(...);
});

// Before (errors are hidden)
const inner = computed(() => res.value()?.inner);
```

__New behavior__: explicit error handling required
```typescript
const res = resource({
  loader: () => fetch(...);

  // Option 1: Return defaultValue (initially undefined) instead of Errors
  throwErrorsFromValue: false,
});

// Option 2: Handle the error
const inner = computed(() => {
  if (res.error()) return undefined;
  return res.value()?.inner;
});
```


## Error handling in templates

The same applies in HTML templates. If you used `resource.value()` as optional, check errors—not just `isLoading`.

```html
@if (res.isLoading()) {
  <!-- Content while loading -->
} @else if (res.error()) {
  <!-- Content on error -->
} @else {
  <!-- Content on success -->
}
```

Details:

- Reloading while in an error state sets `hasValue()` to `true` and `value()` returns `defaultValue`
- When a new value loads successfully, `error()` becomes `undefined`

## Clearer Resource.error typing

`Resource.error` changes from `unknown` to `Error | undefined`, enabling type-safe error handling.

```typescript
const error = resource.error();
if (error instanceof Error) {
  // Type-safe access to error.message and other properties
}
```

Type guards make error handling easier. Also, values thrown that are not `Error` instances are wrapped in `ResourceWrappedError` for consistent handling.

```typescript
if (resource.error() instanceof ResourceWrappedError) {
  const original = resource.error().cause;
  // original can be an API error object, for example
}
```

https://github.com/angular/angular/blob/d3e9ca1162a0d72e78708fcce5644b9b25e4d487/packages/core/src/resource/resource.ts#L469-L478

# 2. reload() moved

`reload()` is available only on `WritableResource`, separating "reloadable resources" from read-only resources.

```typescript
const res = resource<Data>({
  loader: () => fetch(...), 
});

// It is a WritableResource, so the `reload` method is available
res.reload();

// It is not Writable, so the `reload` method is unavailable
res.asReadonly();
res.reload(); // NG
```

# 3. Parameter rename

`request` becomes `params` for clearer intent.

```typescript
// Before
const res = resource<User>({
  request: () => ({id: userId()}),
  loader: ({request}) => {
    return this.http.get<User>(`/api/users/${request.id}`);
  }
});

// After
const res = resource<User>({
  params: () => ({id: userId()}),
  loader: ({params}) => {
    return this.http.get<User>(`/api/users/${params.id}`);
  }
});
```

`httpResource` also takes a function instead of a static URL.

```typescript
const userId = signal(1);
const res = httpResource<User>(() => `/api/users/${userId()}`);
```

# Summary

There is more—for example, `map` in `httpResource` was renamed to `parse`—but I hope this helps you anticipate changes before release.

> The Resource story in Angular is just starting and will be evolving. To reflect this, the resource APIs will remain experimental in Angular v20. We will persuade the stabilization process and embark on designing additional APIs and functionality in the subsequent releases. Your continued feedback is crucial: play with Angular v20, build on top of it and open GitHub issues for any problems or enhancements that should be considered.[from discussioncomment-12654043](https://github.com/angular/angular/discussions/60121#discussioncomment-12654043)

I look forward to Resources becoming safer and easier to use.

See you next time.
