const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// Rota POST para criar pedido
router.post('/order', orderController.createOrder);

// Rota GET para listar TODOS os pedidos
router.get('/order/list', orderController.listOrders);

// Rota GET para buscar pedido por ID, ":id" indica que essa parte da URL é dinâmica e será passada como parâmetro
router.get('/order/:id', orderController.getOrder);

// Rota PUT para atualizar o pedido
router.put('/order/:id', orderController.updateOrder);

// Rota DELETE para excluir o pedido
router.delete('/order/:id', orderController.deleteOrder);

module.exports = router;