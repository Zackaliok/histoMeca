# histoMeca — Backend

API REST de l'application histoMeca, construite avec **Fastify 5** et **TypeScript**.

## Stack

| Outil | Version | Rôle |
|-------|---------|------|
| [Fastify](https://fastify.dev/) | 5 | Framework HTTP |
| TypeScript | 5.9 | Langage |
| [@fastify/mongodb](https://github.com/fastify/fastify-mongodb) | 10 | Connecteur MongoDB |
| [@fastify/autoload](https://github.com/fastify/fastify-autoload) | 6 | Auto-chargement plugins/routes |
| [@fastify/jwt](https://github.com/fastify/fastify-jwt) | — | Authentification JWT |
| [@fastify/sensible](https://github.com/fastify/fastify-sensible) | 6 | Utilitaires HTTP (erreurs, helpers) |
| [@fastify/cors](https://github.com/fastify/fastify-cors) | — | Gestion CORS |
| [@fastify/swagger](https://github.com/fastify/fastify-swagger) | — | Génération spec OpenAPI 3.1 |
| [@fastify/swagger-ui](https://github.com/fastify/fastify-swagger-ui) | — | Interface Swagger UI |
| bcryptjs | — | Hash des mots de passe |
| Node.js test runner + c8 | — | Tests + couverture de code |

---

## Structure

```
histoMeca-back/
├── src/
│   ├── app.ts                  # Configuration Fastify (autoload plugins + routes)
│   ├── plugins/
│   │   ├── cors.ts             # CORS (autorisé : localhost:5173 en dev)
│   │   ├── jwt.ts              # JWT (access token + refresh token)
│   │   ├── mongodb.ts          # Connexion MongoDB (@fastify/mongodb)
│   │   ├── sensible.ts         # Utilitaires HTTP (httpErrors, assert, etc.)
│   │   ├── support.ts          # Décorateurs custom partagés
│   │   └── swagger.ts          # Documentation OpenAPI 3.1
│   └── routes/
│       ├── root.ts             # GET / — health check
│       ├── auth/
│       │   └── index.ts        # POST /auth/login|register|refresh|logout
│       └── vehicles/
│           └── index.ts        # GET /vehicles, POST /vehicles, POST /vehicles/batch
├── test/
│   ├── helper.ts
│   ├── plugins/
│   └── routes/
├── .env                        # Variables d'environnement (non commité)
├── .env.example                # Template des variables d'environnement
├── .gitignore
├── package.json
└── tsconfig.json
```

---

## Variables d'environnement

Copier `.env.example` en `.env` avant le premier lancement :

```bash
cp .env.example .env
```

| Variable | Valeur par défaut | Description |
|----------|-------------------|-------------|
| `MONGODB_URI` | `mongodb://histomeca:histomeca@localhost:27017/histomeca` | URI de connexion MongoDB |
| `HOST` | `0.0.0.0` | Adresse d'écoute Fastify |
| `PORT` | `3000` | Port d'écoute Fastify |
| `LOG_LEVEL` | `info` | Niveau de log |
| `JWT_SECRET` | — | Clé secrète JWT (min. 32 caractères, **obligatoire**) |
| `JWT_EXPIRES_IN` | `15m` | Durée de vie de l'access token |
| `JWT_REFRESH_EXPIRES_DAYS` | `30` | Durée de vie du refresh token (en jours) |

> MongoDB doit être démarré via Docker Compose depuis la racine du projet avant de lancer le backend.

---

## Scripts

```bash
npm run dev       # Build TS + watch + hot reload (développement)
npm run build:ts  # Compilation TypeScript → dist/
npm start         # Production (compile puis démarre)
npm test          # Tests unitaires + couverture de code (c8)
```

---

## Architecture

### Plugins (auto-chargés depuis `src/plugins/`)

| Plugin | Description |
|--------|-------------|
| `cors.ts` | Autorise les requêtes depuis `localhost:5173` (frontend dev) |
| `jwt.ts` | Signe et vérifie les JWT ; expose `fastify.authenticate` pour protéger les routes |
| `mongodb.ts` | Enregistre `@fastify/mongodb`, expose `fastify.mongo.db` dans toute l'app |
| `sensible.ts` | Ajoute les helpers d'erreurs HTTP (`httpErrors`, `assert`, etc.) |
| `support.ts` | Décorateurs custom partagés entre les routes |
| `swagger.ts` | Génère la spec OpenAPI 3.1 et expose Swagger UI sur `/docs` |

### Routes (auto-chargées depuis `src/routes/`)

| Méthode | Chemin | Auth | Description |
|---------|--------|------|-------------|
| `GET` | `/` | — | Health check |
| `POST` | `/auth/register` | — | Création de compte → `{ accessToken, refreshToken }` |
| `POST` | `/auth/login` | — | Connexion → `{ accessToken, refreshToken }` |
| `POST` | `/auth/refresh` | — | Rotation du refresh token → `{ accessToken, refreshToken }` |
| `POST` | `/auth/logout` | JWT | Révocation du refresh token |
| `GET` | `/vehicles` | JWT | Liste tous les véhicules de l'utilisateur connecté |
| `POST` | `/vehicles` | JWT | Crée un véhicule → `{ id }` |
| `POST` | `/vehicles/batch` | JWT | Récupère des véhicules par tableau d'IDs → `Vehicle[]` |

### Authentification

Le système utilise deux tokens :

- **Access token** (JWT, 15 min) — transmis dans le header `Authorization: Bearer <token>`
- **Refresh token** (UUID, 30 jours) — stocké en base (`refreshTokens`), rotation à chaque appel `/auth/refresh`

Pour protéger une route :

```ts
fastify.get('/me', { preHandler: [fastify.authenticate] }, async (request) => {
  const { userId } = request.user
  // ...
})
```

### Documentation OpenAPI

| URL | Contenu |
|-----|---------|
| `http://localhost:3000/docs` | Interface Swagger UI |
| `http://localhost:3000/docs/json` | Spec OpenAPI 3.1 (JSON) |
| `http://localhost:3000/docs/yaml` | Spec OpenAPI 3.1 (YAML) |

Pour documenter une route, ajouter un `schema` à l'option de la route :

```ts
fastify.post('/vehicles', {
  schema: {
    tags: ['vehicles'],
    summary: 'Créer un véhicule',
    body: {
      type: 'object',
      required: ['brand', 'model'],
      properties: {
        brand: { type: 'string' },
        model: { type: 'string' },
      },
    },
    response: {
      201: { type: 'object', properties: { _id: { type: 'string' } } },
    },
  },
}, async (request, reply) => {
  // ...
})
```

### Accès à MongoDB dans une route

```ts
import { FastifyPluginAsync } from 'fastify'
import { ObjectId } from '@fastify/mongodb'

const route: FastifyPluginAsync = async (fastify) => {
  fastify.get('/vehicles', { preHandler: [fastify.authenticate] }, async (request) => {
    const { userId } = request.user
    return fastify.mongo.db!
      .collection('vehicles')
      .find({ userId: new ObjectId(userId) })
      .toArray()
  })
}

export default route
```

---

## Base de données

MongoDB est géré via Docker Compose (voir la racine du projet).

- **Host** : `localhost:27017`
- **Base** : `histomeca`
- **Utilisateur app** : `histomeca` / `histomeca`
- **Collections** : `users`, `vehicles`, `history`, `maintenancePlans`, `refreshTokens`

L'architecture complète est documentée dans [`docs/database-architecture.md`](../docs/database-architecture.md).
