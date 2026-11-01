---
title: "Apparence claire et sombre"
sourceRevision: "0d27ef0b11abb98f9364c0d16619ce91158b179981d807356d1e6e2bfd521a77"
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

## Images temporaires sous les superpositions Web

Lorsqu’une superposition Web bloquante exige que les contrôles natifs quittent le premier plan, le runtime peut afficher une image préparée sur chaque composant Web d’origine ou son clone Vertical Bars. Il s’agit d’un transfert visuel, pas d’un autre contrôle interactif. Ionic conserve la responsabilité du cycle de vie, de l’arrière-plan, du focus et de la fermeture de la superposition.

Le transfert suit ces règles :

1. Préparez les images après une mise à jour native acceptée et regroupez les changements visuels suivants. Ne capturez pas pendant un toucher. Conservez la dernière image terminée pendant la préparation de sa remplaçante. Les clones Web reçoivent l’état préparé avant insertion ou mise en page et restent masqués en tant que couche composite entière jusqu’au transfert, afin que leur apparence ne transparaisse pas à travers le verre natif actif.
2. À la présentation, réutilisez l’image préparée sans attendre capture, encodage, décodage ou réponse du pont. Ne retardez jamais le clic de l’application et ne le rejouez pas pour terminer le transfert.
3. Placez l’image sur la surface source, sous l’arrière-plan Web. Lorsqu’une superposition anime son `presentingElement`, attachez la couche préparée contenant uniquement les images à l’intérieur de cet élément : les images héritent ainsi des mêmes transformations, filtres et découpages que son arrière-plan. Ne déplacez pas les véritables contrôles Ionic. Convertissez les coordonnées une fois avant l’animation ; aucune synchronisation de position ou de couleur par image d’animation n’est nécessaire. Un rail natif partagé exige des images pour tous ses contrôles qui se retirent.
4. Pendant le déplacement d’une feuille, laissez sa surface Web transporter l’image. N’envoyez pas une mise à jour de position native à chaque image de l’animation.
5. Au retour, recréez les contrôles natifs à leur position actuelle et retirez l’image après acceptation de la mise à jour native correspondante. Seule une mise à jour démarrée après la demande de restauration et acceptant tous les contrôles capturés peut confirmer le retour. Installez la propriété Native avant de retirer les images, sans fondu croisé du Web vers Native. Une réponse ancienne ou partielle ne doit pas terminer un transfert plus récent. Retirez uniquement la copie temporaire de retour ; conservez une image préparée valide pour une réouverture immédiate jusqu’à ce que sa remplaçante soit prête. Déplacer une surface transitoire entière préserve son image si les tailles des sources et leurs positions relatives à cette surface ne changent pas ; le transfert utilise les coordonnées actuelles de destination. Les changements internes à la surface ou de son apparence invalident le cache. Une image de Modal ne peut revenir que vers la Modal qui l’a fournie.
6. Abandonnez les images après des changements incompatibles de viewport, de disposition ou d’apparence de leurs propres sources. Les changements d’une autre surface n’invalident pas une image terminée. Les images manquantes et les défaillances du pont doivent rendre la propriété à la présentation Web existante, plutôt que bloquer la saisie ou laisser indéfiniment une image obsolète.

Les contrôles d’arrière-plan et ceux d’une Modal en mouvement utilisent le même cycle de vie des images. Ils gardent des propriétés d’image distinctes, car ils peuvent être visibles simultanément sur des surfaces de coordonnées différentes. La Modal fournit ses coordonnées de retour après déplacement ; les adaptateurs de composants fournissent les limites natives et la cible de rendu Web. Engine possède le protocole commun de transfert des images, la conversion des coordonnées et le retrait des copies. Native UI fournit les limites natives admissibles, décide quels conteneurs partagés complets peuvent être masqués et applique la disposition native normale et les accusés de réception des mises à jour. Les adaptateurs de composants ne définissent pas de politiques distinctes de capture, de transfert ou de défaillance. JavaScript met à jour les attributs de propriété ; le CSS permanent du runtime contrôle le masquage et la visibilité des images. Les styles propres à chaque image contiennent uniquement la géométrie et les URL d’images ; libérer une image ne libère donc jamais la propriété Native d’un clone Web.

| Situation | Chemin |
| --- | --- |
| Popover natif conservant ses contrôles sources natifs | Conserver les contrôles natifs, sans les figer. |
| Web Modal bloquante (y compris card), popover, alert, action sheet, loading ou picker | Utiliser les images d’arrière-plan préparées lorsqu’elles sont disponibles. |
| Feuille laissant l’arrière-plan interactif ou superposition sans arrière-plan | Conserver la présentation active existante. |
| Menu transformant le contenu | Conserver le chemin existant ; ne pas appliquer d’images d’arrière-plan fixes. |
| Toast | Conserver le chemin actif existant. |

La disponibilité d’une image n’autorise pas à modifier l’état désactivé d’un contrôle, à déclencher une action, à contourner le confinement du focus ou à prolonger une superposition. Les extensions locales à l’application suivent la même règle d’image préparée avant la superposition ; leur image fige le dernier contenu préparé pendant que la superposition empêche l’interaction. Vérifiez la fidélité de la capture par rapport au matériau natif affiché, flou compris, avant d’activer le transfert par image pour un composant.
