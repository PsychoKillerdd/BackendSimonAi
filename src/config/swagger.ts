import swaggerJsdoc from 'swagger-jsdoc';
import pkg from '../../package.json';

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Simon Backend MVP API',
            version: pkg.version,
            description: 'API REST para el sistema de monitoreo de colmenas SimonIA',
            contact: {
                name: 'SimonIA Support',
            },
        },
        servers: [
            {
                url: 'http://localhost:3000',
                description: 'Servidor Local',
            },
            {
                url: 'https://simon-backend-mvp-1.onrender.com',
                description: 'Servidor de Producción',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
    },
    apis: ['./src/routes/*.ts', './src/controllers/*.ts'], // Rutas donde buscar anotaciones
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
