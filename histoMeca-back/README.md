# histoMeca — Backend

API REST de l'application histoMeca, construite avec **Fastify 5** et **TypeScript**.

## Stack

| Outil | Version | Rôle |
|-------|---------|------|
| [Fastify](https://fastify.dev/) | 5 | Framework HTTP |
| TypeScript | 5.9 | Langage |
| [@fastify/mongodb](https://github.com/fastify/fastify-mongodb) | 10 | Connecteur MongoDB |
| [@fastify/autoload](https://github.com/fastify/fastify-autoload) | 6 | Auto-chargement plugins/routes |
| [@fastify/sensible](https://github.com/fastify/fastify-sensible) | 6 | Utilitaires HTTP (erreurs, helpers) |
| [@fastify/swagger](https://github.com/fastify/fastify-swagger) | — | Génération spec OpenAPI 3.1 |
| [@fastify/swagger-ui](https://github.com/fastify/fastify-swagger-ui) | — | Interface Swagger UI |
| Node.js test runner + c8 | — | Tests + couverture de code |

---

## Structure

```
histoMeca-back/
├── src/
│   ├── app.ts                  # Configuration Fastify (autoload plugins + routes)
│   ├── plugins/
│   │   ├── mongodb.ts          # Connexion MongoDB (@fastify/mongodb)
│   │   ├── sensible.ts         # Plugin utilitaires HTTP
│   │   ├── support.ts          # Plugin custom (décorateurs partagés)
│   │   └── swagger.ts          # Documentation OpenAPI (@fastify/swagger + swagger-ui)
│   └── routes/
│       ├── root.ts             # GET /
│       └── example/index.ts    # GET /example
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
| `swagger.ts` | Génère la spec OpenAPI 3.1 et expose Swagger UI sur `/docs` |
| `mongodb.ts` | Enregistre `@fastify/mongodb`, expose `fastify.mongo.db` dans toute l'app |
| `sensible.ts` | Ajoute les helpers d'erreurs HTTP (`httpErrors`, `assert`, etc.) |
| `support.ts` | Décorateurs custom partagés entre les routes |

### Documentation OpenAPI

| URL | Contenu |
|-----|---------|
| `http://localhost:3000/docs` | Interface Swagger UI |
| `http://localhost:3000/docs/json` | Spec OpenAPI 3.1 (JSON) |
| `http://localhost:3000/docs/yaml` | Spec OpenAPI 3.1 (YAML) |

Pour documenter une route, ajouter un `schema` à l'option de la route :

```ts
fastify.get('/vehicles', {
  schema: {
    tags: ['vehicles'],
    summary: 'Liste tous les véhicules de l\'utilisateur',
    response: {
      200: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            _id:   { type: 'string' },
            brand: { type: 'string' },
            model: { type: 'string' },
          },
        },
      },
    },
  },
}, async (request, reply) => {
  // ...
})
```

### Routes (auto-chargées depuis `src/routes/`)

| Méthode | Chemin | Description |
|---------|--------|-------------|
| `GET` | `/` | Health check |
| `GET` | `/example` | Route exemple |

### Accès à MongoDB dans une route

```ts
import { FastifyPluginAsync } from 'fastify'

const route: FastifyPluginAsync = async (fastify) => {
  fastify.get('/vehicles', async (request, reply) => {
    const db = fastify.mongo.db!
    const vehicles = await db.collection('vehicles').find().toArray()
    return vehicles
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
- **Collections** : `users`, `vehicles`, `history`, `maintenancePlans`

L'architecture complète est documentée dans [`docs/database-architecture.md`](../docs/database-architecture.md).
