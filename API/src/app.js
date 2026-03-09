require('dotenv').config();
const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerDocs = require('./config/swagger'); // Importa a configuração

const orderRoutes = require('./routes/orderRoutes');
const authController = require('./controllers/authController');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Autenticação do usuário
 *     description: Retorna um token JWT para acesso às rotas protegidas.
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: admin
 *               password:
 *                 type: string
 *                 example: 123456
 *     responses:
 *       200:
 *         description: Login com sucesso. Retorna o token.
 *       401:
 *         description: Credenciais inválidas.
 */
app.post('/login', authController.login);

app.use('/', orderRoutes);

app.use((req, res) => {
    res.status(404).json({ error: 'Not Found', message: 'Rota não encontrada.' });
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log(`Documentação do Swagger disponível em http://localhost:${PORT}/api-docs`);
});