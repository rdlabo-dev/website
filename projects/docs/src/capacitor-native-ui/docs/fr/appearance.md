---
title: "Apparence claire et sombre"
sourceRevision: "956b6155b6e41dd0886309d91aa56755ba6c7582f6f4d480c93f534984e04ec4"
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

La propriété de la source et la présentation des pixels ont des durées de vie différentes. La propriété Native commence lorsqu’une projection est acceptée et persiste pendant les demandes d’images temporaires, leur préparation, les déplacements, le redimensionnement et la restauration. La propriété d’image détermine uniquement quels pixels remplacent actuellement les contrôles Native actifs. Une lecture différée ou ignorée n’est pas une décision de rendre la source au Web. Un masquage défini par l’application en dehors d’un maintien d’image ou de transition met fin à l’admissibilité actuelle. Une Modal qui n’utilise plus le rail met également fin à sa sélection de rail Native.

Le transfert suit ces règles :

1. Préparez les images après une mise à jour native acceptée et regroupez les changements visuels suivants. Ne capturez pas pendant un toucher. Conservez la dernière image terminée pendant la préparation de sa remplaçante. Les clones Web reçoivent l’état préparé avant insertion ou mise en page et restent masqués en tant que couche composite entière jusqu’au transfert, afin que leur apparence ne transparaisse pas à travers le verre natif actif.
2. À la présentation, réutilisez l’image préparée sans attendre capture, encodage, décodage ou réponse du pont. Ne retardez jamais le clic de l’application et ne le rejouez pas pour terminer le transfert.
3. Placez l’image sur la surface source, sous l’arrière-plan Web. Lorsqu’une superposition anime son `presentingElement`, attachez la couche préparée contenant uniquement les images à l’intérieur de cet élément : les images héritent ainsi des mêmes transformations, filtres et découpages que son arrière-plan. Ne déplacez pas les véritables contrôles Ionic. Convertissez les limites Native acceptées vers la cible d’image existante du moteur de rendu ; laissez cette cible porter le mouvement sans nouvelle capture ni reconstruction des contrôles à chaque frame. Un rail natif partagé exige des images pour tous ses contrôles qui se retirent.
4. Lorsque les contrôles ne peuvent pas être utilisés pendant une transition, demandez des images pour porter l’animation de façon fluide. La présentation et la fermeture d’une Modal suivent cette règle. La présentation d’images ne transfère pas la propriété Native des sources. L’absence d’images préparées conserve cette propriété ; la superposition peut masquer les contrôles actifs sans exposer de copie Web interactive. Consultez le [déplacement du rail d’une Modal](#modal-rail-movement) pour le glissement, l’ajustement aux positions d’arrêt et le découpage.
5. Au retour, recréez les contrôles natifs à leur position actuelle et retirez l’image après acceptation de la mise à jour native correspondante. Seule une mise à jour démarrée après la demande de restauration et acceptant tous les contrôles capturés peut confirmer le retour. Installez la propriété Native avant de retirer les images, sans fondu croisé du Web vers Native. Une réponse ancienne ou partielle ne doit pas terminer un transfert plus récent. Retirez uniquement la copie temporaire de retour ; conservez une image préparée valide pour une réouverture immédiate jusqu’à ce que sa remplaçante soit prête. Déplacer une surface transitoire entière préserve son image si les tailles des sources et leurs positions relatives à cette surface ne changent pas ; le transfert utilise les coordonnées actuelles de destination. Les changements internes à la surface ou de son apparence invalident le cache. Une image de Modal ne peut revenir que vers la Modal qui l’a fournie.
6. Abandonnez les images après des changements incompatibles de viewport, de disposition ou d’apparence de leurs propres sources. Les changements d’une autre surface n’invalident pas une image terminée. Libérer une image ou échouer à la préparer ne rend pas sa source au Web. La propriété Native des sources ne se termine qu’en cas de transfert Web explicite, de source qui n’est plus prise en charge ou sélectionnée, de rejet Native ou de défaillance du runtime, ou de destruction de la source ou du contexte. Sans image, une superposition peut temporairement masquer les contrôles Native actifs ; cela ne rend pas la copie Web interactive.

Une suspension limitée à une portée sans navigation Native, ou `runtime.suspend()` sans `covered: true`, demande explicitement une présentation Web. Une suspension de navigation Native conserve le bail de source choisi même si une superposition interrompt la lecture. La sélection de page peut s’arrêter à `ionViewWillLeave` ; la propriété de la source se termine après la sortie du contexte ou l’accusé de réception du commit de navigation Native. Le contexte d’une Modal se termine à `ionModalDidDismiss`, pas au début de son animation de fermeture.

Les contrôles d’arrière-plan et ceux d’une Modal en mouvement utilisent le même cycle de vie des images. Ils gardent des propriétés d’image distinctes, car ils peuvent être visibles simultanément sur des surfaces de coordonnées différentes. La Modal fournit ses coordonnées de retour après déplacement ; les adaptateurs de composants fournissent les limites natives et la cible de rendu Web. Engine possède le protocole commun de transfert des images, la conversion des coordonnées et le retrait des copies. Native UI fournit les limites natives admissibles, décide quels conteneurs partagés complets peuvent être masqués et applique la disposition native normale et les accusés de réception des mises à jour. Les adaptateurs de composants ne définissent pas de politiques distinctes de capture, de transfert ou de défaillance. JavaScript met à jour les attributs de propriété ; le CSS permanent du runtime contrôle le masquage et la visibilité des images. Les styles propres à chaque image contiennent uniquement la géométrie et les URL d’images ; libérer une image ne libère donc jamais la propriété Native d’un clone Web.

| Situation | Chemin |
| --- | --- |
| Popover natif conservant ses contrôles sources natifs | Conserver les contrôles natifs, sans les figer. |
| Web Modal bloquante (y compris card), popover, alert, action sheet, loading ou picker | Utiliser les images d’arrière-plan préparées lorsqu’elles sont disponibles. |
| Feuille laissant l’arrière-plan interactif ou superposition sans arrière-plan | Conserver la présentation active existante. |
| Menu transformant le contenu | Conserver le chemin existant ; ne pas appliquer d’images d’arrière-plan fixes. |
| Toast | Conserver le chemin actif existant. |

La disponibilité d’une image n’autorise pas à modifier l’état désactivé d’un contrôle, à déclencher une action, à contourner le confinement du focus ou à prolonger une superposition. Les extensions locales à l’application suivent la même règle d’image préparée avant la superposition ; leur image fige le dernier contenu préparé pendant que la superposition empêche l’interaction. Vérifiez la fidélité de la capture par rapport au matériau natif affiché, flou compris, avant d’activer le transfert par image pour un composant.

## Déplacement du rail d’une Modal

Les contrôles du rail d’une Modal utilisent la limite réservée à la barre d’outils fournie par la disposition du thème. Le runtime applique automatiquement ces règles ; les applications n’ont besoin ni d’écouteurs de glissement ni de mises à jour de position à chaque frame.

| État de la Modal | Présentation |
| --- | --- |
| Présentation ou fermeture | Utiliser une image préparée pour la transition. |
| Au repos | Utiliser les contrôles Native actifs. |
| Glissement ou ajustement, avec la barre d’outils sur la limite réservée ou au-dessus | Maintenir les contrôles Native actifs à la limite. |
| Glissement ou ajustement, avec la barre d’outils sous la limite réservée | Utiliser des images préparées qui suivent le dialogue Modal. |

La présentation et la fermeture ont priorité sur les règles de mouvement. Une animation d’ajustement reste un mouvement jusqu’à sa stabilisation. Lorsqu’une disposition personnalisée n’expose pas de position de limite fiable, le runtime conserve le chemin existant de suivi par image, sans supposer une limite fixe.

Les cibles d’image sont à l’intérieur du dialogue Modal, afin que sa propre transformation les déplace. La propriété Native des sources reste attachée aux contrôles acceptés pendant la présentation, le mouvement, le redimensionnement et la restauration des images ; elle se termine lorsque le contexte Modal est fermé ou qu’une autre condition explicite de libération s’applique. Les Modal standard, card et sheet suivent la même règle lorsqu’elles chevauchent le rail. `ionViewWillLeave` d’Ionic arrête la nouvelle sélection de page, mais ne retire pas les contrôles déjà acceptés tant que la politique actuelle de la Modal exige une présentation d’images non interactive, même sans image préparée. La sélection Web explicite, la suppression de sources, les changements de liaison et la fin du contexte continuent de libérer ces contrôles. Le moteur de rendu Native reste monté pendant que ses pixels sont masqués. L’entrée et le retour utilisent le même transfert d’images préparées que les autres surfaces. Des copies Native temporaires relient l’accusé de réception au dessin Web ; les images en mouvement restent dans le dialogue Modal. Lorsque les limites Native sont disponibles, la mise à jour applique le guide de barre d’outils avant de confirmer sa disposition ; sinon, l’alignement attend un passage de mise en page ultérieur. Le transfert commun retire les images lors de la mise à jour acceptée sans modifier la propriété des sources. Un rail partagé reste entièrement masqué tant que les pixels d’un de ses contrôles appartiennent à une image.

Sous la limite, la première action du rail s’aligne sur le centre du titre de la barre d’outils Web. Les limites des boutons Native déterminent l’alignement, avec le haut du rail réservé par l’appareil comme limite inférieure. Lorsque ces limites sont disponibles, Native applique l’alignement avant de confirmer la mise à jour ; révéler les contrôles ne peut donc pas exposer un rectangle non ajusté. Les cibles d’image utilisent le même ancrage de barre d’outils ; les actions suivantes gardent l’espacement Native et la disposition inférieure de la Modal reste en place.

### Apparence des images du rail d’une Modal

Les transferts du rail d’une Modal capturent les vues du moteur de rendu Native sans l’arrière-plan de la fenêtre environnante. Les pixels transparents à l’extérieur des boutons se fondent dans la surface actuelle de la Modal ; ces images n’ont donc pas besoin d’un découpage de forme DOM. Cela s’applique à un groupe `ion-buttons` entier comme aux contrôles `ion-button` projetés individuellement. Les contrôles ordinaires de la Modal conservent leur chemin existant.

L’intérieur du verre peut toujours contenir l’arrière-plan capturé ; les reflets, la réfraction, les ombres et les accents sur les contours peuvent différer du rendu Native actif. Il ne s’agit pas d’un matériau de verre sans arrière-plan. Les rails de page et les autres surfaces conservent la capture composite de fenêtre, ombres environnantes comprises. Ce transfert exige des implémentations JavaScript et natives correspondantes d’Engine ; mettre à jour uniquement le bundle Web ne met pas à niveau le protocole de transfert natif.
