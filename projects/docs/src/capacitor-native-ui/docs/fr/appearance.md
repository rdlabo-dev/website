---
title: "Apparence claire et sombre"
sourceRevision: "c476b109eac9ad8a8c34bf6f1853c539bf67ee84afe6e15bd4792f8b0bd67bef"
---
# Apparence claire et sombre

Native UI lit le style calculé de chaque élément source projeté et transmet son apparence claire/sombre au moteur natif. Configurez l’apparence dans votre CSS Web ; il n’existe pas d’option distincte de démarrage pour le mode sombre natif.

## Résolution de l’apparence

La première ligne applicable l’emporte :

| Priorité | Style calculé de la source | Résultat |
| -------- | -------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| 1 | `--ios27-color-scheme` fourni par le thème n’est pas vide | `dark` sélectionne le sombre ; les autres valeurs, le clair. Le thème iOS 27 fournit ce marqueur via ses feuilles de style claires et sombres. |
| 2 | `--ion-background-color-rgb` fournit trois composantes RGB | Déduit le mode clair ou sombre de la luminosité du fond. |
| 3 | Le CSS `color-scheme` contient uniquement `dark` ou `light` | Utilise ce mode. `light dark` ne choisit pas une apparence unique. |
| 4 | Aucun cas ci-dessus | Utilise le réglage système `prefers-color-scheme: dark`. |

Les marqueurs du thème et les valeurs de fond Ionic sont prioritaires sur `color-scheme`. Modifier seulement une couleur CSS arbitraire de fond ou de texte ne sélectionne pas l’apparence native claire/sombre.

## Harmoniser avec votre thème Web

| Configuration Web | Réglage nécessaire |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Thème iOS 27 | Chargez la [paire de mode sombre système, par classe ou permanent](../../theme-ios27/docs/setup.md#choose-one-dark-mode-pair) correspondante. Le thème fournit le marqueur d’apparence. |
| Ionic avec un thème existant | Gardez `--ion-background-color-rgb` cohérent avec la palette active ; l’apparence native l’utilise en l’absence de marqueur du thème. |
| HTML sans ces variables de thème | Définissez `color-scheme: light` ou `color-scheme: dark` selon le thème Web actif. |
| Apparence HTML gérée par le système | Utilisez du CSS réactif au système ; sans mode unique sélectionné, l’apparence native utilise le réglage système. |

Par exemple, une application HTML simple avec une classe de mode sombre manuel peut déclarer :

```css
:root {
  color-scheme: light;
}

:root.app-dark {
  color-scheme: dark;
}
```

Utilisez la même classe pour la palette sombre de votre application. Cet exemple suppose l’absence des deux variables de thème prioritaires. Les mutations de classe/style et les changements d’apparence système déclenchent une réévaluation lorsque le runtime est actif. Pour des changements de style sans mutation DOM observée, appelez `shell.markForCheck()` après leur application.

## Apparence partagée de Vertical Bars

Les contrôles ordinaires déterminent leur apparence à partir de leurs propres styles source. Vertical Bars partage une seule apparence native pour le rail : **si un contrôle projeté est sombre, tout le rail devient sombre**. Il ne dessine pas de régions claires et sombres distinctes. Utilisez une palette Web cohérente pour les sources projetées dans un même rail.

L’apparence native claire/sombre sélectionne le matériau et l’apparence des contrôles système ; elle ne reproduit pas le CSS arbitraire de l’application. Le remplissage et la teinte des boutons verticaux restent régis par les [réglages d’apparence des boutons](vertical-bars.md#choose-button-appearance) distincts.
