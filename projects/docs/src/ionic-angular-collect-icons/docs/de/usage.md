---
title: "Verwendung"
sourceRevision: "4a48b43d8799faf79fbf099c4d85c02600523860fe22d539306f71653c235513"
---
Führen Sie den Collector vor Produktions-Builds aus. Führen Sie diesen Schritt nach der [Initialisierung](./initialize.md) aus.

```bash
npx @rdlabo/ionic-angular-collect-icons
```

### Vor dem Build automatisieren

Fügen Sie den Collector einem npm-Skript hinzu, damit Produktions-Builds `src/use-icons.ts` aktualisieren:

```diff
  "scripts": {
    "ng": "ng",
    "start": "ng serve",
    "build": "ng build",
+   "prebuild": "npx @rdlabo/ionic-angular-collect-icons",
```

> [!WARNING]
> Dieses Verfahren lässt sich für Produktions-Builds nur über das npm-Skript verwenden.

### Die Produktion prüfen

1. Fügen Sie einem Template ein statisches Symbol hinzu, zum Beispiel `<ion-icon name="home"></ion-icon>`.
2. Führen Sie den Collector aus und prüfen Sie den passenden Export in `src/use-icons.ts`.
3. Führen Sie `npm run build` aus.

Dynamische `[name]`-Bindungen werden nicht gesammelt. Registrieren Sie diese Symbole manuell oder lesen Sie die Hinweise zu Bindungen in den [FAQ](./faq.md).
