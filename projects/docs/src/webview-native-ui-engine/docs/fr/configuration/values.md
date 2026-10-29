---
title: "Liaisons de valeurs"
sourceRevision: "42394149a5a0bdbcca6d15e7c39ec5074d71356039852e4e3a0f232c58570df9"
---
# Refléter les valeurs du composant dans le DOM

Un interrupteur natif, une sélection d’onglet ou un contrôle de texte peut changer alors que son repli Web est masqué. Reflétez ses valeurs actuelles afin que le repli et l’application puissent observer la même sélection lorsqu’ils deviennent visibles. Cela est distinct de l’[état de projection](../reference/state.md) : un onglet sélectionné est une donnée du composant, pas une demande de déplacement de son rendu entre natif et Web.

Par exemple, un utilisateur active un interrupteur natif alors que son repli Web est masqué. Si la capture devient ensuite indisponible, un repli inchangé le montrerait désactivé. Renvoyez le booléen actuel via `readValues` et associez-le à la propriété `checked` de l’hôte pris en charge. Les notifications de formulaire de l’application utilisent toujours l’adaptateur existant du composant ; l’Engine maintient uniquement la cohérence des données affichées.

Configurez cette connexion dans l’initialisation `NativeUIProjection` existante du plugin. Aucune enveloppe côté application n’est nécessaire. Ces options fonctionnent avec les enregistrements Capacitor et Cordova. Les valeurs sont appliquées au même élément que celui correspondant à `projectionSelector`, pas à un contrôle enfant ni à une cible de liaison distincte. Choisissez un [conteneur de projection pris en charge](../reference/containers.md), par exemple `ion-toggle` ou un élément personnalisé de l’application exposant `checked` ou `value`. Les éléments HTML `input`, `select` et `textarea` ne sont pas des conteneurs de projection directs. Si vous utilisez un conteneur autour de l’un d’eux, son propre observateur d’attribut ou setter de propriété doit transmettre la valeur au contrôle interne. L’Engine ne recherche pas ce contrôle. Ces liaisons appartiennent aux enregistrements natifs ; les API de moteur de rendu de bas niveau conservent la synchronisation des valeurs déjà assurée par le moteur de rendu.

## Commencer par les attributs de données

Fournissez `readValues` pour activer la réflexion. Ce callback lit les valeurs **actuelles** du plugin, y compris les modifications programmatiques ; les charges utiles des événements ne servent pas de stockage de valeurs. Par défaut, chaque clé renvoyée devient `data-native-ui-value-<key>`. Omettez `readValues` pour conserver le comportement existant sans demandes de valeurs.

Par exemple, ces arguments dans un enregistrement Swift exposent l’onglet sélectionné sous la forme `data-native-ui-value-selected` :

```swift
receiveListeners: .init(update: ["updated", "tabSelected"]),
readValues: { [weak self] in
    ["selected": self?.selectedTabID ?? ""]
},
```

Utilisez des clés en minuscules commençant par une lettre, suivie de lettres, chiffres ou tirets. Renvoyez des valeurs compatibles JSON. Les chaînes sont écrites littéralement ; nombres, booléens, tableaux, objets et null utilisent du texte JSON. Null devient le texte d’attribut `null` ; une chaîne vide produit un attribut vide. Aucun des deux ne supprime l’attribut, et une clé omise laisse la valeur précédente inchangée. Utilisez `NSNull()` en Swift ou `JSONObject.NULL` en Kotlin pour renvoyer JSON null (`JSONObject.put(key, null)` supprime la clé à la place).

L’Engine lit les valeurs à l’apparition du DOM correspondant, après la reconnexion de la page et lors des événements `update` configurés. Il ignore les réponses destinées à un DOM retiré ou à une demande remplacée. Le callback s’exécute sur le thread UI natif : lisez l’état stocké plutôt que d’effectuer un travail bloquant.

## Choisir une propriété DOM lorsque le composant en a besoin

