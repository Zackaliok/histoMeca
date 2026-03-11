import * as path from 'node:path'
import { FastifyInstance } from 'fastify'
import { MongoMemoryServer } from 'mongodb-memory-server'

// eslint-disable-next-line @typescript-eslint/no-require-imports
const cliHelper = require('fastify-cli/helper.js')

const AppPath = path.join(__dirname, '..', 'src', 'app.ts')

/**
 * Démarre une instance MongoDB en mémoire et renvoie l'URI + le handle pour l'arrêt.
 * @param dbName  Nom de la base — permet d'isoler plusieurs suites de tests.
 */
export async function startMongo(dbName: string): Promise<{ uri: string; stop: () => Promise<void> }> {
  const mongod = await MongoMemoryServer.create()
  const uri = `${mongod.getUri()}${dbName}`
  return { uri, stop: async () => { await mongod.stop() } }
}

/**
 * Construit une instance Fastify complète à partir du code source.
 * MONGODB_URI et JWT_SECRET doivent être positionnés dans process.env avant l'appel.
 */
export async function buildApp(): Promise<FastifyInstance> {
  return cliHelper.build([AppPath], { skipOverride: true }) as Promise<FastifyInstance>
}

/**
 * Inscrit un utilisateur et renvoie sa paire de tokens.
 */
export async function registerUser(
  app: FastifyInstance,
  credentials = { email: 'user@test.com', password: 'password123' },
): Promise<{ accessToken: string; refreshToken: string }> {
  const res = await app.inject({
    method:  'POST',
    url:     '/auth/register',
    payload: credentials,
  })
  return res.json() as { accessToken: string; refreshToken: string }
}
