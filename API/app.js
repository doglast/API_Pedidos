require('dotenv').config();
const express = require('express');
const orderRoutes = require('./routes/orderRoutes');
const authController = require('./controllers/authController');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Rota PÚBLICA de login para gerar o token
app.post('/login', authController.login);

// Rotas PRIVADAS (o middleware está lá dentro do orderRoutes protegendo elas)
app.use('/', orderRoutes);

// Tratamento para rotas não encontradas (404)
app.use((req, res) => {
    res.status(404).json({ error: 'Not Found', message: 'Rota não encontrada.' });
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT} - http://localhost:${PORT}/`);
});