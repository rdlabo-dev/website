---
sourceRevision: "0ed08a5bc4e61a961fca993c3e8e50da51b29dcc99005812b1c14e8703c9e6a9"
title: Couleurs dynamiques Android
---

# Couleurs dynamiques Android

Les couleurs dynamiques sont une API prise en charge, à activer explicitement. Lisez la palette Material You de l’appareil sans activer la projection Native UI, modifier le thème de l’Activity ni demander d’autorisations pour le fond d’écran ou le stockage. Ionic n’est pas nécessaire pour lire les couleurs. Les extensions SwiftUI/Compose locales à l’application restent expérimentales ; leur statut est distinct.

## Installer et importer

Installez le plugin comme dépendance directe de l’application, synchronisez, puis recompilez l’application Android. Mettre à jour uniquement JavaScript ne peut pas ajouter de méthode native à un APK installé.

```sh
npm install @rdlabo/capacitor-native-ui
npx cap sync android
npx cap run android
```

Utilisez la racine du paquet pour les fonctions et les types :

```ts
import {
  getDynamicColorScheme,
  addDynamicColorListener,
  materialColorRoles,
  type DynamicColorScheme,
  type MaterialColorScheme,
  type MaterialColorRole,
} from '@rdlabo/capacitor-native-ui';
```

Le getter natif et les exports racine sont inclus dans la version 2.1.3. Les installations plus anciennes, comme 2.1.1, nécessitent une mise à jour et une recompilation native. Ce guide décrit l’API du code source actuel ; le retrait de la désignation expérimentale prend effet dans la version contenant ce changement. N’utilisez pas l’ancien sous-chemin de plugin `/dynamic-colors`.

## Lire une palette

```ts
const result = await getDynamicColorScheme();
if (result.available) {
  const colors = result.systemDark ? result.dark : result.light;
  console.log(colors.primary, colors.onPrimary);
}
```

`getDynamicColorScheme(): Promise<DynamicColorScheme>` lit les deux apparences en un appel natif. Il renvoie un instantané, ne le met pas en cache et n’applique pas de CSS.

| Plateforme | Résultat |
| --- | --- |
| Android 12+ (API 31+) | `{ available: true, systemDark, light, dark }` |
| Android 11 et antérieur | `{ available: false, systemDark }` |
| iOS / Web | `{ available: false, systemDark }`, sans lecture du pont natif |

`systemDark` est l’indicateur de mode nuit de la configuration Android. Sur iOS/Web, il provient de `prefers-color-scheme: dark`, ou vaut false lorsque `matchMedia` est indisponible. Quand `available` vaut false, il n’y a pas de propriétés `light` ou `dark`. Conservez la palette existante de votre application. Les erreurs de lecture natives rejettent la promesse ; elles ne sont pas converties en `available: false`.

### Contrat des couleurs

Chaque `MaterialColorScheme` contient des chaînes opaques à six chiffres `#RRGGBB`. La casse des lettres hexadécimales est sans importance. `primary`, `secondary`, `tertiary`, `error`, `surface` et `onSurface` sont obligatoires ; les autres rôles sont facultatifs dans le type public pour permettre aux consommateurs d’accepter des palettes partielles. L’implémentation Android actuelle renvoie les 46 noms de `materialColorRoles` pour chaque apparence :

- Rôles d’accentuation et de premier plan, y compris les conteneurs primary/secondary/tertiary.
- Paires d’erreur et de conteneur d’erreur.
- Surface, niveaux de conteneur de surface et premiers plans de surface.
- Contour, variante de contour, voile, rôles inverses et fixes.

Utilisez `MaterialColorRole` pour un nom de rôle et `materialColorRoles` pour énumérer les noms pris en charge. Préservez les paires arrière-plan/premier plan comme `primary` et `onPrimary` lors du rendu. Les valeurs proviennent des palettes dynamiques claires/sombres d’AndroidX Material 3 ; le plugin ne régénère pas de palette à partir d’une couleur de départ et n’expose pas de palettes tonales brutes. Les valeurs dépendent de la palette système de l’appareil.

