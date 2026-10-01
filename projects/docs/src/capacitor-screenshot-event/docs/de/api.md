---
title: "API"
sourceRevision: "ad5e946a58fffa6bdf9c0b4b85e16a894eec1642ccf5558af74d05c5800d6fac"
---
* [`startWatchEvent()`](#startwatchevent)
* [`removeWatchEvent()`](#removewatchevent)
* [`addListener('userDidTakeScreenshot', ...)`](#addlisteneruserdidtakescreenshot-)
* [Schnittstellen](#interfaces)

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

| Parameter              | Typ                                 |
| ------------------ | ------------------------------------ |
| **`eventName`**    | <code>'userDidTakeScreenshot'</code> |
| **`listenerFunc`** | <code>() =&gt; void</code>           |

**Rückgabe:** <code>Promise&lt;<a href="#pluginlistenerhandle">PluginListenerHandle</a>&gt;</code>

--------------------

### Schnittstellen

#### PluginListenerHandle

| Eigenschaft         | Typ                                      |
| ------------ | ----------------------------------------- |
| **`remove`** | <code>() =&gt; Promise&lt;void&gt;</code> |
