---
title: "Choix de conception des utilitaires"
sourceRevision: "a9463d3640cf72326849d5a28e159987a62069688361d5deed5929e6d0c2c6f0"
---
# Choix de conception

Ces utilitaires extraient les opérations de connexion récurrentes des applications d’impression d’étiquettes. Ils utilisent le plugin inclus dans ce package et conservent le contrat natif existant.

## Répartition des responsabilités

| Opération observée dans les applications | Comportement partagé | Responsabilité de l’application |
| --- | --- | --- |
| Les écrans répètent les vérifications de connexion selon la plateforme et le modèle | Lire la plateforme Capacitor, filtrer les ports pris en charge et déterminer la connexion enregistrée ou par défaut | Présenter les choix de connexion |
| Une deuxième recherche arrive pendant que la première est en cours | Sérialiser les appels aux utilitaires jusqu’à la fin de l’opération native et la suppression des écouteurs ; reprendre après un échec | Choisir quand rechercher et présenter l’interface de chargement |
| Une imprimante réseau mémorisée peut s’être déconnectée | Vérifier un canal précédent correspondant et relancer une recherche s’il est indisponible | Fournir les callbacks de stockage et décider si une solution de repli convient |
| Une imprimante est saisie manuellement plutôt que découverte | Vérifier un port et une adresse explicites sans métadonnées de recherche ni solution de repli | Fournir le modèle réel, choisir le port et gérer les résultats indisponibles |
| Les événements de recherche se répètent ou utilisent des alias de noms de produits | Rassembler les résultats et les associer aux modèles de l’énumération existante | Choisir une imprimante ou annuler la sélection |
| Les écrans enregistrent des écouteurs puis se ferment | Une session gère les résultats, les écouteurs d’impression et un état fermé définitif ; ignorer les opérations natives en attente et les résultats tardifs | Créer une session par écran, la fermer à la sortie et vérifier `closed` avant d’afficher l’interface après une génération d’image asynchrone |

## Une imprimante candidate réutilisable ou une destination explicite

La distinction entre préparation et vérification explicite est volontaire. Une imprimante précédente est une commodité qui peut conduire à une nouvelle recherche. Une adresse choisie explicitement est une destination : un échec de vérification ne doit pas sélectionner silencieusement une autre imprimante.

## Sérialiser jusqu’à la fin de l’opération native

Le code réel des applications utilisait à la fois des recherches préliminaires courtes et des recherches plus longues demandées par l’utilisateur ; la durée reste donc une option explicite de recherche native. Aucun minuteur JavaScript fixe ne sert à déduire la fin d’une opération du SDK. Plusieurs ports peuvent être recherchés en attendant successivement les appels aux utilitaires ; aucun calendrier de recherche automatique ni aucune déduction du transport n’est ajouté.

## Politique de l’application

Les dialogues de sélection, l’implémentation du stockage, les listes d’appareils masqués, les statistiques, la génération d’images, les polices, les mises en page d’étiquettes et les messages aux utilisateurs relèvent des applications. Les modifications du SDK natif et les nouvelles tentatives d’impression automatiques ne font pas partie de ces utilitaires. Les erreurs natives et les résultats de disponibilité existants sont conservés sans reclassement.

## Distinguer la fermeture de l’écran de la fin de l’opération native

`BrotherPrinterSession` constitue la limite de gestion d’état d’un écran d’impression. Elle partage la file de connexion native des utilitaires sans état ; l’ouverture d’un nouvel écran ne peut donc pas chevaucher une recherche inachevée du précédent. La fermeture ne prétend pas annuler une opération native : une recherche active se termine et supprime son écouteur ; une impression déjà lancée continue. `dispose()` attend la suppression des écouteurs d’impression, pas la fin de la recherche ni de l’impression. Attendez séparément la promesse de `printImage()` si l’appelant doit attendre la fin de l’impression. L’application n’a pas besoin de sa propre file de recherche, liste d’écouteurs ou compteur de génération d’annulation.

## Stockage fourni par l’application

Le stockage facultatif de la session gère les clés de connexion et la sérialisation JSON via les callbacks `get`, `set` et `remove`. Les applications fournissent le stockage ; préparer l’imprimante et mémoriser la destination choisie ne nécessite pas de code de persistance séparé dans l’application.

Pour l’utilisation et les exemples de code, consultez [Utilitaires JavaScript pour imprimantes](/docs/connection-management).

## Ce que les tests établissent

Les tests exercent ces parcours de connexion via le package compilé, avec le lanceur de tests standard de Node. Ils n’établissent ni la compatibilité avec une imprimante physique ni l’identité du modèle à partir d’une vérification de disponibilité.
