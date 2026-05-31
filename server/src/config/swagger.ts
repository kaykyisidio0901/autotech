import swaggerJsdoc from 'swagger-jsdoc'

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'AutoTech Manager API',
      version: '1.0.0',
      description: 'API do sistema AutoTech Manager para gestão de lojas de som e acessórios automotivos',
      contact: { name: 'AutoTech', email: 'suporte@autotech.com.br' },
    },
    servers: [{ url: 'http://localhost:3000', description: 'Desenvolvimento' }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./src/modules/**/*.routes.ts'],
}

export const swaggerSpec = swaggerJsdoc(options)
