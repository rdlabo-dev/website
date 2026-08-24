---
title: "Angular 19.2: Experimental HTTP Resource and Response Streaming"
description: "Angular 19.2 adds experimental httpResource and response streaming—simpler async state with Signals, chat streaming, and untagged template literals."
zennSlug: 35e1d6ae8d8adf
emoji: "🌟"
---

:::message alert
This article was drafted by generative AI from https://www.youtube.com/watch?v=sGSKSh5yNIE as source material, then reviewed and edited by the author.
:::

:::message
These features are experimental. Consider carefully before using them in production.
:::

Angular 19.2 is out! The highlights are experimental **HTTP resource** and **response streaming**. Signal-based development keeps getting more convenient.


## HTTP resource makes async handling simpler

The **HTTP resource** re-released experimentally in Angular v19 is very handy. Loading, success, and error states for async work can be written much more simply with Signals.

Consider a component that shows a user profile. The traditional approach:

```typescript
@Component({
  selector: 'app-user-profile',
  template: `
    <div *ngIf="loading">Loading...</div>
    <div *ngIf="error">{{ error }}</div>
    <div *ngIf="user">
      <h2>{{ user.name }}</h2>
      <p>{{ user.email }}</p>
    </div>
  `
})
export class UserProfileComponent implements OnInit {
  user: User | null = null;
  loading = false;
  error: string | null = null;
  private http = inject(HttpClient);
  
  constructor() {}

  ngOnInit() {
    this.loading = true;
    this.http.get<User>('/api/user').pipe(
      finalize(() => this.loading = false)
    ).subscribe({
      next: (user) => this.user = user,
      error: (err) => this.error = err.message
    });
  }
}
```

With HTTP resource:

```typescript
@Component({
  selector: 'app-user-profile',
  template: `
    <div *ngIf="userResource.isLoading">Loading...</div>
    <div *ngIf="userResource.error">{{ userResource.error }}</div>
    <div *ngIf="userResource.hasValue">
      <h2>{{ userResource.value.name }}</h2>
      <p>{{ userResource.value.email }}</p>
    </div>
  `
})
export class UserProfileComponent {
  userResource = httpResource('/api/user');
}
```

Much simpler! Properties like `isLoading` and `hasValue` are provided as Signals, so template state management is easy.

## Response streaming for smarter real-time data

The other experimental feature, **response streaming**, is promising too. It should shine in chat apps and anything that updates data in real time.

For example, displaying messages in a chat app:

```typescript
@Component({
  selector: 'app-chat',
  template: `
    <div class="messages">
      <div *ngFor="let message of messagesResource.value">
        <div class="message">{{ message.text }}</div>
      </div>
    </div>
    <div *ngIf="messagesResource.isLoading">Loading messages...</div>
  `
})
export class ChatComponent {
  messagesResource = rxResource(
    inject(ChatService).getMessageStream()
  );
}
```

I no longer need to subscribe to Observables and manage state manually. I can write more declaratively with Signals.

## Template literal expressions supported too

Angular 19.2 also improves the in-template developer experience. Support for **untagged template literal expressions** makes expressions in templates more intuitive.

Traditional style:
```html
<div>{{ (user$ | async)?.name }}'s balance: {{ (balance$ | async) | currency }}</div>
```

New style:
```html
<div>${(user$ | async)?.name}'s balance: ${(balance$ | async) | currency}</div>
```

Personally, this is still experimental, so I want to wait before using it in production. Still, it feels like it could be very useful down the road.

## Summary

The new features in Angular 19.2—especially HTTP resource—feel quite practical, and I hope they stabilize soon. Signal-based development keeps evolving.

The Angular team is actively seeking feedback on these features. Checking GitHub RFCs and sharing opinions is worthwhile.

See you next time!
