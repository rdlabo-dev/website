---
title: "API"
sourceRevision: "ad5e946a58fffa6bdf9c0b4b85e16a894eec1642ccf5558af74d05c5800d6fac"
---
* [`startWatchEvent()`](#startwatchevent)
* [`removeWatchEvent()`](#removewatchevent)
* [`addListener('userDidTakeScreenshot', ...)`](#addlisteneruserdidtakescreenshot-)
* [Interfaces](#interfaces)

<!--Update the source file JSDoc comments and rerun docgen to update the docs below-->

### startWatchEvent()

```typescript
startWatchEvent() => Promise<void>
```

--------------------

### removeWatchEvent()

```typescript
removeWatchEvent() => Promise<void>
```

--------------------

### addListener('userDidTakeScreenshot', ...)

```typescript
addListener(eventName: 'userDidTakeScreenshot', listenerFunc: () => void) => Promise<PluginListenerHandle>
```

| Paramètre              | Type                                 |
| ------------------ | ------------------------------------ |
| **`eventName`**    | <code>'userDidTakeScreenshot'</code> |
| **`listenerFunc`** | <code>() =&gt; void</code>           |

**Renvoie :** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

--------------------

### Interfaces

#### PluginListenerHandle

| Propriété         | Type                                      |
| ------------ | ----------------------------------------- |
| **`remove`** | <code>() =&gt; Promise&lt;void&gt;</code> |
