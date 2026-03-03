import fp from 'fastify-plugin'
import fastifyJwt from '@fastify/jwt'
import { FastifyReply, FastifyRequest } from 'fastify'

/**
 * Plugin JWT — @fastify/jwt
 *
 * - Enregistre le plugin JWT avec le secret depuis les variables d'environnement
 * - Expose le décorateur `fastify.authenticate` utilisable en preHandler sur les routes protégées
 * - Le payload du token contient { userId: string }
 *
 * Stratégie double token :
 *   - accessToken  : durée courte (défaut 15m) — transmis dans le header Authorization
 *   - refreshToken : durée longue (défaut 30d) — UUID aléatoire stocké en base
 */
export default fp(async (fastify) => {
  const secret = process.env.JWT_SECRET

  if (!secret) {
    throw new Error('JWT_SECRET manquant dans les variables d\'environnement')
  }

  await fastify.register(fastifyJwt, {
    secret,
    sign: {
      expiresIn: process.env.JWT_EXPIRES_IN ?? '15m',
    },
  })

  fastify.decorate(
    'authenticate',
    async function (request: FastifyRequest, reply: FastifyReply): Promise<void> {
      try {
        await request.jwtVerify()
      } catch {
        reply.unauthorized('Token invalide ou expiré.')
      }
    }
  )
})

// Typage du payload JWT pour tout le projet
declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: { userId: string }
    user:    { userId: string }
  }
}

// Typage du décorateur sur l'instance Fastify
declare module 'fastify' {
  interface FastifyInstance {
    authenticate(request: FastifyRequest, reply: FastifyReply): Promise<void>
  }
}
