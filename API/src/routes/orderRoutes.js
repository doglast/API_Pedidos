const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// Rota POST para criar pedido
router.post('/order', orderController.createOrder);

// Nova Rota GET para buscar pedido por ID, ":id" indica que essa parte da URL é dinâmica e será passada como parâmetro
router.get('/order/:id', orderController.getOrder);

module.exports = router;