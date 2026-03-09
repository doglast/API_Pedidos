const express = require('express');
const orderRoutes = require('./routes/orderRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para interpretar JSON no body da requisição
app.use(express.json());

// Registro das rotas
app.use('/', orderRoutes);

// Tratamento para rotas não encontradas (404)
app.use((req, res) => {
    res.status(404).json({ error: 'Not Found', message: 'Rota não encontrada.' });
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT} - http://localhost:${PORT}/`);
});