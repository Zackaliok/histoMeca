# histoMeca

Application web de suivi et d'historique de maintenance pour véhicules personnels (moto & auto).

## Objectif

histoMeca permet de centraliser toutes les informations liées à vos véhicules :

- **Historique des opérations** : interventions mécaniques, vidanges, changements de pièces, etc.
- **Carnet de bord** : kilométrages, notes diverses, informations utiles par véhicule
- **Planification** : suivi des prochaines maintenances à effectuer
- **Multi-véhicules** : gestion simultanée de plusieurs véhicules (moto et auto)
- **Multi-utilisateurs** : chaque utilisateur gère ses propres véhicules de façon isolée

---

## Stack technique

| Couche | Technologie |
|--------|-------------|
| Backend | [Fastify 5](https://fastify.dev/) + TypeScript |
| Frontend | [React 19](https://react.dev/) + TypeScript + [Vite 7](https://vitejs.dev/) |
| UI | [Tailwind CSS 4](https://tailwindcss.com/) + [DaisyUI 5](https://daisyui.com/) |
| Base de données | [MongoDB 8](https://www.mongodb.com/) (NoSQL) |
| Environnement | [Docker](https://www.docker.com/) + Docker Compose |
| Tests (back) | Node.js native test runner + c8 (coverage) |

---

## Structure du projet

```
histoMeca/
├── docker-compose.yml      # MongoDB + Mongo Express
├── mongo-init.js           # Init DB : collections, index, utilisateur
├── docs/
│   └── database-architecture.md  # Architecture MongoDB détaillée
├── histoMeca-back/         # API REST (Fastify + TypeScript)
└── histoMeca-front/        # Interface web (React + Vite)
```

---

## Démarrage

### Prérequis

- Node.js ≥ 20
- npm
- Docker + Docker Compose

### 1. Base de données

```bash
# Depuis la racine du projet
docker compose up -d
```

Lance MongoDB sur `localhost:27017` et Mongo Express (UI) sur `http://localhost:8081`.

### 2. Backend

```bash
cd histoMeca-back
npm install
cp .env.example .env   # à faire une seule fois
npm run dev
```

L'API démarre sur `http://localhost:3000`.

### 3. Frontend

```bash
cd histoMeca-front
npm install
npm run dev
```

L'interface démarre sur `http://localhost:5173`.

---

## Services

| Service | URL | Description |
|---------|-----|-------------|
| API Fastify | `http://localhost:3000` | API REST |
| Swagger UI | `http://localhost:3000/docs` | Documentation interactive de l'API |
| Frontend React | `http://localhost:5173` | Interface web |
| Mongo Express | `http://localhost:8081` | Interface d'administration MongoDB |
| MongoDB | `localhost:27017` | Base de données |

---

## Backend — histoMeca-back

API REST Fastify avec architecture plugin et auto-chargement. Authentification JWT double-token (access + refresh). Voir le [README dédié](histoMeca-back/README.md).

## Frontend — histoMeca-front

Interface React + Vite avec Tailwind CSS 4 et DaisyUI 5. Routing via react-router-dom, authentification gérée côté client. Voir le [README dédié](histoMeca-front/README.md).

## Base de données

Architecture MongoDB documentée dans [docs/database-architecture.md](docs/database-architecture.md).

Collections : `users`, `vehicles`, `history`, `maintenancePlans`.

---

## Statut du projet

> En cours de développement

- [x] Scaffold backend (Fastify 5 + TypeScript)
- [x] Scaffold frontend (React 19 + Vite + TypeScript + Tailwind CSS 4 + DaisyUI 5)
- [x] Base de données MongoDB (Docker Compose + init script + index)
- [x] Connexion MongoDB dans Fastify (`@fastify/mongodb`)
- [x] Architecture BDD documentée (4 collections, schémas, index, requêtes)
- [x] Authentification JWT (login, register, refresh, logout) — backend
- [x] Service d'authentification frontend (`authService`)
- [x] Landing page publique avec lien de connexion
- [x] Page de connexion (`LoginForm`)
- [x] Dashboard utilisateur connecté
- [x] Sidebar de navigation par véhicule (menu déroulant par onglet)
- [x] Modale d'ajout de véhicule
- [x] Routing frontend (react-router-dom) avec route protégée
- [x] API véhicules — créer, lister, récupérer par IDs (backend)
- [x] Service véhicules frontend (`vehicleService`) + intégration dashboard
- [ ] Historique des opérations
- [ ] Planification des maintenances
