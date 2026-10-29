---
title: "Sérialisation des mises à jour et récupération"
sourceRevision: "04fa29373a7332571832d110c95c91ce905742829895c92dfdffcd1c43ac0a4b"
---
# Sérialiser les mises à jour d’état et récupérer après une confirmation perdue

Utilisez `createNativeUpdateQueue` lorsqu’un moteur de rendu lit l’état du DOM de façon asynchrone et envoie des mises à jour natives. Une rafale d’événements doit produire une seule lecture de l’état actuel, et une seconde lecture ne doit pas chevaucher la passe précédente. Ce helper est facultatif : il ne modifie ni les enregistrements natifs ni les autres API de projection. Conservez un ordonnanceur existant si le moteur de rendu nécessite une autre cadence ou politique de récupération. La file regroupe les demandes sur `requestAnimationFrame` ; celles arrivant pendant une passe déclenchent une seule passe ultérieure.

Par exemple, un redimensionnement, une mise à jour de sélection et une mutation DOM arrivent dans la même frame alors que la mise à jour native précédente attend encore une confirmation. Mettez en file une seule passe lisant l’état actuel plutôt que lancer des lectures qui se chevauchent. Si le pont perd une confirmation, réconciliez l’état actuel avant de reprendre les mises à jour ; n’utilisez jamais cette file pour réessayer un achat, un clic ou un chargement publicitaire.

```ts
import { createNativeUpdateQueue } from '@webview-native-ui/engine';

const updates = createNativeUpdateQueue(window, {
  async update(send) {
    const state = await renderer.readCurrentState();
    const reply = await send(
      () => renderer.sendState(state),
      (reply) => {
        if (reply.revision !== state.revision) throw new Error('Revision mismatch');
      },
    );
    if (reply) renderer.accept(state, reply);
  },
  retry: () => renderer.invalidateLastAcceptedState(),
  failed: (error) => renderer.stopAndRestoreFallback(error),
  reconnect: true,
});

// Depuis les notifications existantes de mise en page ou de contenu :
updates.request();
// Après réconciliation de la session et de la révision natives par la vérification de connexion existante :
updates.reconnected();
// Au démontage du moteur de rendu :
updates.destroy();
```

`renderer` représente le code existant de l’intégration. `send` sert uniquement à l’état remplaçable et s’appelle séquentiellement dans une passe de mise à jour, jamais pour des clics, des actions de sélection, des achats ou des demandes SDK. Un envoi échoué saute les envois restants de cette passe et demande une nouvelle passe, pas la répétition de sa charge utile. Si cette nouvelle passe échoue aussi, `reconnect: true` attend une négociation externe ; sans cette option, la file signale un échec définitif. Une confirmation invalide attend immédiatement une réconciliation. Après réconciliation, un autre réessai échoué ou une confirmation invalide est définitif ; une passe de mise à jour entièrement réussie réinitialise le budget de récupération. La file n’installe ni interrogation périodique de connexion ni abonnements.

Conservez les délais d’expiration des opérations dans le transport. Une expiration n’annule pas l’appel natif sous-jacent : le moteur de rendu natif doit rejeter les révisions périmées, et la vérification de connexion doit réconcilier l’état actuel avant de déclarer la récupération. La libération ignore les résultats d’envois tardifs et empêche les passes futures ; elle ne peut pas annuler une opération native déjà envoyée. Utilisez `dirty` pour rejeter les mesures DOM obsolètes, `running` pour différer la réconciliation de connexion pendant une passe et `waiting` pour détecter une récupération en attente. Le moteur de rendu reste responsable de l’attribution des révisions, de la géométrie acceptée et de la politique de repli.
