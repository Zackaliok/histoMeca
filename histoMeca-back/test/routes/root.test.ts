import { test, before, after } from 'node:test'
import * as assert from 'node:assert/strict'
import { FastifyInstance } from 'fastify'
import { startMongo, buildApp } from '../helper'

let app: FastifyInstance
let stopMongo: () => Promise<void>

before(async () => {
  const mongo = await startMongo('root_tests')
  stopMongo = mongo.stop
  process.env.MONGODB_URI = mongo.uri
  process.env.JWT_SECRET  = 'test-jwt-secret'
  app = await buildApp()
})

after(async () => {
  await app.close()
  await stopMongo()
})

test('GET / retourne { root: true }', async () => {
  const res = await app.inject({ method: 'GET', url: '/' })
  assert.equal(res.statusCode, 200)
  assert.deepEqual(res.json(), { root: true })
})
