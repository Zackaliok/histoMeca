import { FastifyPluginAsync } from 'fastify'

const example: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.get('/', {
    schema: {
      tags: ['health'],
      summary: 'Route exemple',
      security: [{ bearerAuth: [] }],
      response: {
        200: { type: 'string' },
      },
    },
    preHandler: [fastify.authenticate],
  }, async function () {
    return 'this is an example'
  })
}

export default example
