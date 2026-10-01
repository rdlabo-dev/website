---
title: "App-Ereignisse"
sourceRevision: "92118b9740e77979d9542bc5f63c871412067c2e3887dbc762ef4fdbca28468c"
---
# App-Ereignisse

Schließen Sie [Konfiguration](https://docs.rdlabo.dev/projects/capacitor-facebook-login/docs/configuration) ab, bevor Sie Facebook App Events protokollieren.

## Plattformverhalten

| Methode                             | Android                 | iOS       | Web       |
| ---------------------------------- | ----------------------- | --------- | --------- |
| `logEvent`                         | Unterstützt               | Unterstützt | Unterstützt |
| `setAutoLogAppEventsEnabled`       | Das Promise bleibt ausstehend | Unterstützt | Ohne Wirkung     |
| `setAdvertiserTrackingEnabled`     | Nicht implementiert         | Unterstützt | Ohne Wirkung     |
| `setAdvertiserIDCollectionEnabled` | Das Promise bleibt ausstehend | Unterstützt | Ohne Wirkung     |

## Ein Ereignis protokollieren

```ts
import { FacebookLogin } from '@capacitor-community/facebook-login';

await FacebookLogin.logEvent({
  eventName: 'completed_tutorial',
  parameters: {
    content_name: 'Getting Started',
    step: 3,
  },
});
```

Parameterwerte müssen Zeichenfolgen oder Zahlen sein. Andere Werttypen gehören nicht zur öffentlichen API und werden von den nativen Implementierungen ignoriert.

## Automatische Ereignisse und Einstellungen für Werbetreibende

Diese Einstellungen können unter iOS abgewartet werden:

```ts
await FacebookLogin.setAutoLogAppEventsEnabled({ enabled: true });
await FacebookLogin.setAdvertiserIDCollectionEnabled({ enabled: true });
await FacebookLogin.setAdvertiserTrackingEnabled({ enabled: true });
```

Fordern Sie die App-Tracking-Transparency-Berechtigung separat an, bevor Sie Werbetreibenden-Tracking aktivieren, sofern Ihre iOS-Anwendung dies benötigt.

Unter Android wenden `setAutoLogAppEventsEnabled` und `setAdvertiserIDCollectionEnabled` den angeforderten Wert an, ihre zurückgegebenen Promises bleiben derzeit jedoch ausstehend. `setAdvertiserTrackingEnabled` ist unter Android nicht implementiert. Alle drei Methoden haben im Web keine Wirkung.
