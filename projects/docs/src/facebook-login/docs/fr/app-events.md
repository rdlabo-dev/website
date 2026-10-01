---
title: "Événements de l’application"
sourceRevision: "92118b9740e77979d9542bc5f63c871412067c2e3887dbc762ef4fdbca28468c"
---
# Événements de l’application

Effectuez la [configuration](https://docs.rdlabo.dev/projects/capacitor-facebook-login/docs/configuration) avant d’enregistrer les Facebook App Events.

## Comportement selon la plateforme

| Méthode                             | Android                 | iOS       | Web       |
| ---------------------------------- | ----------------------- | --------- | --------- |
| `logEvent`                         | Pris en charge               | Pris en charge | Pris en charge |
| `setAutoLogAppEventsEnabled`       | La Promise reste en attente | Pris en charge | Sans effet     |
| `setAdvertiserTrackingEnabled`     | Non implémenté         | Pris en charge | Sans effet     |
| `setAdvertiserIDCollectionEnabled` | La Promise reste en attente | Pris en charge | Sans effet     |

## Enregistrer un événement

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

Les valeurs des paramètres doivent être des chaînes ou des nombres. Les autres types ne font pas partie de l’API publique et sont ignorés par les implémentations natives.

## Événements automatiques et paramètres publicitaires

Ces paramètres peuvent être attendus avec await sur iOS :

```ts
await FacebookLogin.setAutoLogAppEventsEnabled({ enabled: true });
await FacebookLogin.setAdvertiserIDCollectionEnabled({ enabled: true });
await FacebookLogin.setAdvertiserTrackingEnabled({ enabled: true });
```

Demandez séparément l’autorisation App Tracking Transparency avant d’activer le suivi publicitaire si votre application iOS l’exige.

Sur Android, `setAutoLogAppEventsEnabled` et `setAdvertiserIDCollectionEnabled` appliquent la valeur demandée, mais les promises renvoyées restent actuellement en attente. `setAdvertiserTrackingEnabled` n’est pas implémenté sur Android. Les trois méthodes sont sans effet sur le Web.
