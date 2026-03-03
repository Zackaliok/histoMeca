import fp from 'fastify-plugin'
import fastifyMongodb from '@fastify/mongodb'

/**
 * Connexion à MongoDB via @fastify/mongodb.
 * L'instance est disponible dans toute l'application via fastify.mongo.db
 */
export default fp(async (fastify) => {
  const uri = process.env.MONGODB_URI

  if (!uri) {
    throw new Error('MONGODB_URI manquant dans les variables d\'environnement')
  }

  await fastify.register(fastifyMongodb, {
    forceClose: true,
    url: uri,
  })

  fastify.log.info('MongoDB connecté')
})