L’hôte d’un Web Component pris en charge peut exposer `value`, `checked` ou une autre propriété de données au lieu de lire des attributs. Remplacez uniquement ces clés à l’aide de `values` :

```swift
receiveListeners: .init(update: ["updated", "selectionChanged"]),
values: ["selected": .init(property: "value")],
readValues: { [weak self] in
    ["selected": self?.selectedTabID ?? ""]
},
```

Les arguments équivalents pour un enregistrement Kotlin sont :

```kotlin
receiveListeners = NativeUIProjection.ReceiveListeners(
    update = listOf("updated", "selectionChanged")
),
values = mapOf(
    "selected" to NativeUIProjection.ValueBinding(property = "value")
),
readValues = { JSONObject().put("selected", selectedTabID) },
```

L’affectation de propriété préserve les types JSON : un booléen reste un booléen au lieu de devenir une chaîne d’attribut. Choisissez une propriété de données accessible en écriture et prise en charge par le composant. Les propriétés HTML, de style et de gestionnaire d’événements ne sont pas des destinations de liaison. Une substitution par propriété remplace la réflexion d’attribut pour cette clé. Les autres clés renvoyées utilisent toujours les attributs de données par défaut.

Lorsque les liaisons de propriétés ciblent un élément personnalisé autonome (tel que `<my-toggle>`) qui n’est pas encore défini, l’Engine attend sa définition avant de lire et d’affecter les valeurs. Cela empêche une affectation précoce de masquer le futur setter du composant. Après l’attente, il revérifie la propriété du DOM et les mises à jour en attente. Les liaisons utilisant uniquement des attributs peuvent refléter des valeurs avant la définition de l’élément personnalisé. Définissez les éléments natifs personnalisés (tels que `<input is="my-input">`) avant d’activer les liaisons de propriétés ; leur nom de définition personnalisé n’est pas disponible de façon fiable depuis le DOM.

## Conserver les événements applicatifs dans l’adaptateur du composant

L’Engine relie l’état natif au DOM. Il n’implémente pas la liaison bidirectionnelle d’un framework et n’émet pas `input`, `change`, `ionChange` ou d’autres événements de composant. Les lectures initiales, les sélections utilisateur et les mises à jour programmatiques suivent toutes le même chemin de réflexion. Les lectures concurrentes utilisent la réponse la plus récente, et les réponses destinées à un conteneur retiré sont ignorées.

Conservez les notifications applicatives dans l’API d’événements existante du plugin. L’adaptateur du contrôle de formulaire, de l’élément personnalisé ou du framework décide comment cet événement natif met à jour le modèle applicatif. Par exemple, l’événement `tabSelected` d’un plugin d’onglets peut actualiser l’état de l’onglet sélectionné dans l’application tandis que l’Engine reflète séparément la sélection actuelle dans la propriété `value` du repli. Ne lisez pas le DOM depuis ce gestionnaire d’événement en supposant que l’actualisation asynchrone de l’Engine est terminée ; utilisez plutôt la charge utile documentée de l’événement du plugin.

Un élément personnalisé peut réagir à un attribut reflété via son `attributeChangedCallback`, ou accepter une propriété via son setter. Utilisez ce point d’entrée pour afficher la valeur actuelle. Les setters qui émettent des événements applicatifs conservent leur propre comportement ; l’Engine ne supprime pas ces événements et n’invente pas de format d’événement universel. Refléter une propriété ne raccorde pas, à lui seul, un formulaire de framework.

L’Engine n’appelle pas les setters natifs, n’observe pas les propriétés DOM pour renvoyer des valeurs vers le natif et ne rejoue pas d’actions. Conservez le gestionnaire Web-vers-natif existant du composant et évitez les boucles inconditionnelles entre setters et événements.

Lors du démontage, les valeurs reflétées restent disponibles pour le repli Web. L’Engine supprime son marqueur d’état de projection, mais ne réinitialise pas les données du composant.
