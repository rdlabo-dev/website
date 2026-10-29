---
title: "Prise en charge des conteneurs de projection"
sourceRevision: "2b43932d67b363d7b94387fa7a9040a0c925ee4962f62b0c30bd2debf064a431"
---

# Prise en charge des conteneurs de projection

Choisissez l’élément DOM existant qui occupe l’emplacement et la couche Web prévus pour la surface native. Ces tableaux s’appliquent à `projectionSelector` et à l’élément passé à `createWebProjectionScope`, pour Capacitor comme pour Cordova.

**⭕️** signifie que l’élément peut contenir l’image projetée de l’Engine dans les conditions indiquées. **❌** signifie qu’il n’est pas une destination directe prise en charge ; choisissez plutôt un conteneur englobant adapté. Il s’agit d’un contrat de présentation DOM, pas d’une promesse que l’Engine implémente le contrôle natif, les interactions ou les animations de ce composant. L’éligibilité à la capture native est une exigence distincte.

## Exigences communes

- Fournissez un seul élément HTML connecté avec une boîte de mise en page non fragmentée et de taille non nulle. Sa taille, son placement et sa couche relèvent de l’application. Pour les hôtes inline, utilisez `display: inline-block` ou `block` et donnez-leur les dimensions voulues.
- `projectionSelector` utilise les sélecteurs CSS du document (ID, classe, attribut ou descendant). Il doit correspondre à un seul élément et ne pénètre pas dans le Shadow DOM. Un élément absent peut être créé plus tard ; zéro ou plusieurs correspondances maintiennent Native masqué.
- L’image conservée est insérée dans le ShadowRoot ouvert de l’élément, ou sinon comme enfant du light DOM. Le contenu shadow fermé doit hériter de la visibilité de l’hôte et exposer un slot capable d’afficher l’image.
- Une superposition, un élément replié ou une page inactive n’est éligible que lorsqu’il dispose d’une boîte de mise en page visible. Ne forcez pas le rendu d’éléments de configuration masqués uniquement pour les utiliser comme destinations.
- Le rognage, l’opacité, les transformations et les filtres de l’hôte et de ses ancêtres affectent toujours l’image. Celle-ci n’est pas interactive et fige l’apparence capturée. Consultez la [référence de projection](projection.md#dom-and-native-surface-requirements) pour les limites de capture native et le [guide des moteurs de rendu](../advanced/web-projection.md) pour les exclusions des observateurs de mutations DOM.

## Conteneurs HTML

| Élément conteneur | Exemple | Prise en charge | Remarques |
| --------------------------------------------------------- | -------------------------------------------------------------------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Conteneur de bloc | `div`, `section`, `nav`, `article`, `header`, `footer` | ⭕️ | Donnez au conteneur la taille et la couche Web voulues. |
| Conteneur inline | `span`, `a`, `label` | ⭕️ | Utilisez `inline-block` ou `block` ; du texte inline réparti sur plusieurs lignes ne constitue pas une surface de projection unique. |
| Bouton | `button` | ⭕️ | Le bouton d’origine, ses écouteurs et ses valeurs sont conservés ; l’image ne reçoit pas les clics. |
| Élément personnalisé sans Shadow DOM | `native-ad` | ⭕️ | Fournissez une boîte de mise en page et autorisez une image enfant. |
| Élément personnalisé avec Shadow DOM ouvert | `native-control` | ⭕️ | L’Engine insère l’image directement dans la racine ouverte et masque le contenu de repli pendant la projection. |
| Élément personnalisé avec Shadow DOM fermé et slot adapté | `native-control` avec un slot par défaut | ⭕️ | L’image doit être affichée visiblement dans un slot ; le contenu interne doit hériter de la visibilité de l’hôte. L’Engine ne peut pas imposer de règles à l’intérieur de la racine fermée. |
| Élément personnalisé au contenu de rendu inaccessible | Racine fermée sans slot adapté | ❌ | Utilisez un conteneur externe ; une image dans le light DOM ne serait pas affichée. |
| Contrôle de formulaire natif | `select`, `input`, `textarea` | ❌ | Les portées directes sont refusées. Entourez le contrôle d’un conteneur ; sa valeur et ses écouteurs sont préservés. |
| Média remplacé ou surface de dessin | `img`, `canvas`, `video`, `audio`, `iframe`, `embed`, `object` | ❌ | Les portées directes sont refusées. Utilisez un conteneur autour du contenu. |
| Élément vide | `br`, `hr`, `area`, `base`, `link`, `meta`, `source`, `track`, `wbr` | ❌ | Les portées directes sont refusées ; ces éléments ne peuvent pas contenir d’image projetée. |
| Élément de configuration ou à rendu des enfants particulier | `option`, `optgroup`, `template` | ❌ | La réussite d’un contrôle HTMLElement ne rend pas une image enfant affichable. Utilisez un conteneur ordinaire. |
| Élément non HTML | `svg`, SVG `g`, MathML `math` | ❌ | Utilisez un conteneur HTML englobant, pas le nœud SVG/MathML lui-même. |
| Élément sans boîte utilisable | `display: none`, `display: contents`, taille nulle | ❌ | Choisissez un conteneur visible ayant les dimensions voulues. |
| Pseudo-élément | `::before`, `::after` | ❌ | Ce ne sont pas des éléments DOM et ils ne peuvent pas être sélectionnés comme portée. Les deux restent disponibles pour le CSS de l’application. |

## Éléments Ionic

L’inventaire suivant couvre tous les composants de l’[index de l’API Ionic](https://ionicframework.com/docs/api), avec une ligne par élément. Il a été vérifié avec `@ionic/core` **9.0.9** ; `ion-icon` est fourni par Ionicons. Le dernier tableau répertorie séparément le composant interne supplémentaire livré dans cette version.

Les éléments personnalisés Ionic ne sont pas les éléments HTML aux noms similaires : `ion-select`, `ion-input`, `ion-textarea` et `ion-img` peuvent contenir une image, contrairement aux éléments HTML `select`, `input`, `textarea` et `img`. Chaque ⭕️ ci-dessous exige toujours les conditions de mise en page communes ci-dessus et le parent/contexte Ionic habituel du composant.

### Boutons et barre d’outils

| Élément conteneur | Exemple | Prise en charge | Remarques |
| ------------------- | ------------------------------- | ------- | ------------------------------------------------------------------------------------ |
| `ion-button` | `ion-button#native-slot` | ⭕️ | Utilisez l’hôte visible avec la boîte de mise en page voulue. |
| `ion-buttons` | `ion-buttons#native-slot` | ⭕️ | Utilisez l’hôte visible avec la boîte de mise en page voulue. |
| `ion-back-button` | `ion-back-button#native-slot` | ⭕️ | Nécessite une destination de retour ou defaultHref pour rester visible. |
| `ion-menu-button` | `ion-menu-button#native-slot` | ⭕️ | Nécessite un menu disponible ou autoHide=false. |
| `ion-toolbar` | `ion-toolbar#native-slot` | ⭕️ | Utilisez l’hôte visible avec la boîte de mise en page voulue. |
| `ion-header` | `ion-header#native-slot` | ⭕️ | Utilisez l’hôte visible avec la boîte de mise en page voulue. |
| `ion-footer` | `ion-footer#native-slot` | ⭕️ | Utilisez l’hôte visible avec la boîte de mise en page voulue. |
| `ion-title` | `ion-title#native-slot` | ⭕️ | Utilisez l’hôte visible avec la boîte de mise en page voulue. |
| `ion-ripple-effect` | `ion-ripple-effect#native-slot` | ⭕️ | Une surface décorative capturée, pas un bouton. Pour un contrôle, préférez le bouton auquel elle appartient. |

### Formulaires et sélection

| Élément conteneur | Exemple | Prise en charge | Remarques |
| --------------------------- | --------------------------------------- | ------- | --------------------------------------------------------------------------------------------------- |
| `ion-checkbox` | `ion-checkbox#native-slot` | ⭕️ | Utilisez l’hôte visible avec la boîte de mise en page voulue. |
| `ion-input` | `ion-input#native-slot` | ⭕️ | L’hôte est pris en charge ; son input HTML interne n’est pas une destination. |
| `ion-input-otp` | `ion-input-otp#native-slot` | ⭕️ | Utilisez l’hôte visible avec la boîte de mise en page voulue. |
| `ion-input-password-toggle` | `ion-input-password-toggle#native-slot` | ⭕️ | Utilisez dans ion-input ; donnez à l’hôte une boîte inline-block pour éviter les décalages de ligne de base inline. |
| `ion-textarea` | `ion-textarea#native-slot` | ⭕️ | L’hôte est pris en charge ; son textarea HTML interne n’est pas une destination. |
| `ion-radio` | `ion-radio#native-slot` | ⭕️ | Utilisez l’hôte visible avec la boîte de mise en page voulue. |
| `ion-radio-group` | `ion-radio-group#native-slot` | ⭕️ | Utilisez l’hôte visible avec la boîte de mise en page voulue. |
| `ion-range` | `ion-range#native-slot` | ⭕️ | Utilisez l’hôte visible avec la boîte de mise en page voulue. |
| `ion-searchbar` | `ion-searchbar#native-slot` | ⭕️ | Utilisez l’hôte visible avec la boîte de mise en page voulue. |
| `ion-select` | `ion-select#native-slot` | ⭕️ | L’hôte est pris en charge. Sa superposition d’options présentée séparément ne fait pas partie de l’image de l’hôte. |
| `ion-select-option` | `ion-select-option#native-slot` | ❌ | Configuration d’ion-select ; aucune boîte rendue autonome. Sélectionnez plutôt ion-select. |
| `ion-toggle` | `ion-toggle#native-slot` | ⭕️ | Utilisez l’hôte visible avec la boîte de mise en page voulue. |
| `ion-datetime` | `ion-datetime#native-slot` | ⭕️ | Utilisez l’hôte visible avec la boîte de mise en page voulue. |
| `ion-datetime-button` | `ion-datetime-button#native-slot` | ⭕️ | Raccordez l’ion-datetime voulu ; le sélecteur ouvert est une surface distincte. |
| `ion-picker` | `ion-picker#native-slot` | ⭕️ | Utilisez l’hôte visible avec la boîte de mise en page voulue. |
| `ion-picker-column` | `ion-picker-column#native-slot` | ⭕️ | Utilisez l’hôte visible avec la boîte de mise en page voulue. |
| `ion-picker-column-option` | `ion-picker-column-option#native-slot` | ⭕️ | Une option de sélecteur rendue, contrairement à ion-select-option qui n’est pas rendu. Conservez son parent picker-column. |

### Contenu et mise en page

| Élément conteneur | Exemple | Prise en charge | Remarques |
| ----------------- | ---------------------------- | ------- | ---------------------------------------------------------------------------------------------- |
| `ion-app` | `ion-app#native-slot` | ⭕️ | Cible toute la boîte aux dimensions de l’application, pas un contrôle imbriqué. |
| `ion-content` | `ion-content#native-slot` | ⭕️ | Cible la surface externe du contenu ; pour un contrôle dans le contenu défilant, sélectionnez plutôt son propre conteneur. |
| `ion-grid` | `ion-grid#native-slot` | ⭕️ | Utilisez l’hôte visible avec la boîte de mise en page voulue. |
| `ion-row` | `ion-row#native-slot` | ⭕️ | Utilisez l’hôte visible avec la boîte de mise en page voulue. |
| `ion-col` | `ion-col#native-slot` | ⭕️ | Utilisez l’hôte visible avec la boîte de mise en page voulue. |
| `ion-split-pane` | `ion-split-pane#native-slot` | ⭕️ | Cible toute la disposition divisée ; sélectionnez un conteneur enfant pour un seul panneau. |

### Cartes, texte et médias

| Élément conteneur | Exemple | Prise en charge | Remarques |
| ------------------- | ------------------------------- | ------- | ------------------------------------------------------------------------------------- |
| `ion-card` | `ion-card#native-slot` | ⭕️ | Utilisez l’hôte visible avec la boîte de mise en page voulue. |
| `ion-card-content` | `ion-card-content#native-slot` | ⭕️ | Utilisez l’hôte visible avec la boîte de mise en page voulue. |
| `ion-card-header` | `ion-card-header#native-slot` | ⭕️ | Utilisez l’hôte visible avec la boîte de mise en page voulue. |
| `ion-card-title` | `ion-card-title#native-slot` | ⭕️ | Utilisez l’hôte visible avec la boîte de mise en page voulue. |
| `ion-card-subtitle` | `ion-card-subtitle#native-slot` | ⭕️ | Utilisez l’hôte visible avec la boîte de mise en page voulue. |
| `ion-text` | `ion-text#native-slot` | ⭕️ | Utilisez l’hôte visible avec la boîte de mise en page voulue. |
| `ion-label` | `ion-label#native-slot` | ⭕️ | Utilisez l’hôte visible avec la boîte de mise en page voulue. |
| `ion-note` | `ion-note#native-slot` | ⭕️ | Utilisez l’hôte visible avec la boîte de mise en page voulue. |
| `ion-badge` | `ion-badge#native-slot` | ⭕️ | Utilisez l’hôte visible avec la boîte de mise en page voulue. |
| `ion-chip` | `ion-chip#native-slot` | ⭕️ | Utilisez l’hôte visible avec la boîte de mise en page voulue. |
| `ion-avatar` | `ion-avatar#native-slot` | ⭕️ | Utilisez l’hôte visible avec la boîte de mise en page voulue. |
| `ion-thumbnail` | `ion-thumbnail#native-slot` | ⭕️ | Utilisez l’hôte visible avec la boîte de mise en page voulue. |
| `ion-img` | `ion-img#native-slot` | ⭕️ | Sélectionnez l’hôte Ionic, pas l’img HTML interne. Attendez que l’image ait la taille voulue. |
| `ion-icon` | `ion-icon#native-slot` | ⭕️ | Utilisez l’hôte visible avec la boîte de mise en page voulue. |
| `ion-skeleton-text` | `ion-skeleton-text#native-slot` | ⭕️ | L’image conserve un état capturé ; elle ne poursuit pas l’animation de l’indicateur. |
| `ion-spinner` | `ion-spinner#native-slot` | ⭕️ | L’image conserve un état capturé ; elle ne poursuit pas l’animation de l’indicateur. |
| `ion-progress-bar` | `ion-progress-bar#native-slot` | ⭕️ | L’image conserve un état capturé ; elle ne poursuit pas l’animation de l’indicateur. |

### Listes et gestes

| Élément conteneur | Exemple | Prise en charge | Remarques |
| ----------------------------- | ----------------------------------------- | ------- | --------------------------------------------------------------------------------------- |
| `ion-accordion` | `ion-accordion#native-slot` | ⭕️ | Cible la boîte actuelle de l’accordéon ; un changement de déploiement nécessite une mise à jour de la géométrie. |
| `ion-accordion-group` | `ion-accordion-group#native-slot` | ⭕️ | Cible la boîte du groupe, y compris son état de déploiement actuel. |
| `ion-list` | `ion-list#native-slot` | ⭕️ | Utilisez l’hôte visible avec la boîte de mise en page voulue. |
| `ion-list-header` | `ion-list-header#native-slot` | ⭕️ | Utilisez l’hôte visible avec la boîte de mise en page voulue. |
| `ion-item` | `ion-item#native-slot` | ⭕️ | Utilisez l’hôte visible avec la boîte de mise en page voulue. |
| `ion-item-divider` | `ion-item-divider#native-slot` | ⭕️ | Utilisez l’hôte visible avec la boîte de mise en page voulue. |
| `ion-item-group` | `ion-item-group#native-slot` | ⭕️ | Utilisez l’hôte visible avec la boîte de mise en page voulue. |
| `ion-item-sliding` | `ion-item-sliding#native-slot` | ⭕️ | Cible toute la ligne coulissante ; l’image n’implémente pas le geste de balayage. |
| `ion-item-options` | `ion-item-options#native-slot` | ⭕️ | Uniquement lorsque les options sont révélées par l’élément coulissant parent. |
| `ion-item-option` | `ion-item-option#native-slot` | ⭕️ | Uniquement lorsque le parent item-options est révélé. |
| `ion-infinite-scroll` | `ion-infinite-scroll#native-slot` | ⭕️ | Nécessite une boîte visible de taille non nulle ; le chargement et le défilement restent gérés par Ionic. |
| `ion-infinite-scroll-content` | `ion-infinite-scroll-content#native-slot` | ⭕️ | L’image fige l’indicateur de chargement actuel. |
| `ion-refresher` | `ion-refresher#native-slot` | ⭕️ | Uniquement dans son état actif visible à l’intérieur d’ion-content ; l’état inactif masqué n’est pas éligible. |
| `ion-refresher-content` | `ion-refresher-content#native-slot` | ⭕️ | Utilisez dans un refresher actif ; l’image fige l’indicateur actuel. |
| `ion-reorder` | `ion-reorder#native-slot` | ⭕️ | Conservez le contexte item/reorder-group ; l’image n’implémente pas le glisser. |
| `ion-reorder-group` | `ion-reorder-group#native-slot` | ⭕️ | Cible tout le groupe ; le réordonnancement et le glisser restent gérés par Ionic. |

### Navigation et onglets

| Élément conteneur | Exemple | Prise en charge | Remarques |
| --------------------- | --------------------------------- | ------- | -------------------------------------------------------------------------------------------- |
| `ion-breadcrumb` | `ion-breadcrumb#native-slot` | ⭕️ | Utilisez l’hôte visible avec la boîte de mise en page voulue. |
| `ion-breadcrumbs` | `ion-breadcrumbs#native-slot` | ⭕️ | Utilisez l’hôte visible avec la boîte de mise en page voulue. |
| `ion-nav` | `ion-nav#native-slot` | ⭕️ | Cible la zone d’affichage de navigation ; utilisez le conteneur de la page courante pour une surface propre à une page. |
| `ion-nav-link` | `ion-nav-link#native-slot` | ⭕️ | Donnez à ce conteneur d’action une boîte inline-block/block. |
| `ion-router` | `ion-router#native-slot` | ❌ | Configuration du routage, pas une surface visible. Sélectionnez le conteneur de la page rendue. |
| `ion-router-link` | `ion-router-link#native-slot` | ⭕️ | Donnez à ce conteneur d’action une boîte inline-block/block. |
| `ion-router-outlet` | `ion-router-outlet#native-slot` | ⭕️ | Cible la zone d’affichage de l’outlet ; utilisez le conteneur de la page active pour un placement propre à une page. |
| `ion-route` | `ion-route#native-slot` | ❌ | Définition de route, pas une surface visible. Sélectionnez le conteneur de la page rendue. |
| `ion-route-redirect` | `ion-route-redirect#native-slot` | ❌ | Définition de redirection, pas une surface visible. Sélectionnez le conteneur de la page rendue. |
| `ion-tabs` | `ion-tabs#native-slot` | ⭕️ | Cible la zone d’affichage des onglets. Utilisez ion-tab-bar pour la barre seule. |
| `ion-tab` | `ion-tab#native-slot` | ⭕️ | Seul l’onglet actif et visible est éligible. |
| `ion-tab-bar` | `ion-tab-bar#native-slot` | ⭕️ | La barre constitue une surface ; utilisez ion-tab-button pour les onglets individuels. |
| `ion-tab-button` | `ion-tab-button#native-slot` | ⭕️ | Utilisez l’hôte visible avec la boîte de mise en page voulue. |
| `ion-segment` | `ion-segment#native-slot` | ⭕️ | Le segment constitue une surface ; utilisez ion-segment-button pour un contrôle individuel. |
| `ion-segment-button` | `ion-segment-button#native-slot` | ⭕️ | Utilisez l’hôte visible avec la boîte de mise en page voulue. |
| `ion-segment-view` | `ion-segment-view#native-slot` | ⭕️ | Cible la zone d’affichage de la vue ; les pages individuelles utilisent ion-segment-content. |
| `ion-segment-content` | `ion-segment-content#native-slot` | ⭕️ | Utilisez la page de segment visible, pas une page hors écran. |

### Superpositions, menus et FAB

| Élément conteneur | Exemple | Prise en charge | Remarques |
| ------------------ | ------------------------------ | ------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `ion-action-sheet` | `ion-action-sheet#native-slot` | ⭕️ | Uniquement pendant l’affichage. Cible la boîte de l’hôte de la superposition, pas automatiquement son panneau interne ; préférez un conteneur dans la superposition pour un seul contrôle. |
| `ion-alert` | `ion-alert#native-slot` | ⭕️ | Uniquement pendant l’affichage. Cible la boîte de l’hôte de la superposition, pas automatiquement son panneau interne ; préférez un conteneur dans la superposition pour un seul contrôle. |
| `ion-modal` | `ion-modal#native-slot` | ⭕️ | Uniquement pendant l’affichage. Cible la boîte de l’hôte de la superposition, pas automatiquement son panneau interne ; préférez un conteneur dans la superposition pour un seul contrôle. |
| `ion-popover` | `ion-popover#native-slot` | ⭕️ | Uniquement pendant l’affichage. Cible la boîte de l’hôte de la superposition, pas automatiquement son panneau interne ; préférez un conteneur dans la superposition pour un seul contrôle. |
| `ion-loading` | `ion-loading#native-slot` | ⭕️ | Uniquement pendant l’affichage. Cible la boîte de l’hôte de la superposition, pas automatiquement son panneau interne ; préférez un conteneur dans la superposition pour un seul contrôle. |
| `ion-toast` | `ion-toast#native-slot` | ⭕️ | Uniquement pendant l’affichage. Cible la boîte de l’hôte de la superposition, pas automatiquement son panneau interne ; préférez un conteneur dans la superposition pour un seul contrôle. |
| `ion-backdrop` | `ion-backdrop#native-slot` | ⭕️ | Une surface de couverture décorative. Cela ne configure ni la détection des superpositions ni l’ordre z natif. |
| `ion-menu` | `ion-menu#native-slot` | ⭕️ | Uniquement lorsqu’il est affiché avec une boîte visible ; son ouverture/fermeture reste gérée par Ionic. |
| `ion-menu-toggle` | `ion-menu-toggle#native-slot` | ⭕️ | Nécessite un contenu visible ; utilisez inline-block/block et tenez compte d’autoHide. |
| `ion-fab` | `ion-fab#native-slot` | ⭕️ | Utilisez l’hôte visible avec la boîte de mise en page voulue. |
| `ion-fab-button` | `ion-fab-button#native-slot` | ⭕️ | Le bouton constitue une surface indépendamment de son groupe FAB parent. |
| `ion-fab-list` | `ion-fab-list#native-slot` | ⭕️ | Uniquement lorsqu’il est déployé ; conservez son parent ion-fab et son placement latéral. |

### Composant interne

| Élément conteneur | Exemple | Prise en charge | Remarques |
| ------------------ | ------------------------------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `ion-select-modal` | Contenu interne de la superposition de sélection | ❌ | Livré avec Ionic 9.0.9, mais sans contrat de destination public. Sélectionnez l’hôte public ion-select ou un conteneur appartenant à l’application. |

## Entourer un élément non pris en charge

Sélectionnez `#seat-projection`, pas le `select` HTML :

```html
<span id="seat-projection" style="display: inline-block; width: 12rem; height: 2.75rem">
  <select aria-label="Seat" style="width: 100%; height: 100%">
    <option>Any seat</option>
  </select>
</span>
```

Le DOM du contrôle, sa valeur et ses écouteurs d’événements survivent au transfert ; l’image préparée n’accepte pas de saisie. Le comportement natif et les événements applicatifs restent gérés par le plugin. Les [liaisons de valeurs](../configuration/values.md) facultatives reflètent les valeurs natives sur l’hôte sélectionné. Avec le conteneur ci-dessus, cet hôte est le span, pas le select interne ; l’adaptateur du composant enveloppant doit transmettre les valeurs reflétées à son contrôle.

## Périmètre de vérification

Des sondes temporaires Chromium et WebKit testent l’inventaire Ionic avec une boîte de mise en page explicite, les parents requis et des états visibles. Une image préparée de couleur unie vérifie le placement et la couverture des pixels visibles ; les sondes vérifient aussi la préservation de l’identité/des valeurs des enfants d’origine et la suppression des images de l’Engine lors du démontage. Pour les éléments de configuration, elles vérifient l’absence de boîte affichable. La sonde du refresher sélectionne son état CSS actif ; elle ne valide pas le geste de traction. Les indicateurs de chargement animés peuvent changer entre les captures avant/après.

Dans les deux navigateurs, les 90 éléments Ionic publics pris en charge présentaient un écart mesuré nul du cadre de l’image, une couverture complète de couleur unie dans la zone intérieure inspectée, la conservation des enfants/valeurs d’origine et aucune image de l’Engine conservée après destruction. Les quatre éléments de configuration publics n’avaient pas de boîte affichable. Le composant interne a également été testé, mais reste en dehors du contrat public pris en charge. Les sondes HTML couvrent 41 combinaisons d’éléments et de mise en page, y compris les racines shadow ouvertes et fermées.

Il s’agit de contrôles des conteneurs DOM, pas de tests de capture native, d’éligibilité SDK ou de l’ensemble des interactions Ionic. Ils ne garantissent pas le fonctionnement de chaque thème, implémentation de shadow fermé ou feuille de style applicative. Ces sondes ne font pas partie de la suite de tests permanente de la bibliothèque.
