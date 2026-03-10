import { FastifyPluginAsync } from 'fastify'
import { ObjectId } from '@fastify/mongodb'

// Schéma de réponse réutilisable pour un véhicule
const vehicleSchema = {
  type: 'object',
  properties: {
    id:              { type: 'string' },
    type:            { type: 'string' },
    brand:           { type: 'string' },
    model:           { type: 'string' },
    year:            { type: ['integer', 'null'] },
    plate:           { type: 'string' },
    vin:             { type: ['string', 'null'] },
    fuel:            { type: ['string', 'null'] },
    color:           { type: ['string', 'null'] },
    purchaseDate:    { type: ['string', 'null'] },
    purchaseMileage: { type: ['integer', 'null'] },
    mileage: {
      type: ['object', 'null'],
      properties: {
        current:   { type: 'integer' },
        updatedAt: { type: 'string' },
      },
    },
    nextService: {
      type: ['object', 'null'],
      properties: {
        date:    { type: ['string', 'null'] },
        mileage: { type: ['integer', 'null'] },
        label:   { type: ['string', 'null'] },
      },
    },
    notes:     { type: ['string', 'null'] },
    createdAt: { type: 'string' },
    updatedAt: { type: 'string' },
  },
}

// Sérialise un document MongoDB en objet de réponse
function serializeVehicle(doc: Record<string, unknown>) {
  return {
    ...doc,
    id: (doc._id as ObjectId).toString(),
    _id: undefined,
    userId: undefined,
  }
}

const vehicles: FastifyPluginAsync = async (fastify) => {
  /**
   * GET /vehicles
   * Retourne tous les véhicules de l'utilisateur authentifié.
   */
  fastify.get('/', {
    schema: {
      tags: ['vehicles'],
      summary: 'Lister mes véhicules',
      security: [{ bearerAuth: [] }],
      response: {
        200: {
          type: 'array',
          items: vehicleSchema,
        },
      },
    },
    preHandler: [fastify.authenticate],
  }, async (request, reply) => {
    const { userId } = request.user

    const docs = await fastify.mongo.db!
      .collection('vehicles')
      .find({ userId: new ObjectId(userId) })
      .sort({ createdAt: -1 })
      .toArray()

    return reply.send(docs.map(serializeVehicle))
  })

  /**
   * POST /vehicles/batch
   * Retourne les véhicules correspondant à un tableau d'IDs,
   * filtrés sur l'utilisateur authentifié (sécurité : pas d'accès cross-user).
   */
  fastify.post('/batch', {
    schema: {
      tags: ['vehicles'],
      summary: 'Récupérer des véhicules par IDs',
      security: [{ bearerAuth: [] }],
      body: {
        type: 'object',
        required: ['ids'],
        additionalProperties: false,
        properties: {
          ids: {
            type: 'array',
            items: { type: 'string' },
            minItems: 1,
            maxItems: 100,
          },
        },
      },
      response: {
        200: {
          type: 'array',
          items: vehicleSchema,
        },
      },
    },
    preHandler: [fastify.authenticate],
  }, async (request, reply) => {
    const { userId } = request.user
    const { ids } = request.body as { ids: string[] }

    const objectIds = ids.flatMap((id) => {
      try { return [new ObjectId(id)] } catch { return [] }
    })

    const docs = await fastify.mongo.db!
      .collection('vehicles')
      .find({
        _id:    { $in: objectIds },
        userId: new ObjectId(userId),
      })
      .toArray()

    return reply.send(docs.map(serializeVehicle))
  })

  /**
   * POST /vehicles
   * Crée un véhicule lié à l'utilisateur authentifié.
   */
  fastify.post('/', {
    schema: {
      tags: ['vehicles'],
      summary: 'Ajouter un véhicule',
      security: [{ bearerAuth: [] }],
      body: {
        type: 'object',
        required: ['type', 'brand', 'model', 'plate'],
        additionalProperties: false,
        properties: {
          type:             { type: 'string', enum: ['auto', 'moto', 'utilitaire', 'autre'] },
          brand:            { type: 'string', maxLength: 100 },
          model:            { type: 'string', maxLength: 100 },
          year:             { type: 'integer', minimum: 1900, maximum: 2100 },
          plate:            { type: 'string', maxLength: 20 },
          vin:              { type: 'string', maxLength: 17 },
          fuel:             { type: 'string', enum: ['essence', 'diesel', 'hybride', 'electrique', 'autre'] },
          color:            { type: 'string', maxLength: 50 },
          purchaseDate:     { type: 'string', format: 'date-time' },
          purchaseMileage:  { type: 'integer', minimum: 0 },
          mileage: {
            type: 'object',
            required: ['current'],
            additionalProperties: false,
            properties: {
              current:   { type: 'integer', minimum: 0 },
              updatedAt: { type: 'string', format: 'date-time' },
            },
          },
          nextService: {
            type: 'object',
            additionalProperties: false,
            properties: {
              date:    { type: 'string', format: 'date-time' },
              mileage: { type: 'integer', minimum: 0 },
              label:   { type: 'string', maxLength: 200 },
            },
          },
          notes: { type: 'string', maxLength: 2000 },
        },
      },
      response: {
        201: {
          type: 'object',
          properties: {
            id: { type: 'string' },
          },
        },
      },
    },
    preHandler: [fastify.authenticate],
  }, async (request, reply) => {
    const { userId } = request.user

    const body = request.body as {
      type: string
      brand: string
      model: string
      plate: string
      year?: number
      vin?: string
      fuel?: string
      color?: string
      purchaseDate?: string
      purchaseMileage?: number
      mileage?: { current: number; updatedAt?: string }
      nextService?: { date?: string; mileage?: number; label?: string }
      notes?: string
    }

    const collection = fastify.mongo.db!.collection('vehicles')

    const existing = await collection.findOne({
      userId: new ObjectId(userId),
      plate: body.plate,
    })

    if (existing) {
      return reply.conflict('Un véhicule avec cette immatriculation existe déjà.')
    }

    const now = new Date()

    const { insertedId } = await collection.insertOne({
      userId: new ObjectId(userId),
      type: body.type,
      brand: body.brand,
      model: body.model,
      year: body.year ?? null,
      plate: body.plate,
      vin: body.vin ?? null,
      fuel: body.fuel ?? null,
      color: body.color ?? null,
      purchaseDate: body.purchaseDate ? new Date(body.purchaseDate) : null,
      purchaseMileage: body.purchaseMileage ?? null,
      mileage: body.mileage
        ? { current: body.mileage.current, updatedAt: body.mileage.updatedAt ? new Date(body.mileage.updatedAt) : now }
        : null,
      nextService: body.nextService
        ? {
            date: body.nextService.date ? new Date(body.nextService.date) : null,
            mileage: body.nextService.mileage ?? null,
            label: body.nextService.label ?? null,
          }
        : null,
      notes: body.notes ?? null,
      createdAt: now,
      updatedAt: now,
    })

    return reply.status(201).send({ id: insertedId.toString() })
  })
}

export default vehicles
