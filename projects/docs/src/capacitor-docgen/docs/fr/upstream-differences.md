---
title: "Différences avec le projet d’origine"
sourceRevision: "4e8f949ba40ff9226107e041163402b220c811ad21843f708ed02745f61551c4"
---
Cette comparaison porte sur les packages npm publiés `@rdlabo/capacitor-docgen@0.4.1` et `@capacitor/docgen@0.3.1`. Le fork est basé sur le projet Ionic, mais rdlabo le publie et le maintient séparément.

## Résumé de compatibilité

| Élément                             | Projet d’origine 0.3.1                                                                                          | Fork rdlabo 0.4.1                                     |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| Package                             | `@capacitor/docgen`                                                                                     | `@rdlabo/capacitor-docgen`                            |
| Exécutable                              | `docgen`                                                                                                | `docgen`                                              |
| Options CLI                           | `--api` (`-a`), `--output-readme` (`-r`), `--output-json` (`-j`), `--project` (`-p`), `--silent` (`-s`) | Identique                                                  |
| Espaces réservés README                 | `<docgen-index>`, `<docgen-api>`                                                                        | Identique                                                  |
| Exports principaux                        | `generate`, `parse`, utilitaires de sortie, `run`, types publics                                                | Identique                                                  |
| Métadonnées d’héritage des interfaces         | Non exposées                                                                                             | `DocsInterface.extends: string[]`                     |
| Méthodes et propriétés héritées    | Non développées                                                                                            | Ajoutées depuis les objets d’interfaces de base résolus         |
| Héritage de l’API principale             | Uniquement les membres d’API déclarés directement                                                                      | Les membres des objets de base résolus sont ajoutés à l’API  |
| Interface de base via un alias de type | Non résolue pour l’héritage                                                                            | Les `complexTypes` de l’alias servent à trouver les interfaces de base |

Les archives tarball publiées contiennent des modules compilés identiques octet pour octet pour l’analyse de la CLI, la génération, le traitement du Markdown, le formatage des sorties et la création du programme TypeScript. Les changements d’implémentation qui affectent le comportement se limitent à `dist/parse.js` ; la modification des déclarations publiques se trouve dans `dist/types.d.ts`. Les métadonnées du package et le contenu du README diffèrent également.

## Ajouts du parseur

Pour chaque interface de premier niveau, le fork stocke le texte de ses expressions d’héritage TypeScript dans `DocsInterface.extends`. Lorsque docgen collecte cette interface, il :

1. conserve un nom de base qui correspond directement à une interface analysée ;
2. résout un alias de type correspondant vers les `complexTypes` qu’il référence ;
3. trouve les interfaces de base ainsi obtenues ; puis
4. ajoute à l’interface dérivée les méthodes et propriétés présentes à cet instant dans les objets de ces interfaces de base.

Depuis la v0.4.1, cette même collecte s’applique à l’interface de l’API principale : une API de plugin peut donc hériter des méthodes d’une interface de plugin de base. Dans la v0.4.0, cet aplatissement ne concernait que les interfaces auxiliaires.

## Résultat observable

Pour une interface d’options dérivée, le projet d’origine ne produit que les membres déclarés directement dans cette interface. Le fork produit ces membres, puis ceux présents à cet instant dans l’objet de son interface de base résolue. Le JSON brut et le tableau Markdown généré contiennent donc les membres hérités, et le résultat programmatique inclut le tableau `extends`.

La collecte modifie directement les objets d’interfaces analysées partagés. Si un autre membre d’API provoque d’abord la collecte et le développement d’une interface de base, cet objet de base contient déjà des membres copiés de ses ancêtres lorsqu’une interface dérivée l’utilise ultérieurement. Ces membres indirects sont alors transmis à l’interface dérivée. Le résultat peut donc dépendre de l’ordre de collecte des membres, même si le code ne parcourt pas récursivement toute la chaîne d’héritage en une seule opération.

Les options CLI existantes, le remplacement des espaces réservés, la génération des titres, l’écriture JSON et les fonctions exportées conservent par ailleurs le comportement du projet d’origine.

## Limites actuelles

Cette amélioration est volontairement une petite extension du parseur, et non un aplatissement complet des types TypeScript :

- Elle n’aplatit pas récursivement toute une chaîne d’héritage à plusieurs niveaux en une seule opération de collecte. Toutefois, comme les objets sont modifiés directement, une base développée plus tôt peut transmettre les membres déjà copiés de ses ancêtres à une interface dérivée collectée plus tard ; sans cette collecte préalable, la même interface dérivée ne reçoit que les membres directs d’origine de la base.
- Un membre enfant qui redéfinit un membre de base n’est pas rapproché de celui-ci par son nom. Les deux entrées peuvent apparaître, car la déduplication utilise l’identité des objets.
- La correspondance d’héritage repose sur les noms des interfaces de premier niveau analysées. Cette amélioration ne normalise ni les expressions qualifiées ni la fusion de déclarations.
- Le package conserve la dépendance au parseur TypeScript `~4.2.4` et la déclaration de moteur Node.js `>=18` du projet d’origine 0.3.1.
- Les deux packages fournissent le même exécutable `docgen` : utilisez l’un ou l’autre, sans les installer simultanément comme dépendances directes.

Ces limites, y compris les deux ordres de collecte, sont couvertes par des tests de contrat dans ce dépôt de documentation. La comparaison évoluera donc si une future version du fork modifie ce comportement.

## Historique des versions

- Le fork v0.3.x a introduit le package publié séparément `@rdlabo/capacitor-docgen` et une première prise en charge de l’héritage.
- Le fork v0.4.0 a remplacé la détection de l’héritage par l’analyse des clauses d’héritage TypeScript, ajouté `DocsInterface.extends`, résolu les alias d’interfaces et développé les méthodes et propriétés héritées.
- Le fork v0.4.1 a également appliqué le développement des membres hérités à l’interface de l’API principale.

Consultez les sources épinglées du [fork v0.4.1](https://github.com/rdlabo-dev/capacitor-docgen/tree/v0.4.1) et du [projet d’origine v0.3.1](https://github.com/ionic-team/capacitor-docgen/tree/v0.3.1) pour évaluer les versions ultérieures.