## Observer les changements et nettoyer

`addDynamicColorListener(listener: () => void)` renvoie une promesse de `PluginListenerHandle` disposant de `remove(): Promise<void>`.

Android notifie à la reprise de l’Activity et lors des changements de configuration. Une notification signifie **relire**, pas nécessairement que les couleurs ont changé. Elle ne contient pas de palette et n’est pas un abonnement continu aux changements de fond d’écran. Sur iOS/Web, la fonction renvoie un handle supprimable sans effet ; observez séparément l’apparence du navigateur si vous implémentez votre propre contrôleur.

Enregistrez l’écouteur avant la première lecture pour ne pas manquer un changement au démarrage :

```ts
const refresh = async () => {
  const result = await getDynamicColorScheme();
  // Appliquez ou stockez le résultat ici, en conservant le repli si indisponible.
  console.log(result);
};
const handle = await addDynamicColorListener(() => {
  void refresh().catch(console.error);
});
try {
  await refresh();
} catch (error) {
  await handle.remove();
  throw error;
}

// Lors du nettoyage de l’application :
await handle.remove();
```

Avec un contrôleur personnalisé, regroupez les lectures simultanées et conservez la dernière palette fonctionnelle si une actualisation échoue. Le contrôleur Ionic ci-dessous gère ces détails.

## Appliquer à Ionic

Le plugin acquiert les couleurs ; le thème gère la conversion et le cycle de vie CSS. Aucun appel à `enableNativeUI()` ni autre configuration de projection n’est nécessaire.

```ts
import { getDynamicColorScheme, addDynamicColorListener } from '@rdlabo/capacitor-native-ui';
import { enableDynamicColors } from '@rdlabo/ionic-theme-md3/dynamic-colors';

const theme = await enableDynamicColors({
  getScheme: getDynamicColorScheme,
  listen: addDynamicColorListener,
  mode: 'system',
  onError: console.error,
});

// Lors du changement de préférence d’apparence :
theme.setMode('dark'); // 'light' et 'system' sont également pris en charge.

// Lors du nettoyage de l’application :
await theme.destroy();
```

Installez le thème MD3 et importez `dark.class.css` d’Ionic dans la feuille de style globale. Ne le combinez pas avec `dark.system.css` ou `dark.always.css`. Initialisez un seul contrôleur par document navigateur, une fois le DOM disponible ; ne l’exécutez pas pendant le rendu serveur. Consultez le [guide de configuration et de correspondance du thème](/ionic-theme-md3/docs/dynamic-colors) pour la configuration complète des styles, les règles de repli, les erreurs et le contrôle de l’apparence.

Les palettes Ionic restent suffisantes sans cette fonction. Les rôles Material enrichissent les tokens facultatifs tout en préservant les choix explicites de couleurs Ionic, les surfaces blanches par défaut et les palettes light/medium/dark distinctes. Success et warning conservent leurs valeurs Ionic.

## Dépannage

- **Méthode native non implémentée :** mettez à jour la dépendance du plugin, lancez la synchronisation Capacitor, recompilez et réinstallez l’application Android. Vérifiez le binaire natif autant que la version JavaScript.
- **Aucune couleur sur iOS/Web/ancien Android :** `available: false` est attendu ; conservez la palette existante. Ce n’est pas un échec d’installation.
- **Les changements de fond d’écran ne s’affichent pas immédiatement :** relisez après le retour dans l’application ou demandez une actualisation explicite. Les notifications signalent des invalidations de cycle de vie/configuration, sans garantir un événement immédiat de fond d’écran.
- **Les couleurs sont lues, mais l’UI ne change pas :** cette API n’écrit pas de CSS. Connectez un contrôleur de thème ou appliquez les valeurs dans votre propre moteur de rendu.
