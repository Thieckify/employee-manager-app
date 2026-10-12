# Employee Manager App

TP Angular, EPF Africa. Annuaire des employés avec CRUD complet sur l'API MockAPI du TP, en **Angular 22 standalone** (aucun `NgModule`) et en **clean architecture**.

## Lancer le projet

```bash
npm install
npm start        # http://localhost:4200
npm test         # tests unitaires (Vitest)
npm run build
```

## Architecture

```
src/app/
├── core/                         CŒUR MÉTIER : aucune dépendance à HTTP ni à l'UI
│   ├── models/
│   │   ├── employe.model.ts        interface Employe, catalogue des rôles, types
│   │   └── employe.errors.ts       erreurs métier (message affichable)
│   ├── repositories/
│   │   └── employe.repository.ts   PORT : contrat d'accès aux données
│   └── services/
│       ├── employe.service.ts      EmployeService : TOUT le métier
│       └── notification.service.ts état des notifications
│
├── infrastructure/               DÉTAILS TECHNIQUES (le seul endroit qui connaît l'API)
│   ├── config/
│   │   └── api-base-url.token.ts      URL de l'API (injectée)
│   ├── dto/                           contrats JSON de l'API
│   │   ├── employe-response.dto.ts    réponse GET / POST / PUT
│   │   ├── create-employe.dto.ts      corps du POST
│   │   └── update-employe.dto.ts      corps du PUT
│   ├── mappers/
│   │   └── employe.mapper.ts          DTO ⇄ modèle du core
│   ├── repositories/
│   │   └── employe-api.repository.ts  ADAPTATEUR HttpClient du port (+ traduction des erreurs HTTP)
│   └── providers/
│       └── provide-employe-api.ts     branche l'adaptateur sur le port
│
├── features/employes/            PRÉSENTATION de la fonctionnalité
│   ├── employes.routes.ts          /employes, /add, /edit/:id
│   ├── pages/                      employe-list, employe-form (état de vue uniquement)
│   └── components/                 carte, tableau, statistiques, badge de rôle (purs)
│
├── shared/ui/                    COMPOSANTS UI RÉUTILISABLES
│   └── icon, avatar, confirm-dialog, toast-outlet
│
├── app.config.ts                 composition root (injection de dépendances)
└── app.routes.ts
```

**Règle de dépendance** : `features` et `shared` → `core` ← `infrastructure`. Le core ne connaît ni Angular HTTP, ni l'URL de l'API, ni l'interface.

### `EmployeService` : tout le métier au même endroit

| Exigence de l'énoncé | Méthode |
| --- | --- |
| Liste (GET) | `getEmployes()` |
| Détail (GET) | `getEmployeById(id)` |
| Ajout (POST) | `addEmploye(saisie)` |
| Modification (PUT) | `updateEmploye(id, saisie)` |
| Suppression (DELETE) | `deleteEmploye(id)` |

Le service applique aussi les règles métier :

- **Nettoyage** : l'API étant partagée, les valeurs parasites (« Invalid faker method… ») et les espaces superflus sont neutralisés.
- **Validation** : champs obligatoires, e-mail valide, rôle du catalogue (Direction, Manager, Lead, Senior, Junior, Stagiaire).
- **E-mail unique** : vérifié sur la liste fraîchement rechargée, sans tenir compte de la casse.
- **Avatar par défaut** : un employé sans photo reçoit un avatar illustré stable.
- **Tri** : par niveau hiérarchique, puis par nom.
- **Recherche** : insensible à la casse et aux accents.
- **Statistiques** : effectif, encadrement, fonctions, répartition par rôle.

Les composants n'ont que de l'état de vue (chargement, filtres, mode grille ou liste, confirmation).

## Routes

| URL | Page |
| --- | --- |
| `/employes` | Équipe : indicateurs, recherche, filtres, grille ou liste, suppression |
| `/add` | Ajout (Reactive Forms, POST) |
| `/edit/:id` | Modification pré-remplie (PUT) |

## Formulaire (Reactive Forms)

Nom (2 à 60 caractères), e-mail obligatoire et valide, fonction obligatoire, rôle obligatoire, URL de photo facultative au format `http(s)://`. Le service ajoute sa propre validation et l'unicité de l'e-mail ; une erreur métier s'affiche sous le champ concerné.

## Design

Design system dans `src/styles/` (jetons clair et sombre, composants partagés). Polices Geist et Instrument Serif. Couleurs de rôles issues d'une palette validée pour le daltonisme. Le mode sombre suit le système. L'interface est responsive, accessible au clavier, et respecte `prefers-reduced-motion`.
