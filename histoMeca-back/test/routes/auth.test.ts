import { describe, test, before, after, beforeEach } from 'node:test'
import * as assert from 'node:assert/strict'
import { FastifyInstance } from 'fastify'
import { startMongo, buildApp } from '../helper'

let app: FastifyInstance
let stopMongo: () => Promise<void>

before(async () => {
  const mongo = await startMongo('auth_tests')
  stopMongo = mongo.stop
  process.env.MONGODB_URI = mongo.uri
  process.env.JWT_SECRET  = 'test-jwt-secret'
  app = await buildApp()
})

after(async () => {
  await app.close()
  await stopMongo()
})

beforeEach(async () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = (app as any).mongo.db
  await db.collection('users').deleteMany({})
  await db.collection('refreshTokens').deleteMany({})
})

const USER = { email: 'test@example.com', password: 'password123' }

// ---------------------------------------------------------------------------
// POST /auth/register
// ---------------------------------------------------------------------------

describe('POST /auth/register', () => {
  test('crée un compte et retourne les tokens (201)', async () => {
    const res = await app.inject({ method: 'POST', url: '/auth/register', payload: USER })
    assert.equal(res.statusCode, 201)
    const body = res.json<{ accessToken: string; refreshToken: string }>()
    assert.ok(body.accessToken)
    assert.ok(body.refreshToken)
  })

  test('retourne 409 si l\'email est déjà utilisé', async () => {
    await app.inject({ method: 'POST', url: '/auth/register', payload: USER })
    const res = await app.inject({ method: 'POST', url: '/auth/register', payload: USER })
    assert.equal(res.statusCode, 409)
  })

  test('retourne 400 si l\'email est invalide', async () => {
    const res = await app.inject({
      method: 'POST', url: '/auth/register',
      payload: { email: 'pas-un-email', password: 'password123' },
    })
    assert.equal(res.statusCode, 400)
  })

  test('retourne 400 si le mot de passe fait moins de 8 caractères', async () => {
    const res = await app.inject({
      method: 'POST', url: '/auth/register',
      payload: { email: 'test@example.com', password: '1234567' },
    })
    assert.equal(res.statusCode, 400)
  })

  test('retourne 400 si le body est vide', async () => {
    const res = await app.inject({ method: 'POST', url: '/auth/register', payload: {} })
    assert.equal(res.statusCode, 400)
  })
})

// ---------------------------------------------------------------------------
// POST /auth/login
// ---------------------------------------------------------------------------

describe('POST /auth/login', () => {
  test('retourne les tokens (200) avec des identifiants valides', async () => {
    await app.inject({ method: 'POST', url: '/auth/register', payload: USER })
    const res = await app.inject({ method: 'POST', url: '/auth/login', payload: USER })
    assert.equal(res.statusCode, 200)
    const body = res.json<{ accessToken: string; refreshToken: string }>()
    assert.ok(body.accessToken)
    assert.ok(body.refreshToken)
  })

  test('retourne 401 avec un mauvais mot de passe', async () => {
    await app.inject({ method: 'POST', url: '/auth/register', payload: USER })
    const res = await app.inject({
      method: 'POST', url: '/auth/login',
      payload: { email: USER.email, password: 'mauvaismdp' },
    })
    assert.equal(res.statusCode, 401)
  })

  test('retourne 401 avec un email inconnu', async () => {
    const res = await app.inject({
      method: 'POST', url: '/auth/login',
      payload: { email: 'inconnu@example.com', password: 'password123' },
    })
    assert.equal(res.statusCode, 401)
  })
})

// ---------------------------------------------------------------------------
// POST /auth/refresh
// ---------------------------------------------------------------------------

describe('POST /auth/refresh', () => {
  test('retourne une nouvelle paire de tokens (200)', async () => {
    const { refreshToken } = await (
      await app.inject({ method: 'POST', url: '/auth/register', payload: USER })
    ).json<{ refreshToken: string }>()

    const res = await app.inject({ method: 'POST', url: '/auth/refresh', payload: { refreshToken } })
    assert.equal(res.statusCode, 200)
    const body = res.json<{ accessToken: string; refreshToken: string }>()
    assert.ok(body.accessToken)
    assert.ok(body.refreshToken)
  })

  test('le nouveau refreshToken est différent de l\'ancien (rotation)', async () => {
    const { refreshToken: old } = await (
      await app.inject({ method: 'POST', url: '/auth/register', payload: USER })
    ).json<{ refreshToken: string }>()

    const { refreshToken: next } = await (
      await app.inject({ method: 'POST', url: '/auth/refresh', payload: { refreshToken: old } })
    ).json<{ refreshToken: string }>()

    assert.notEqual(next, old)
  })

  test('retourne 401 avec un token invalide', async () => {
    const res = await app.inject({ method: 'POST', url: '/auth/refresh', payload: { refreshToken: 'faux-token' } })
    assert.equal(res.statusCode, 401)
  })

  test('invalide le token après rotation (prévention du rejeu)', async () => {
    const { refreshToken } = await (
      await app.inject({ method: 'POST', url: '/auth/register', payload: USER })
    ).json<{ refreshToken: string }>()

    await app.inject({ method: 'POST', url: '/auth/refresh', payload: { refreshToken } })

    // Réutilisation du même token — doit échouer
    const res = await app.inject({ method: 'POST', url: '/auth/refresh', payload: { refreshToken } })
    assert.equal(res.statusCode, 401)
  })
})

// ---------------------------------------------------------------------------
// POST /auth/logout
// ---------------------------------------------------------------------------

describe('POST /auth/logout', () => {
  test('retourne 204 et révoque le refresh token', async () => {
    const { accessToken, refreshToken } = await (
      await app.inject({ method: 'POST', url: '/auth/register', payload: USER })
    ).json<{ accessToken: string; refreshToken: string }>()

    const res = await app.inject({
      method:  'POST',
      url:     '/auth/logout',
      headers: { Authorization: `Bearer ${accessToken}` },
      payload: { refreshToken },
    })
    assert.equal(res.statusCode, 204)

    // Le refresh token ne doit plus fonctionner
    const refreshRes = await app.inject({
      method: 'POST', url: '/auth/refresh', payload: { refreshToken },
    })
    assert.equal(refreshRes.statusCode, 401)
  })

  test('retourne 401 sans access token', async () => {
    const res = await app.inject({
      method:  'POST',
      url:     '/auth/logout',
      payload: { refreshToken: 'quelconque' },
    })
    assert.equal(res.statusCode, 401)
  })
})
