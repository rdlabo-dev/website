---
title: "Utilisation"
sourceRevision: "cd9414e63963f098f63019001af03bfdca6944b023176fbffe5364e7f8184fbf"
---
Exécutez le collecteur avant les builds de production. Faites-le après l’[initialisation](./initialize.md).

```bash
npx @rdlabo/ionic-angular-collect-icons
```

### Automatiser avant le build

Placez le collecteur dans un script npm afin que les builds de production actualisent `src/use-icons.ts` :

```diff
  "scripts": {
    "ng": "ng",
    "start": "ng serve",
    "build": "ng build",
+   "prebuild": "npx @rdlabo/ionic-angular-collect-icons",
```

> [!WARNING]
> Cette méthode ne peut pas être utilisée pour les builds de production sans le script npm.

### Vérification de production

1. Ajoutez une icône statique à un template, par exemple `<ion-icon name="home"></ion-icon>`.
2. Exécutez le collecteur et vérifiez l’export correspondant dans `src/use-icons.ts`.
3. Exécutez `npm run build`.

Les liaisons dynamiques `[name]` ne sont pas collectées. Enregistrez ces icônes manuellement ou consultez les remarques sur les liaisons dans la [FAQ](./faq.md).
