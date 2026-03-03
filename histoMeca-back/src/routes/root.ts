import { FastifyPluginAsync } from 'fastify'

const root: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.get('/', {
    schema: {
      tags: ['health'],
      summary: 'Health check',
      security: [{ bearerAuth: [] }],
      response: {
        200: {
          type: 'object',
          properties: { root: { type: 'boolean' } },
        },
      },
    },
    preHandler: [fastify.authenticate],
  }, async function () {
    return { root: true }
  })
}

export default root
