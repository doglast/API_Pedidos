const swaggerJSDoc = require('swagger-jsdoc');

const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'API de Gerenciamento de Pedidos',
            version: '1.0.0',
            description: 'API desenvolvida em Node.js para criação, leitura, atualização e exclusão de pedidos.',
        },
        servers: [
            {
                url: 'http://localhost:3000',
                description: 'Servidor Local',
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
        // Aplica o JWT globalmente, mas podemos sobrescrever nas rotas públicas (como o login)
        security: [{
            bearerAuth: []
        }]
    },
    // Aqui dizemos ao Swagger onde procurar pelos comentários de documentação
    apis: ['./src/routes/*.js', './src/app.js'], 
};

const swaggerDocs = swaggerJSDoc(swaggerOptions);

module.exports = swaggerDocs;