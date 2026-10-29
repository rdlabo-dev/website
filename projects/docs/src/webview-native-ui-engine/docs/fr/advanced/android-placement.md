---
title: "Placement différé sur Android"
sourceRevision: "635ca25b59dc6382eaa179e35382f93855d7d3a8f41f46d2f41d7a0a4223f343"
---
# Placement différé sur Android

Utilisez cette approche uniquement lorsqu’un moteur de rendu existant diffère le placement natif pendant qu’une image opaque prend en charge la présentation. Les enregistrements de base ne nécessitent pas ces callbacks.

Par exemple, une publicité native opaque se déplace dans un flux défilant. Une fois que son image suit le DOM, recalculer répétitivement la mise en page de la vue native masquée ajoute du travail sans modifier les pixels visibles. Différez ce placement et appliquez la position la plus récente avant de révéler le contenu natif pour éviter qu’il ne revienne brusquement à son ancienne position. Conservez le suivi de placement ordinaire si la vue ne peut pas utiliser une image opaque.

Les consommateurs Android VIEW peuvent lire `isProjecting` sur le thread UI après une couverture réussie afin de différer le placement natif à taille identique. Conservez uniquement le dernier placement accepté ; continuez à valider la séquence et la génération, et traitez immédiatement le masquage, le redimensionnement et le démontage. Fournissez `beforeNativeReveal` pour appliquer ce placement en attente de façon synchrone avant que la restauration normale, la récupération après échec ou la libération de l’image active révèle les pixels natifs. L’Engine réinitialise `isProjecting` avant d’appeler le callback : l’application du placement ne doit donc pas être différée à nouveau. Le callback peut s’exécuter sans travail en attente et doit être idempotent. Effacez le travail en attente du consommateur lors du masquage ou de la destruction, et validez l’identité de la View chargée avant de l’appliquer. Le callback ne remplace pas l’invalidation du contenu ou de la taille, ni le suivi géométrique JavaScript.

### Placement final lors du retour depuis une image opaque (Android)

Un plugin qui mesure et transmet normalement le placement natif à chaque défilement peut activer un transfert de placement final. Passez `updatePlacement: (JSONObject) -> Unit` à son enregistrement Android `NativeUIProjection` et liez son hôte Web avec `bindProjectionPlacement(element, measure, invalidate)`.

- `binding.projected` ne devient true qu’après confirmation du transfert vers l’image par le natif. Tant qu’il vaut true, le plugin peut réutiliser le dernier placement de cet hôte dans les lots complets de placement et éviter de le mesurer. Les autres hôtes continuent leurs mises à jour ordinaires.
- `measure()` renvoie un objet JSON de façon synchrone. L’Engine l’inclut dans la demande de restauration existante (ou une demande de récupération de l’image active). Le natif valide le jeton d’image actif et l’identité de la View, appelle `updatePlacement`, puis révèle le natif et confirme son dessin. Aucun aller-retour supplémentaire sur le pont n’est ajouté.
- Le plugin doit valider sa propre identité, sa génération et sa séquence par hôte dans `updatePlacement`. Levez une exception pour rejeter un placement périmé ou invalide. Une mise à jour finale d’un hôte ne doit pas entraîner l’abandon de mises à jour pour un autre hôte.
- `invalidate()` est appelé après l’échec d’une demande de transfert. Effacez les caches optimistes de placement et de déduplication, puis planifiez une réconciliation de placement ordinaire.
- Libérez la liaison lors du détachement d’un hôte. La propriété de session empêche une confirmation tardive d’un ancien enregistrement d’effacer l’état de projection d’un nouvel enregistrement. La pause, la visibilité définie par l’application et les changements de mise en page doivent toujours utiliser les chemins normaux de visibilité et d’invalidation du plugin.

Cette option ne change pas les enregistrements sans `updatePlacement`. Android rejette `updatePlacement` sauf si `captureMode = CaptureMode.VIEW` ; les vidéos en direct et les autres captures non admissibles continuent le suivi de placement natif avec `failedFallback = NATIVE`.
