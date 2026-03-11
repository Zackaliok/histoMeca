import { test, before, after } from 'node:test'
import * as assert from 'node:assert/strict'
import { FastifyInstance } from 'fastify'
import { startMongo, buildApp, registerUser } from '../helper'

let app: FastifyInstance
let stopMongo: () => Promise<void>

before(async () => {
  const mongo = await startMongo('example_tests')
  stopMongo = mongo.stop
  process.env.MONGODB_URI = mongo.uri
  process.env.JWT_SECRET  = 'test-jwt-secret'
  app = await buildApp()
})

after(async () => {
  await app.close()
  await stopMongo()
})

test('GET /example retourne 401 sans token', async () => {
  const res = await app.inject({ method: 'GET', url: '/example' })
  assert.equal(res.statusCode, 401)
})

test('GET /example retourne 200 avec un token valide', async () => {
  const { accessToken } = await registerUser(app, { email: 'ex@test.com', password: 'password123' })
  const res = await app.inject({
    method:  'GET',
    url:     '/example',
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  assert.equal(res.statusCode, 200)
  assert.equal(res.payload, '"this is an example"')
})
