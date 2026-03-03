import { FastifyPluginAsync } from 'fastify'
import bcrypt from 'bcryptjs'
import { randomUUID } from 'node:crypto'
import { ObjectId } from '@fastify/mongodb'

const SALT_ROUNDS = 12

// Durée de vie du refresh token en ms (défaut 30 jours)
function refreshExpiresAt(): Date {
  const days = parseInt(process.env.JWT_REFRESH_EXPIRES_DAYS ?? '30', 10)
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000)
}

// Schémas réutilisables
const tokenResponseSchema = {
  type: 'object',
  properties: {
    accessToken:  { type: 'string' },
    refreshToken: { type: 'string' },
  },
}

const auth: FastifyPluginAsync = async (fastify) => {
  /**
   * POST /auth/register
   * Crée un compte utilisateur et retourne les deux tokens.
   */
  fastify.post('/register', {
    schema: {
      tags: ['auth'],
      summary: 'Créer un compte',
      body: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email:     { type: 'string', format: 'email', maxLength: 254 },
          password:  { type: 'string', minLength: 8, maxLength: 128 },
          firstName: { type: 'string', maxLength: 100 },
          lastName:  { type: 'string', maxLength: 100 },
        },
        additionalProperties: false,
      },
      response: {
        201: tokenResponseSchema,
      },
    },
  }, async (request, reply) => {
    const { email, password, firstName = '', lastName = '' } = request.body as {
      email: string
      password: string
      firstName?: string
      lastName?: string
    }

    const users = fastify.mongo.db!.collection('users')

    if (await users.findOne({ email })) {
      return reply.conflict('Un compte avec cet email existe déjà.')
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS)
    const now = new Date()

    const { insertedId } = await users.insertOne({
      email,
      passwordHash,
      profile: { firstName, lastName },
      createdAt: now,
      updatedAt: now,
    })

    const tokens = await createTokenPair(fastify, insertedId.toString())
    return reply.status(201).send(tokens)
  })

  /**
   * POST /auth/login
   * Authentifie un utilisateur et retourne les deux tokens.
   * Message d'erreur volontairement générique pour ne pas révéler
   * si l'email est enregistré ou non (protection contre l'énumération).
   */
  fastify.post('/login', {
    schema: {
      tags: ['auth'],
      summary: 'Se connecter',
      body: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email:    { type: 'string', format: 'email' },
          password: { type: 'string' },
        },
        additionalProperties: false,
      },
      response: {
        200: tokenResponseSchema,
      },
    },
  }, async (request, reply) => {
    const { email, password } = request.body as { email: string; password: string }

    const user = await fastify.mongo.db!.collection('users').findOne({ email })

    // bcrypt.compare s'exécute même si user est null pour éviter
    // les timing attacks (durée constante quelle que soit la branche)
    const passwordHash = user?.passwordHash ?? '$2b$12$invalidhashtopreventtimingattacks'
    const valid = await bcrypt.compare(password, passwordHash)

    if (!user || !valid) {
      return reply.unauthorized('Identifiants invalides.')
    }

    const tokens = await createTokenPair(fastify, user._id.toString())
    return reply.send(tokens)
  })

  /**
   * POST /auth/refresh
   * Échange un refreshToken valide contre une nouvelle paire de tokens.
   * Rotation : l'ancien refreshToken est supprimé (prévention du rejeu).
   */
  fastify.post('/refresh', {
    schema: {
      tags: ['auth'],
      summary: 'Rafraîchir les tokens',
      body: {
        type: 'object',
        required: ['refreshToken'],
        properties: {
          refreshToken: { type: 'string' },
        },
        additionalProperties: false,
      },
      response: {
        200: tokenResponseSchema,
      },
    },
  }, async (request, reply) => {
    const { refreshToken } = request.body as { refreshToken: string }

    const stored = await fastify.mongo.db!
      .collection('refreshTokens')
      .findOne({ token: refreshToken })

    if (!stored || stored.expiresAt < new Date()) {
      // Supprimer le token expiré s'il existe encore
      if (stored) {
        await fastify.mongo.db!.collection('refreshTokens').deleteOne({ token: refreshToken })
      }
      return reply.unauthorized('Refresh token invalide ou expiré.')
    }

    // Rotation : supprimer l'ancien avant d'en créer un nouveau
    await fastify.mongo.db!.collection('refreshTokens').deleteOne({ token: refreshToken })

    const tokens = await createTokenPair(fastify, stored.userId.toString())
    return reply.send(tokens)
  })

  /**
   * POST /auth/logout
   * Révoque le refreshToken (déconnexion effective côté serveur).
   */
  fastify.post('/logout', {
    schema: {
      tags: ['auth'],
      summary: 'Se déconnecter',
      security: [{ bearerAuth: [] }],
      body: {
        type: 'object',
        required: ['refreshToken'],
        properties: {
          refreshToken: { type: 'string' },
        },
        additionalProperties: false,
      },
      response: {
        204: { type: 'null', description: 'Déconnexion réussie' },
      },
    },
    preHandler: [fastify.authenticate],
  }, async (request, reply) => {
    const { refreshToken } = request.body as { refreshToken: string }

    await fastify.mongo.db!
      .collection('refreshTokens')
      .deleteOne({ token: refreshToken })

    return reply.status(204).send()
  })
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Crée une paire accessToken / refreshToken pour un userId donné.
 * Le refreshToken est stocké en base avec une date d'expiration.
 */
async function createTokenPair(
  fastify: Parameters<FastifyPluginAsync>[0],
  userId: string
): Promise<{ accessToken: string; refreshToken: string }> {
  const accessToken  = fastify.jwt.sign({ userId })
  const refreshToken = randomUUID()
  const expiresAt    = refreshExpiresAt()

  await fastify.mongo.db!.collection('refreshTokens').insertOne({
    token:     refreshToken,
    userId:    new ObjectId(userId),
    expiresAt,
    createdAt: new Date(),
  })

  return { accessToken, refreshToken }
}

export default auth
