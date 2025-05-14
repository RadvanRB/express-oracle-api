import swaggerJSDoc from 'swagger-jsdoc';
import { SERVER_CONFIG } from './server';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Express Oracle API',
    version: '1.0.0',
    description: 'REST API s Express.js, TypeORM, Zod a Oracle',
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT',
    },
    contact: {
      name: 'API Support',
      url: 'https://example.com',
      email: 'support@example.com',
    },
  },
  servers: [
    {
      url: `http://localhost:${SERVER_CONFIG.port}/api`,
      description: 'Všechna API',
    },
    {
      url: `http://localhost:${SERVER_CONFIG.port}/api/app`,
      description: 'App - Uživatelé a správa aplikace',
    },
    {
      url: `http://localhost:${SERVER_CONFIG.port}/api/etlcore`,
      description: 'ETLCore - ETL metadata',
    },
    {
      url: `http://localhost:${SERVER_CONFIG.port}/api/interfaces`,
      description: 'Interfaces - Vstupní data',
    },
    {
      url: `http://localhost:${SERVER_CONFIG.port}/api/jlout`,
      description: 'JLOut - In/Out přenosy',
    },
  ],
  components: {
    schemas: {
      User: {
        type: 'object',
        required: ['firstName', 'lastName', 'email', 'password'],
        properties: {
          id: {
            type: 'integer',
            description: 'ID uživatele',
            example: 1,
          },
          firstName: {
            type: 'string',
            description: 'Jméno uživatele',
            example: 'Jan',
          },
          lastName: {
            type: 'string',
            description: 'Příjmení uživatele',
            example: 'Novák',
          },
          email: {
            type: 'string',
            description: 'Email uživatele',
            format: 'email',
            example: 'jan.novak@example.com',
          },
          password: {
            type: 'string',
            description: 'Heslo uživatele (nezobrazuje se v odpovědích)',
            example: 'Heslo123!',
            format: 'password',
          },
          phone: {
            type: 'string',
            description: 'Telefonní číslo uživatele',
            example: '+420123456789',
          },
          address: {
            type: 'string',
            description: 'Adresa uživatele',
            example: 'Pražská 123, Praha 1',
          },
          isActive: {
            type: 'boolean',
            description: 'Je uživatel aktivní?',
            example: true,
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'Datum vytvoření záznamu',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            description: 'Datum poslední aktualizace záznamu',
          },
        },
      },
      UserInput: {
        type: 'object',
        required: ['firstName', 'lastName', 'email', 'password'],
        properties: {
          firstName: {
            type: 'string',
            example: 'Jan',
          },
          lastName: {
            type: 'string',
            example: 'Novák',
          },
          email: {
            type: 'string',
            format: 'email',
            example: 'jan.novak@example.com',
          },
          password: {
            type: 'string',
            format: 'password',
            example: 'Heslo123!',
          },
          phone: {
            type: 'string',
            example: '+420123456789',
          },
          address: {
            type: 'string',
            example: 'Pražská 123, Praha 1',
          },
          isActive: {
            type: 'boolean',
            example: true,
          },
        },
      },
      UserUpdateInput: {
        type: 'object',
        properties: {
          firstName: {
            type: 'string',
            example: 'Jan',
          },
          lastName: {
            type: 'string',
            example: 'Novák',
          },
          email: {
            type: 'string',
            format: 'email',
            example: 'jan.novak@example.com',
          },
          phone: {
            type: 'string',
            example: '+420123456789',
          },
          address: {
            type: 'string',
            example: 'Pražská 123, Praha 1',
          },
          isActive: {
            type: 'boolean',
            example: true,
          },
        },
      },
      Error: {
        type: 'object',
        properties: {
          status: {
            type: 'string',
            example: 'error',
          },
          message: {
            type: 'string',
            example: 'Chybová zpráva',
          },
          errors: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                path: {
                  type: 'string',
                  example: 'email',
                },
                message: {
                  type: 'string',
                  example: 'Neplatný formát emailu',
                },
              },
            },
          },
        },
      },
    },
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
};

const options = {
  swaggerDefinition,
  apis: ['./src/routes/*.ts'], // Cesty k souborům s anotacemi Swagger
};

export const swaggerSpec = swaggerJSDoc(options);