# Plugins

Les plugins définissent les comportements transversaux de l'application : authentification, base de données, gestion des erreurs, documentation, CORS.

Chaque plugin est chargé automatiquement par `@fastify/autoload` depuis ce dossier. Ils sont enregistrés via `fastify-plugin`, ce qui les rend non-encapsulés et accessibles dans toute l'application (décorateurs, hooks).

## Plugins enregistrés

| Fichier | Rôle |
|---------|------|
| `cors.ts` | Autorise les requêtes cross-origin depuis le frontend (`localhost:5173` en dev) |
| `jwt.ts` | Signe et vérifie les JWT ; enregistre `fastify.authenticate` pour protéger les routes |
| `mongodb.ts` | Connecte MongoDB via `@fastify/mongodb` ; expose `fastify.mongo.db` |
| `sensible.ts` | Ajoute `fastify.httpErrors` et les helpers de réponse HTTP |
| `support.ts` | Décorateurs custom partagés entre les routes |
| `swagger.ts` | Génère la spec OpenAPI 3.1 et expose Swagger UI sur `/docs` |

## Utilisation dans une route

```ts
// Protéger une route avec JWT
fastify.get('/me', { onRequest: [fastify.authenticate] }, async (request) => {
  const { userId } = request.user
  // ...
})

// Accéder à MongoDB
const db = fastify.mongo.db!
const users = await db.collection('users').find().toArray()

// Renvoyer une erreur HTTP
throw fastify.httpErrors.notFound('Véhicule introuvable')
```

## Références

- [Guide des plugins Fastify](https://fastify.dev/docs/latest/Guides/Plugins-Guide/)
- [Décorateurs Fastify](https://fastify.dev/docs/latest/Reference/Decorators/)
- [Cycle de vie Fastify](https://fastify.dev/docs/latest/Reference/Lifecycle/)
