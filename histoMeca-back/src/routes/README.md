# Routes

Les routes définissent les endpoints de l'API. Chaque fichier (ou dossier avec un `index.ts`) est un plugin Fastify chargé automatiquement par `@fastify/autoload`.

## Endpoints actuels

| Méthode | Chemin | Auth | Description |
|---------|--------|------|-------------|
| `GET` | `/` | — | Health check |
| `POST` | `/auth/register` | — | Création de compte → `{ accessToken, refreshToken }` |
| `POST` | `/auth/login` | — | Connexion → `{ accessToken, refreshToken }` |
| `POST` | `/auth/refresh` | — | Rotation des tokens → `{ accessToken, refreshToken }` |
| `POST` | `/auth/logout` | JWT | Révocation du refresh token |

## Organisation des fichiers

```
routes/
├── root.ts          # GET /
└── auth/
    └── index.ts     # Toutes les routes /auth/*
```

## Conventions

- Un dossier = un domaine métier (ex: `auth/`, `vehicles/`, `history/`)
- Le fichier `index.ts` du dossier est le plugin racine du domaine
- Les routes protégées utilisent `{ onRequest: [fastify.authenticate] }`
- Chaque route doit exposer un `schema` (body, response) pour la documentation OpenAPI

## Exemple — route protégée

```ts
import { FastifyPluginAsync } from 'fastify'

const routes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/vehicles', { onRequest: [fastify.authenticate] }, async (request) => {
    const { userId } = request.user
    const db = fastify.mongo.db!
    return db.collection('vehicles').find({ userId }).toArray()
  })
}

export default routes
```

## Références

- [Routes Fastify](https://fastify.dev/docs/latest/Reference/Routes/)
- [Plugins Fastify](https://fastify.dev/docs/latest/Reference/Plugins/)
- [Promise resolution](https://fastify.dev/docs/latest/Reference/Routes/#promise-resolution)
