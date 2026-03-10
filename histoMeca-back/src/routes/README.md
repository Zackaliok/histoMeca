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
| `GET` | `/vehicles` | JWT | Liste tous les véhicules de l'utilisateur connecté |
| `POST` | `/vehicles` | JWT | Crée un véhicule → `{ id }` |
| `POST` | `/vehicles/batch` | JWT | Récupère des véhicules par tableau d'IDs → `Vehicle[]` |

## Organisation des fichiers

```
routes/
├── root.ts          # GET /
├── auth/
│   └── index.ts     # Toutes les routes /auth/*
└── vehicles/
    └── index.ts     # Toutes les routes /vehicles/*
```

## Conventions

- Un dossier = un domaine métier (ex: `auth/`, `vehicles/`, `history/`)
- Le fichier `index.ts` du dossier est le plugin racine du domaine
- Les routes protégées utilisent `{ preHandler: [fastify.authenticate] }`
- Chaque route doit exposer un `schema` (body, response) pour la documentation OpenAPI
- Les IDs MongoDB sont toujours convertis via `new ObjectId(userId)` — jamais passés bruts

## Exemple — route protégée

```ts
import { FastifyPluginAsync } from 'fastify'
import { ObjectId } from '@fastify/mongodb'

const routes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/vehicles', { preHandler: [fastify.authenticate] }, async (request) => {
    const { userId } = request.user
    return fastify.mongo.db!
      .collection('vehicles')
      .find({ userId: new ObjectId(userId) })
      .toArray()
  })
}

export default routes
```

## Références

- [Routes Fastify](https://fastify.dev/docs/latest/Reference/Routes/)
- [Plugins Fastify](https://fastify.dev/docs/latest/Reference/Plugins/)
- [Promise resolution](https://fastify.dev/docs/latest/Reference/Routes/#promise-resolution)
