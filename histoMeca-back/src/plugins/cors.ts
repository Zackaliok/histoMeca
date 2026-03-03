import fp from 'fastify-plugin'
import fastifyCors from '@fastify/cors'

/**
 * Plugin CORS
 * En développement : autorise localhost:5173 (front Vite) et localhost:3000 (Swagger UI)
 * En production    : restreindre ALLOWED_ORIGINS à l'URL réelle du front
 */
export default fp(async (fastify) => {
  const isDev = process.env.NODE_ENV !== 'production'

  const allowedOrigins = isDev
    ? [
        'http://localhost:5173', // Front React/Vite
        'http://127.0.0.1:5173',
        'http://localhost:3000', // Swagger UI (même origine que l'API)
        'http://127.0.0.1:3000'
      ]
    : (process.env.ALLOWED_ORIGINS ?? '').split(',').filter(Boolean)

  await fastify.register(fastifyCors, {
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
})
