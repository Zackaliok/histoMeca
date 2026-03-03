import fp from 'fastify-plugin'
import fastifySwagger from '@fastify/swagger'
import fastifySwaggerUi from '@fastify/swagger-ui'

/**
 * Documentation OpenAPI 3.x
 * UI disponible sur http://localhost:3000/docs
 * Spec JSON sur    http://localhost:3000/docs/json
 */
export default fp(async (fastify) => {
  await fastify.register(fastifySwagger, {
    openapi: {
      openapi: '3.1.0',
      info: {
        title: 'histoMeca API',
        description: 'API REST de gestion de l\'historique de maintenance des véhicules personnels.',
        version: '1.0.0',
      },
      servers: [
        { url: 'http://localhost:3000', description: 'Développement' },
      ],
      tags: [
        { name: 'auth', description: 'Authentification' },
        { name: 'vehicles', description: 'Gestion des véhicules' },
        { name: 'history', description: 'Historique des opérations' },
        { name: 'maintenance-plans', description: 'Planification des maintenances' },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
    },
  })

  await fastify.register(fastifySwaggerUi, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: true,
      persistAuthorization: true,
    },
  })
})
