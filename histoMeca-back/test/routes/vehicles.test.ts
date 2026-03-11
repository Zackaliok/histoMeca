import { describe, test, before, after, beforeEach } from 'node:test'
import * as assert from 'node:assert/strict'
import { FastifyInstance } from 'fastify'
import { startMongo, buildApp, registerUser } from '../helper'

let app: FastifyInstance
let stopMongo: () => Promise<void>
let accessToken: string

before(async () => {
  const mongo = await startMongo('vehicles_tests')
  stopMongo = mongo.stop
  process.env.MONGODB_URI = mongo.uri
  process.env.JWT_SECRET  = 'test-jwt-secret'
  app = await buildApp()

  // Utilisateur de référence pour tous les tests
  const tokens = await registerUser(app)
  accessToken = tokens.accessToken
})

after(async () => {
  await app.close()
  await stopMongo()
})

beforeEach(async () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (app as any).mongo.db.collection('vehicles').deleteMany({})
})

// ---------------------------------------------------------------------------

function authHeader() {
  return { Authorization: `Bearer ${accessToken}` }
}

const VEHICLE = {
  type:    'auto',
  brand:   'Renault',
  model:   'Clio',
  plate:   'AB-123-CD',
  year:    2020,
  fuel:    'essence',
  mileage: { current: 50000 },
}

// ---------------------------------------------------------------------------
// GET /vehicles
// ---------------------------------------------------------------------------

describe('GET /vehicles', () => {
  test('retourne 401 sans token', async () => {
    const res = await app.inject({ method: 'GET', url: '/vehicles' })
    assert.equal(res.statusCode, 401)
  })

  test('retourne un tableau vide pour un nouvel utilisateur', async () => {
    const res = await app.inject({ method: 'GET', url: '/vehicles', headers: authHeader() })
    assert.equal(res.statusCode, 200)
    assert.deepEqual(res.json(), [])
  })

  test('retourne les véhicules de l\'utilisateur', async () => {
    await app.inject({ method: 'POST', url: '/vehicles', headers: authHeader(), payload: VEHICLE })

    const res = await app.inject({ method: 'GET', url: '/vehicles', headers: authHeader() })
    assert.equal(res.statusCode, 200)
    const vehicles = res.json<{ brand: string; plate: string }[]>()
    assert.equal(vehicles.length, 1)
    assert.equal(vehicles[0].brand, 'Renault')
    assert.equal(vehicles[0].plate, 'AB-123-CD')
  })

  test('ne retourne pas les véhicules d\'un autre utilisateur', async () => {
    await app.inject({ method: 'POST', url: '/vehicles', headers: authHeader(), payload: VEHICLE })

    // Second utilisateur
    const { accessToken: otherToken } = await registerUser(app, {
      email: 'other@test.com', password: 'password123',
    })
    const res = await app.inject({
      method: 'GET', url: '/vehicles',
      headers: { Authorization: `Bearer ${otherToken}` },
    })
    assert.equal(res.statusCode, 200)
    assert.deepEqual(res.json(), [])
  })
})

// ---------------------------------------------------------------------------
// POST /vehicles
// ---------------------------------------------------------------------------

describe('POST /vehicles', () => {
  test('retourne 401 sans token', async () => {
    const res = await app.inject({ method: 'POST', url: '/vehicles', payload: VEHICLE })
    assert.equal(res.statusCode, 401)
  })

  test('crée un véhicule et retourne son id (201)', async () => {
    const res = await app.inject({ method: 'POST', url: '/vehicles', headers: authHeader(), payload: VEHICLE })
    assert.equal(res.statusCode, 201)
    const body = res.json<{ id: string }>()
    assert.ok(body.id)
    assert.match(body.id, /^[a-f0-9]{24}$/)
  })

  test('retourne 409 pour une immatriculation en double', async () => {
    await app.inject({ method: 'POST', url: '/vehicles', headers: authHeader(), payload: VEHICLE })
    const res = await app.inject({ method: 'POST', url: '/vehicles', headers: authHeader(), payload: VEHICLE })
    assert.equal(res.statusCode, 409)
  })

  test('retourne 400 si le type est invalide', async () => {
    const res = await app.inject({
      method: 'POST', url: '/vehicles', headers: authHeader(),
      payload: { ...VEHICLE, type: 'scooter' },
    })
    assert.equal(res.statusCode, 400)
  })

  test('retourne 400 si brand est manquant', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { brand: _brand, ...withoutBrand } = VEHICLE
    const res = await app.inject({
      method: 'POST', url: '/vehicles', headers: authHeader(),
      payload: withoutBrand,
    })
    assert.equal(res.statusCode, 400)
  })

  test('retourne 400 si plate est manquant', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { plate: _plate, ...withoutPlate } = VEHICLE
    const res = await app.inject({
      method: 'POST', url: '/vehicles', headers: authHeader(),
      payload: withoutPlate,
    })
    assert.equal(res.statusCode, 400)
  })
})

// ---------------------------------------------------------------------------
// POST /vehicles/batch
// ---------------------------------------------------------------------------

describe('POST /vehicles/batch', () => {
  test('retourne 401 sans token', async () => {
    const res = await app.inject({
      method: 'POST', url: '/vehicles/batch',
      payload: { ids: ['000000000000000000000000'] },
    })
    assert.equal(res.statusCode, 401)
  })

  test('retourne les véhicules correspondant aux IDs', async () => {
    const createRes = await app.inject({ method: 'POST', url: '/vehicles', headers: authHeader(), payload: VEHICLE })
    const { id } = createRes.json<{ id: string }>()

    const res = await app.inject({
      method: 'POST', url: '/vehicles/batch', headers: authHeader(),
      payload: { ids: [id] },
    })
    assert.equal(res.statusCode, 200)
    const vehicles = res.json<{ id: string }[]>()
    assert.equal(vehicles.length, 1)
    assert.equal(vehicles[0].id, id)
  })

  test('retourne un tableau vide pour des IDs inconnus', async () => {
    const res = await app.inject({
      method: 'POST', url: '/vehicles/batch', headers: authHeader(),
      payload: { ids: ['000000000000000000000000'] },
    })
    assert.equal(res.statusCode, 200)
    assert.deepEqual(res.json(), [])
  })

  test('retourne 400 si ids est vide', async () => {
    const res = await app.inject({
      method: 'POST', url: '/vehicles/batch', headers: authHeader(),
      payload: { ids: [] },
    })
    assert.equal(res.statusCode, 400)
  })
})
